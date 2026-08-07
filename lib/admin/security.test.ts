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

async function loadSecurity() {
  return (await import('./security')).getAdminSecurity()
}

function enableUpstash() {
  vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://redis.example')
  vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'secret')
}

describe('admin security', () => {
  it('rejects missing and cross-origin mutation requests', async () => {
    const security = await loadSecurity()

    expect(
      security.protectOwnerAdminMutation(
        new Request('https://site.test/api/admin/cms', { method: 'POST' }),
      ),
    ).toMatchObject({ status: 403 })
    expect(
      security.protectOwnerAdminMutation(
        new Request('https://site.test/api/admin/cms', {
          method: 'POST',
          headers: { origin: 'https://attacker.test' },
        }),
      ),
    ).toMatchObject({ status: 403 })
  })

  it('uses the shared Upstash limiter and returns retry-after when denied', async () => {
    enableUpstash()
    const reset = Date.now() + 5_000
    mocks.limit.mockResolvedValueOnce({ success: false, reset })

    const security = await loadSecurity()
    const response = await security.limitAdminMutation(
      new Request('https://site.test/api/admin/cms', { method: 'POST' }),
      'user_owner',
    )

    expect(mocks.redisFromEnv).toHaveBeenCalledOnce()
    expect(mocks.slidingWindow).toHaveBeenCalledWith(30, '60 s')
    expect(mocks.limit).toHaveBeenCalledWith('user_owner')
    expect(response?.status).toBe(429)
    expect(Number(response?.headers.get('retry-after'))).toBeGreaterThanOrEqual(1)
  })

  it('fails closed when the shared limiter is unavailable', async () => {
    enableUpstash()
    mocks.limit.mockRejectedValueOnce(new Error('Upstash unavailable'))

    const security = await loadSecurity()
    const response = await security.limitAdminMutation(
      new Request('https://site.test/api/admin/cms', { method: 'POST' }),
      'user_owner',
    )

    expect(response?.status).toBe(503)
  })

  it('fails closed in production when Upstash is not configured', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const security = await loadSecurity()
    const response = await security.limitAdminMutation(
      new Request('https://site.test/api/admin/cms', { method: 'POST' }),
      'user_owner',
    )

    expect(response?.status).toBe(503)
  })

  it('allows local development without a Redis service', async () => {
    vi.stubEnv('NODE_ENV', 'test')

    const security = await loadSecurity()
    await expect(
      security.limitAdminMutation(
        new Request('https://site.test/api/admin/cms', { method: 'POST' }),
        'user_owner',
      ),
    ).resolves.toBeNull()
  })
})
