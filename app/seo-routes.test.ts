import { describe, expect, it } from 'vitest'

import { buildEnglishFeedXml } from '~/lib/feeds'
import { seo } from '~/lib/seo'

import robots from './robots'
import sitemap from './sitemap'

describe('localized discovery routes', () => {
  it('publishes an explicit crawler policy for public and private surfaces', () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/admin'],
      },
      sitemap: new URL('/sitemap.xml', seo.url).href,
      host: seo.url.origin,
    })
  })

  it('publishes an empty English feed until a real post is supplied', () => {
    const xml = buildEnglishFeedXml()

    expect(xml).toContain(`<atom:link href="${new URL('/en/feed.xml', seo.url).href}" rel="self"`)
    expect(xml).toContain(`<link>${new URL('/en', seo.url).href}</link>`)
    expect(xml).not.toContain('<item>')
  })

  it('publishes only the English public routes', () => {
    const entries = sitemap()
    expect(entries.map(({ url }) => url)).toEqual([
      ...['/en', '/en/blog', '/en/photos', '/en/books', '/en/music', '/en/projects', '/en/resume', '/en/contact'].map(
        (path) => new URL(path, seo.url).href,
      ),
    ])
  })
})
