import type { MetadataRoute } from 'next'

import { seo } from '~/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // API routes are form and admin endpoints, never pages to index
      disallow: ['/admin', '/api/'],
    },
    sitemap: new URL('/sitemap.xml', seo.url).href,
    host: seo.url.origin,
  }
}
