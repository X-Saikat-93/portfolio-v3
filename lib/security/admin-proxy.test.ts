import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { proxy, siteProxy } from '../../proxy'
import { securityHeaders } from './headers'

describe('admin CSP', () => {
  // The per-request nonce policy was retired in July 2026: nonces require
  // dynamic rendering, which is incompatible with the admin's prerendered
  // instant-navigation shells. Admin pages rely on the static site policy
  // configured in next.config.
  it('stamps no per-request policy in the proxy', () => {
    const response = siteProxy(new NextRequest('https://xsaikat.vercel.app/admin/media'))

    expect(response.headers.get('content-security-policy')).toBeNull()
    expect(response.headers.get('x-middleware-request-x-nonce')).toBeNull()
  })

  it('keeps the static site policy strict and nonce-free', () => {
    const policy = securityHeaders.find(
      ({ key }) => key === 'Content-Security-Policy',
    )?.value

    expect(policy).toContain("script-src 'self' 'unsafe-inline'")
    expect(policy).toContain("frame-src 'none'")
    expect(policy).toContain("object-src 'none'")
    expect(policy).not.toContain('nonce-')
    expect(policy).not.toContain('strict-dynamic')
  })

  it('redirects protected admin pages without a session cookie', () => {
    const response = proxy(
      new NextRequest('https://xsaikat.vercel.app/admin/media'),
      {} as never,
    )

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe(
      'https://xsaikat.vercel.app/admin/login?next=%2Fadmin%2Fmedia',
    )
  })

  it('leaves the public admin login route unprotected', () => {
    const response = proxy(
      new NextRequest('https://xsaikat.vercel.app/admin/login'),
      {} as never,
    )

    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('does not expose cloned public image assets', () => {
    const response = siteProxy(
      new NextRequest('https://xsaikat.vercel.app/images/books/build.jpg'),
    )

    expect(response.status).toBe(404)
  })

})
