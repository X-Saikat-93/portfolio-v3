import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const limit = vi.fn()
  const slidingWindow = vi.fn((maxRequests: number, window: string) => ({
    maxRequests,
    window,
  }))

  class FakeRatelimit {
    static slidingWindow = slidingWindow
    limit = limit

    constructor(_options: unknown) {}
  }

  return {
    FakeRatelimit,
    limit,
    redisFromEnv: vi.fn(() => ({})),
    slidingWindow,
  }
})

vi.mock('server-only', () => ({}))
vi.mock('@upstash/redis', () => ({
  Redis: { fromEnv: mocks.redisFromEnv },
}))
vi.mock('@upstash/ratelimit', () => ({ Ratelimit: mocks.FakeRatelimit }))

afterEach(() => {
  vi.resetModules()
  vi.resetAllMocks()
  vi.unstubAllEnvs()
})

async function loadLimiter() {
  return import('./rate-limit')
}

function enableUpstash() {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example')
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'secret')
}

describe('public contact rate limit', () => {
  it('uses the shared Upstash limiter and hashes the client address', async () => {
    enableUpstash()
    vi.stubEnv('CONTACT_RATE_LIMIT_MAX_REQUESTS', '2')
    vi.stubEnv('CONTACT_RATE_LIMIT_WINDOW_SECONDS', '60')
    mocks.limit.mockResolvedValueOnce({ success: true, reset: Date.now() + 60_000 })

    const { limitContactSubmission } = await loadLimiter()
    const response = await limitContactSubmission(
      new Request('https://site.test/api/contact', {
        headers: { 'x-forwarded-for': '203.0.113.10, 203.0.113.11' },
      }),
    )

    expect(response).toBeNull()
    expect(mocks.redisFromEnv).toHaveBeenCalledOnce()
    expect(mocks.slidingWindow).toHaveBeenCalledWith(2, '60 s')
    expect(mocks.limit).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/))
    expect(mocks.limit).not.toHaveBeenCalledWith('203.0.113.10')
  })

  it('returns retry-after when Upstash denies a submission', async () => {
    enableUpstash()
    mocks.limit.mockResolvedValueOnce({
      success: false,
      reset: Date.now() + 5_000,
    })

    const { limitContactSubmission } = await loadLimiter()
    const response = await limitContactSubmission(
      new Request('https://site.test/api/contact'),
    )

    expect(response?.status).toBe(429)
    expect(Number(response?.headers.get('retry-after'))).toBeGreaterThanOrEqual(1)
  })

  it('fails closed in production without Upstash configuration', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const { limitContactSubmission } = await loadLimiter()
    const response = await limitContactSubmission(
      new Request('https://site.test/api/contact'),
    )

    expect(response?.status).toBe(503)
  })
})
