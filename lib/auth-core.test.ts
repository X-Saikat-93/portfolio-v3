import { afterEach, describe, expect, it, vi } from 'vitest'

import { getAdminEmail, isBetterAuthConfigured } from './auth-core'

afterEach(() => vi.unstubAllEnvs())

describe('Better Auth configuration', () => {
  it('fails closed when the owner auth contract is incomplete', () => {
    expect(isBetterAuthConfigured()).toBe(false)
  })

  it('requires a production-length secret, URL, database, and owner email', () => {
    vi.stubEnv('BETTER_AUTH_SECRET', 'a'.repeat(32))
    vi.stubEnv('BETTER_AUTH_URL', 'https://xsaikat.vercel.app')
    vi.stubEnv('DATABASE_URL', 'postgresql://runtime:runtime@localhost:5432/saikat')
    vi.stubEnv('ADMIN_EMAIL', ' Saikat@example.com ')

    expect(isBetterAuthConfigured()).toBe(true)
    expect(getAdminEmail()).toBe('saikat@example.com')
  })
})
