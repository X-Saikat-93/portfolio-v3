import 'server-only'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export type AdminSecurity = {
  protectOwnerAdminMutation(
    request: Request,
  ): Response | null | Promise<Response | null>
  recordAuthenticationDenial(request: Request): void
  recordPrivilegedAction(request: Request, action: string, actorId: string): void
  limitAdminMutation(request: Request, actorId: string): Promise<Response | null>
}

export function securityDenialHeaders() {
  return new Headers({
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
  })
}

function denial() {
  return new Response(null, { status: 403, headers: securityDenialHeaders() })
}

function positiveEnv(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] ?? '', 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function createRateLimiter() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    !process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  ) {
    return null
  }

  const windowSeconds = positiveEnv('ADMIN_MUTATION_RATE_LIMIT_WINDOW_SECONDS', 60)

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      positiveEnv('ADMIN_MUTATION_RATE_LIMIT_MAX_REQUESTS', 30),
      `${windowSeconds} s`,
    ),
    prefix: 'saikat:admin-mutation',
  })
}

let rateLimiter: ReturnType<typeof createRateLimiter> | undefined

function getRateLimiter() {
  if (rateLimiter !== undefined) return rateLimiter
  rateLimiter = createRateLimiter()
  return rateLimiter
}

function unavailable() {
  return new Response(null, { status: 503, headers: securityDenialHeaders() })
}

let security: AdminSecurity | undefined

export function getAdminSecurity(): AdminSecurity {
  if (security) return security

  security = {
    protectOwnerAdminMutation(request) {
      const origin = request.headers.get('origin')
      const fetchSite = request.headers.get('sec-fetch-site')
      if (!origin || origin !== new URL(request.url).origin) return denial()
      if (fetchSite && fetchSite !== 'same-origin') return denial()
      return null
    },

    recordAuthenticationDenial(_request) {},

    recordPrivilegedAction(_request, _action, _actorId) {},

    async limitAdminMutation(_request, actorId) {
      const limiter = getRateLimiter()

      // Local development may run without Upstash; production fails closed.
      if (!limiter) return process.env.NODE_ENV === 'production' ? unavailable() : null

      try {
        const result = await limiter.limit(actorId)
        if (result.success) return null

        const headers = securityDenialHeaders()
        headers.set(
          'retry-after',
          String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000))),
        )
        return new Response(null, { status: 429, headers })
      } catch {
        return unavailable()
      }
    },
  }

  return security!
}
