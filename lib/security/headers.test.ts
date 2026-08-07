import { afterEach, describe, expect, it, vi } from 'vitest'

import { securityHeaders } from './headers'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('site security headers', () => {
  it('sets a restrictive browser security baseline for every route', () => {
    const headers = Object.fromEntries(
      securityHeaders.map(({ key, value }) => [key.toLowerCase(), value]),
    )

    expect(headers['content-security-policy']).toContain("default-src 'self'")
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'")
    expect(headers['content-security-policy']).toContain("object-src 'none'")
    expect(headers['content-security-policy']).toContain("base-uri 'self'")
    expect(headers['content-security-policy']).toContain("form-action 'self'")
    expect(headers['content-security-policy']).toContain("script-src 'self' 'unsafe-inline'")
    expect(headers['content-security-policy']).toContain('https://res.cloudinary.com')
    expect(headers['content-security-policy']).toContain('https://api.cloudinary.com')
    expect(headers['content-security-policy']).not.toContain('https://www.google.com')
    expect(headers['content-security-policy']).not.toContain('fontshare.com')
    expect(headers['content-security-policy']).not.toContain("'unsafe-eval'")
    expect(headers['strict-transport-security']).toBe(
      'max-age=63072000; includeSubDomains; preload',
    )
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['permissions-policy']).toContain('camera=()')
    expect(headers['permissions-policy']).toContain('microphone=()')
    expect(headers['permissions-policy']).toContain('payment=()')
  })

  it('keeps the admin policy same-origin and provider-neutral', async () => {
    const { adminSecurityHeader } = await import('./headers')

    expect(adminSecurityHeader.value).toContain("script-src 'self' 'unsafe-inline'")
    expect(adminSecurityHeader.value).toContain(
      "connect-src 'self' https://api.cloudinary.com",
    )
  })

})
