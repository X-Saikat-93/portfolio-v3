import { toNextJsHandler } from 'better-auth/next-js'
import { connection } from 'next/server'

import { getAuth, isBetterAuthConfigured } from '~/lib/auth'
import { createRequestLimiter, limitRequest } from '~/lib/rate-limit'

// Durable sliding window per client address; fail-open so a Redis hiccup
// never locks the owner out of the admin.
const authRequestLimiter = createRequestLimiter({
  prefix: 'saikat:auth',
  maxRequestsEnv: 'AUTH_RATE_LIMIT_MAX_REQUESTS',
  windowSecondsEnv: 'AUTH_RATE_LIMIT_WINDOW_SECONDS',
  maxRequests: 20,
  windowSeconds: 600,
})

function unavailable() {
  return Response.json(
    { error: 'auth_unavailable' },
    { status: 503, headers: { 'cache-control': 'no-store' } },
  )
}

function handlers() {
  if (!isBetterAuthConfigured()) return null
  return toNextJsHandler(getAuth())
}

export async function GET(request: Request) {
  await connection()
  return handlers()?.GET(request) ?? unavailable()
}

export async function POST(request: Request) {
  await connection()
  const limited = await limitRequest(request, authRequestLimiter, { failOpen: true })
  if (limited) return limited
  return handlers()?.POST(request) ?? unavailable()
}
