import 'server-only'

import { createHash } from 'node:crypto'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function positiveEnv(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] ?? '', 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function denialHeaders() {
  return new Headers({
    'cache-control': 'no-store',
    'referrer-policy': 'no-referrer',
  })
}

export function requestIdentifier(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const address = forwarded || request.headers.get('x-real-ip')?.trim() || 'unknown'
  return createHash('sha256').update(address).digest('hex')
}

export type RequestLimiter = {
  prefix: string
  maxRequests: number
  windowSeconds: number
  limit: (identifier: string) => Promise<{ success: boolean; reset: number }>
}

const limiterCache = new Map<string, RequestLimiter | null>()

export function createRequestLimiter(options: {
  prefix: string
  maxRequestsEnv: string
  windowSecondsEnv: string
  maxRequests: number
  windowSeconds: number
}): RequestLimiter | null {
  const cached = limiterCache.get(options.prefix)
  if (cached !== undefined) return cached

  let limiter: RequestLimiter | null = null
  if (
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  ) {
    const maxRequests = positiveEnv(options.maxRequestsEnv, options.maxRequests)
    const windowSeconds = positiveEnv(options.windowSecondsEnv, options.windowSeconds)
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
      prefix: options.prefix,
    })
    limiter = {
      prefix: options.prefix,
      maxRequests,
      windowSeconds,
      limit: (identifier) => ratelimit.limit(identifier),
    }
  }

  limiterCache.set(options.prefix, limiter)
  return limiter
}

export async function limitRequest(
  request: Request,
  limiter: RequestLimiter | null,
  { failOpen = false }: { failOpen?: boolean } = {},
): Promise<Response | null> {
  if (!limiter) return failOpen ? null : new Response(null, { status: 503, headers: denialHeaders() })

  try {
    const result = await limiter.limit(requestIdentifier(request))
    if (result.success) return null

    const responseHeaders = denialHeaders()
    responseHeaders.set(
      'retry-after',
      String(Math.max(1, Math.ceil((result.reset - Date.now()) / 1_000))),
    )
    return new Response(null, { status: 429, headers: responseHeaders })
  } catch {
    return failOpen ? null : new Response(null, { status: 503, headers: denialHeaders() })
  }
}
