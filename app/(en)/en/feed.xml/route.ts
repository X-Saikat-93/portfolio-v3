import { cacheLife, cacheTag } from 'next/cache'

import { buildEnglishFeedXml } from '~/lib/feeds'
import { safeListPublishedBlogPosts } from '~/lib/blog/repository'

async function getEnglishFeedXml() {
  'use cache'
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 })
  cacheTag('blog-posts')

  return buildEnglishFeedXml(await safeListPublishedBlogPosts())
}

export async function GET() {
  return new Response(await getEnglishFeedXml(), {
    headers: {
      'cache-control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
      'content-type': 'application/rss+xml; charset=utf-8',
      'x-content-type-options': 'nosniff',
    },
  })
}
