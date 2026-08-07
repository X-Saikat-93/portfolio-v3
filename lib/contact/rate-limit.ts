import 'server-only'

import { createHash } from 'node:crypto'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function positiveEnv(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] ?? '', 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function headers() {
  return new Headers({
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
  })
}

function unavailable() {
  return new Response(null, { status: 503, headers: headers() })
}

function createRateLimiter() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL?.trim() ||
    !process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  ) {
    return null
  }

  const windowSeconds = positiveEnv('CONTACT_RATE_LIMIT_WINDOW_SECONDS', 3_600)
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(
      positiveEnv('CONTACT_RATE_LIMIT_MAX_REQUESTS', 5),
      `${windowSeconds} s`,
    ),
    prefix: 'saikat:contact',
  })
}

let rateLimiter: ReturnType<typeof createRateLimiter> | undefined

function getRateLimiter() {
  if (rateLimiter !== undefined) return rateLimiter
  rateLimiter = createRateLimiter()
  return rateLimiter
}

function requestIdentifier(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const address = forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown'
  return createHash('sha256').update(address).digest('hex')
}

export async function limitContactSubmission(request: Request) {
  const limiter = getRateLimiter()
  if (!limiter) return process.env.NODE_ENV === 'production' ? unavailable() : null

  try {
    const result = await limiter.limit(requestIdentifier(request))
    if (result.success) return null

    const responseHeaders = headers()
    responseHeaders.set(
      'retry-after',
      String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000))),
    )
    return new Response(null, { status: 429, headers: responseHeaders })
  } catch {
    return unavailable()
  }
}
