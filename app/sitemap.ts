import type { MetadataRoute } from 'next'

import { safeListPublishedBlogPosts } from '~/lib/blog/repository'
import { projects } from '~/lib/projects'
import { seo } from '~/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await safeListPublishedBlogPosts()
  const postsBySlug = new Map(posts.map((post) => [post.slug, post]))
  const postSlugs = new Set(posts.map(({ slug }) => slug))
  const paths = [
    '/en',
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
    ...[...postSlugs].map((slug) => `/en/blog/${slug}`),
    ...projects.map(({ id }) => `/en/projects/${id}`),
  ]

  return paths.map((path) => {
    const slug = path.startsWith('/en/blog/') ? path.slice('/en/blog/'.length) : null
    const post = slug ? postsBySlug.get(slug) : null
    return {
      url: new URL(path, seo.url).href,
      ...(post ? { lastModified: post.updatedAt } : {}),
      changeFrequency: slug ? ('monthly' as const) : path === '/en' ? ('weekly' as const) : ('weekly' as const),
      priority: path === '/en' ? 1 : slug ? 0.7 : 0.8,
    }
  })
}
