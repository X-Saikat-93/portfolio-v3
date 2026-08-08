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
    '/blog/not_a_post',
    '/en/blog/Not-A-Post',
  ])('rewrites a malformed content route before streaming: %s', (pathname) => {
    const response = siteProxy(new NextRequest(`https://xsaikat.vercel.app${pathname}`))

    expect(response.status).toBe(404)
    expect(response.headers.get('x-middleware-rewrite')).toBe(
      'https://xsaikat.vercel.app/_not-found',
    )
  })

  it.each([
    '/blog/the-quiet-work-of-making-a-portfolio-honest',
    '/en/blog/the-quiet-work-of-making-a-portfolio-honest',
  ])('allows a seeded post route: %s', (pathname) => {
    const response = siteProxy(new NextRequest(`https://xsaikat.vercel.app${pathname}`))

    expect(response.status).toBe(200)
    expect(response.headers.get('x-middleware-next')).toBe('1')
    expect(response.headers.has('x-middleware-rewrite')).toBe(false)
  })

  it.each([
    '/blog/old_post',
    '/en/blog/old_post',
  ])('blocks malformed content routes without an auth provider: %s', async (pathname) => {
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
    '/blog/not-yet-seeded',
    '/en/blog/not-yet-seeded',
  ])('lets a valid DB-backed slug reach the page: %s', (pathname) => {
    const response = siteProxy(new NextRequest(`https://xsaikat.vercel.app${pathname}`))

    expect(response.status).toBe(200)
    expect(response.headers.get('x-middleware-next')).toBe('1')
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
