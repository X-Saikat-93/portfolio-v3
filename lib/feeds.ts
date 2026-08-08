import RSS from 'rss'

import type { BlogPost } from '~/lib/blog/repository'
import { seoEn } from '~/lib/seo'

export function buildEnglishFeedXml(posts: BlogPost[] = []) {
  const siteUrl = new URL('/en', seoEn.url).href

  const feed = new RSS({
    title: seoEn.title,
    description: seoEn.description,
    site_url: siteUrl,
    feed_url: new URL('/en/feed.xml', seoEn.url).href,
    language: 'en-US',
    generator: 'PHP 9.0',
  })

  for (const post of posts) {
    const url = new URL(`/en/blog/${post.slug}`, seoEn.url).href
    feed.item({
      title: post.title,
      description: post.description,
      url,
      guid: url,
      date: post.publishedAt,
      author: 'Saikat Das',
      categories: [post.category],
    })
  }

  return feed.xml()
}
