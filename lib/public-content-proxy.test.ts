import { NextRequest } from 'next/server'
import type { NextFetchEvent } from 'next/server'
import { describe, expect, it } from 'vitest'

import { proxy, siteProxy } from '../proxy'

const event = {
  passThroughOnException() {},
  waitUntil() {},
} as unknown as NextFetchEvent

describe('public content proxy', () => {
  it('redirects the unlocalized root before a page segment renders', () => {
    const response = siteProxy(new NextRequest('https://xsaikat.vercel.app/'))

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://xsaikat.vercel.app/en')
  })

  it.each([
    '/blog/not-a-published-post',
    '/en/blog/not-a-published-post',
  ])('rewrites an unknown content route before streaming: %s', (pathname) => {
    const response = siteProxy(new NextRequest(`https://xsaikat.vercel.app${pathname}`))

    expect(response.status).toBe(404)
    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://xsaikat.vercel.app/_not-found',
    )
  })

  it.each([
    '/blog/old-post',
    '/en/blog/old-post',
  ])('blocks cloned content routes without an auth provider: %s', async (pathname) => {
    const response = await proxy(
      new NextRequest(`https://xsaikat.vercel.app${pathname}`),
      event,
    )

    expect(response?.status).toBe(404)
    expect(response?.headers.get('x-middleware-rewrite')).toBe(
      'https://xsaikat.vercel.app/_not-found',
    )
  })

  it.each([
    '/blog/opengraph-image-generated',
    '/en/blog/opengraph-image-generated',
  ])('does not mistake a generated metadata route for a post slug: %s', (pathname) => {
    const response = siteProxy(new NextRequest(`https://xsaikat.vercel.app${pathname}`))

    expect(response.status).toBe(200)
    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.has('x-middleware-rewrite')).toBe(false)
  })
})
