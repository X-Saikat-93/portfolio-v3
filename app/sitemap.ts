import type { MetadataRoute } from 'next'

import { safeListPublishedBlogPosts } from '~/lib/blog/repository'
import { cloudinaryImageUrl } from '~/lib/cloudinary/image-url'
import { safeListPublishedCollectionItems } from '~/lib/collections/repository'
import { projects } from '~/lib/projects'
import { seo } from '~/lib/seo'

// Only pages backed by dated records carry lastModified; the rest have no
// honest date to report.
function latest(dates: Date[]) {
  return dates.length ? new Date(Math.max(...dates.map(Number))) : undefined
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, books, music, photos] = await Promise.all([
    safeListPublishedBlogPosts(),
    safeListPublishedCollectionItems('book'),
    safeListPublishedCollectionItems('music'),
    safeListPublishedCollectionItems('photo'),
  ])
  const updated = (items: { updatedAt: Date }[]) => latest(items.map(({ updatedAt }) => updatedAt))
  const lastModified: Record<string, Date | undefined> = {
    '/en': updated([...posts, ...books, ...music, ...photos]),
    '/en/blog': updated(posts),
    '/en/books': updated(books),
    '/en/music': updated(music),
    '/en/photos': updated(photos),
  }
  const page = (path: string, priority: number, extra: Partial<MetadataRoute.Sitemap[number]> = {}) => ({
    url: new URL(path, seo.url).href,
    ...(lastModified[path] ? { lastModified: lastModified[path] } : {}),
    changeFrequency: 'weekly' as const,
    priority,
    ...extra,
  })

  return [
    page('/en', 1),
    ...[
      '/en/blog',
      '/en/photos',
      '/en/books',
      '/en/music',
      '/en/projects',
      '/en/resume',
      '/en/now',
      '/en/contact',
      '/en/uses',
      '/en/privacy',
      '/en/terms',
      '/en/credits',
    ].map((path) => page(path, 0.8)),
    ...posts.map((post) => {
      const cover = post.coverImagePublicId
        ? cloudinaryImageUrl(post.coverImagePublicId, { width: 1200, height: 630, crop: 'fill', format: 'jpg' })
        : null
      return page(`/en/blog/${post.slug}`, 0.7, {
        lastModified: post.updatedAt,
        changeFrequency: 'monthly',
        ...(cover ? { images: [cover] } : {}),
      })
    }),
    ...projects.map(({ id }) => page(`/en/projects/${id}`, 0.8)),
  ]
}
