import { describe, expect, it } from 'vitest'

import nextConfig from '../next.config'

describe('server output tracing', () => {
  it('packages the OG font dependencies for the runtime route', () => {
    expect(nextConfig.outputFileTracingIncludes).toMatchObject({
      '/og': ['./app/_fonts/FrexSansGB-OG-*.ttf'],
    })
  })
})

describe('route security headers', () => {
  it('keeps public fonts self-hosted across every route', async () => {
    const rules = await nextConfig.headers!()
    const globalPolicy = rules
      .find(({ source }) => source === '/:path*')
      ?.headers.find(({ key }) => key === 'Content-Security-Policy')?.value

    expect(globalPolicy).toContain("font-src 'self' data:")
  })

  it('keeps the owner policy separate from the public policy', async () => {
    const rules = await nextConfig.headers!()
    const globalPolicy = rules
      .find(({ source }) => source === '/:path*')
      ?.headers.find(({ key }) => key === 'Content-Security-Policy')?.value
    expect(globalPolicy).toContain("form-action 'self'")
    expect(rules).toContainEqual(
      expect.objectContaining({ source: '/admin/:path*' }),
    )
  })
})
