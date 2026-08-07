import type { MetadataRoute } from 'next'

import { seo } from '~/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/en', '/en/blog', '/en/photos', '/en/books', '/en/music', '/en/projects', '/en/resume', '/en/contact'].map((path) => ({
    url: new URL(path, seo.url).href,
  }))
}
