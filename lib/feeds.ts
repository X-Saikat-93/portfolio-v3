import RSS from 'rss'

import type { BlogPost } from '~/lib/blog/repository'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { seoEn } from '~/lib/seo'

function formatFeedXml(xml: string) {
  return (
    xml
      .replace(/^(<\?xml[^?]*\?>)(<rss)/, '$1\n$2')
      .trimEnd() + '\n'
  )
}

export function buildEnglishFeedXml(posts: BlogPost[] = []) {
  const siteUrl = new URL('/en/blog', seoEn.url).href
  const feedUrl = new URL('/en/feed.xml', seoEn.url).href
  const latestPublishedAt = posts.reduce<Date | undefined>(
    (latest, post) => (!latest || post.publishedAt > latest ? post.publishedAt : latest),
    undefined,
  )
  const latestUpdatedAt = posts.reduce<Date | undefined>(
    (latest, post) => (!latest || post.updatedAt > latest ? post.updatedAt : latest),
    undefined,
  )

  const feed = new RSS({
    title: seoEn.title + ' — ' + publicPageMetadata.blog.en.title,
    description: publicPageMetadata.blog.en.description,
    site_url: siteUrl,
    feed_url: feedUrl,
    language: 'en-US',
    generator: 'Saikat Das Portfolio',
    docs: 'https://www.rssboard.org/rss-specification',
    ttl: 300,
    pubDate: latestPublishedAt,
  })

  for (const post of posts) {
    const url = new URL(`/en/blog/${post.slug}`, seoEn.url).href
    feed.item({
      title: post.title,
      description: post.description,
      url,
      date: post.publishedAt,
      author: 'Saikat Das',
      categories: [post.category],
    })
  }

  const xml = formatFeedXml(feed.xml({ indent: '  ' }))
  if (!latestUpdatedAt) return xml

  return xml.replace(
    /<lastBuildDate>[^<]*<\/lastBuildDate>/,
    '<lastBuildDate>' + latestUpdatedAt.toUTCString() + '</lastBuildDate>',
  )
}
