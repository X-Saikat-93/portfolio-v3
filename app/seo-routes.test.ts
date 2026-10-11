import { describe, expect, it, vi } from 'vitest'

import { buildEnglishFeedXml } from '~/lib/feeds'
import { projects } from '~/lib/projects'
import { seo } from '~/lib/seo'

import robots from './robots'
import sitemap from './sitemap'

vi.mock('~/lib/blog/repository', () => ({
  safeListPublishedBlogPosts: async () => [],
}))

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

  it('publishes real English writing in the feed', () => {
    const xml = buildEnglishFeedXml([
      {
        id: 'post-id',
        slug: 'a-real-post',
        title: 'A real post',
        description: 'A real description',
        keywords: [],
        body: 'Body',
        category: 'Notes',
        readingMinutes: 4,
        coverImagePublicId: null,
        coverImageAlt: '',
        publishedAt: new Date('2026-08-01T12:00:00+05:30'),
        updatedAt: new Date('2026-08-01T12:00:00+05:30'),
      },
    ])

    expect(xml).toContain(`<atom:link href="${new URL('/en/feed.xml', seo.url).href}" rel="self"`)
    expect(xml).toContain(`<link>${new URL('/en/blog', seo.url).href}</link>`)
    expect(xml).toContain('<item>')
    expect(xml).toMatch(/^<\?xml version="1\.0" encoding="UTF-8"\?>\n<rss\b[^>]*\bversion="2\.0"/)
    expect(xml).toContain('\n  <channel>')
    expect(xml).toContain('\n    <item>')
    expect(xml).toMatch(/\n<\/rss>\n$/)
    expect(xml).toContain('<title><![CDATA[Saikat Das | Full-Stack Product Engineer — Writing]]></title>')
    expect(xml).toContain('<generator>Saikat Das Portfolio</generator>')
    expect(xml).toContain('<docs>https://www.rssboard.org/rss-specification</docs>')
    expect(xml).toContain('<pubDate>Sat, 01 Aug 2026 06:30:00 GMT</pubDate>')
    expect(xml).toContain('<title><![CDATA[A real post]]></title>')
    expect(xml).toContain('<guid isPermaLink="true">' + new URL('/en/blog/a-real-post', seo.url).href + '</guid>')
    expect(xml).toContain('<dc:creator><![CDATA[Saikat Das]]></dc:creator>')
    expect(xml).toContain('<category><![CDATA[Notes]]></category>')
  })

  it('publishes only the English public routes', async () => {
    const entries = await sitemap()
    expect(entries.map(({ url }) => url)).toEqual([
      ...['/en', '/en/blog', '/en/photos', '/en/books', '/en/music', '/en/projects', '/en/resume', '/en/now', '/en/contact', '/en/uses', '/en/privacy'].map(
        (path) => new URL(path, seo.url).href,
      ),
      ...projects.map(({ id }) => new URL(`/en/projects/${id}`, seo.url).href),
    ])
  })
})
