import { describe, expect, it, vi } from 'vitest'

const ogMocks = vi.hoisted(() => ({
  createHomeOgImage: vi.fn(async () => new Response('home-image')),
  createSectionOgImage: vi.fn(async (section: string) => new Response(`${section}-image`)),
}))

vi.mock('~/lib/og-image', () => ogMocks)

import { GET } from './og/route'

function requestFor(path: string, locale = 'en') {
  const url = new URL('http://localhost/og')
  url.searchParams.set('locale', locale)
  url.searchParams.set('path', path)
  return new Request(url)
}

describe('OG image route', () => {
  it('serves every public English page preview', async () => {
    for (const path of [
      '/',
      '/en',
      '/blog',
      '/photos',
      '/books',
      '/music',
      '/projects',
      '/now',
      '/resume',
      '/contact',
      '/privacy',
    ]) {
      const response = await GET(requestFor(path))

      expect(response.status, path).toBe(200)
      expect(response.headers.get('cache-control')).toContain('31536000')
    }

    expect(ogMocks.createHomeOgImage).toHaveBeenCalledTimes(2)
    expect(ogMocks.createSectionOgImage).toHaveBeenCalledTimes(9)
  })

  it('does not generate previews for unknown or non-English routes', async () => {
    expect((await GET(requestFor('/unknown'))).status).toBe(404)
    expect((await GET(requestFor('/blog/not_a_published_post'))).status).toBe(404)
    expect((await GET(requestFor('/privacy', 'zh'))).status).toBe(404)
  })
})
