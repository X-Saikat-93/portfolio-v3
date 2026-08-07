import { toNextJsHandler } from 'better-auth/next-js'
import { connection } from 'next/server'

import { getAuth, isBetterAuthConfigured } from '~/lib/auth'

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
  return handlers()?.POST(request) ?? unavailable()
}
