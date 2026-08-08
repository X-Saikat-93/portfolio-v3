import 'server-only'

import { and, desc, eq } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'

import { getDatabase } from '~/db'
import { cmsEntries } from '~/db/schema'

export type BlogPost = {
  id: string
  slug: string
  title: string
  description: string
  keywords: string[]
  body: string
  category: string
  readingMinutes: number
  coverImagePublicId: string | null
  coverImageAlt: string
  publishedAt: Date
  updatedAt: Date
}

function toBlogPost(entry: typeof cmsEntries.$inferSelect): BlogPost {
  return {
    id: entry.id,
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    keywords: Array.isArray(entry.seoKeywords) ? entry.seoKeywords : [],
    body: entry.body,
    category: entry.category,
    readingMinutes: entry.readingMinutes,
    coverImagePublicId: entry.coverImagePublicId,
    coverImageAlt: entry.coverImageAlt,
    publishedAt: entry.publishedAt ?? entry.updatedAt,
    updatedAt: entry.updatedAt,
  }
}

export async function listPublishedBlogPosts() {
  const entries = await getDatabase()
    .select()
    .from(cmsEntries)
    .where(eq(cmsEntries.status, 'published'))
    .orderBy(desc(cmsEntries.publishedAt), desc(cmsEntries.updatedAt))

  return entries.map(toBlogPost)
}

export async function getPublishedBlogPost(slug: string) {
  const [entry] = await getDatabase()
    .select()
    .from(cmsEntries)
    .where(and(eq(cmsEntries.slug, slug), eq(cmsEntries.status, 'published')))
    .limit(1)

  return entry ? toBlogPost(entry) : null
}

export async function safeListPublishedBlogPosts() {
  'use cache'
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 })
  cacheTag('blog-posts')

  try {
    return await listPublishedBlogPosts()
  } catch {
    return [] as BlogPost[]
  }
}

export async function safeGetPublishedBlogPost(slug: string) {
  'use cache'
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 })
  cacheTag('blog-posts', `blog-post:${slug}`)

  try {
    return await getPublishedBlogPost(slug)
  } catch {
    return null
  }
}
