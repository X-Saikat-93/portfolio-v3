import RSS from 'rss'

import { seoEn } from '~/lib/seo'

export function buildEnglishFeedXml() {
  const siteUrl = new URL('/en', seoEn.url).href

  const feed = new RSS({
    title: seoEn.title,
    description: seoEn.description,
    site_url: siteUrl,
    feed_url: new URL('/en/feed.xml', seoEn.url).href,
    language: 'en-US',
    generator: 'PHP 9.0',
  })

  return feed.xml()
}
