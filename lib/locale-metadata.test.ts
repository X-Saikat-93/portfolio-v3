import { describe, expect, it } from 'vitest'

import { localeMetadata } from './locale-metadata'
import { seo } from './seo'

describe('localeMetadata', () => {
  it('builds English-only canonical metadata from an unlocalized path', () => {
    const metadata = localeMetadata({
      locale: 'en',
      path: '/blog/a-post',
      title: 'A post',
      description: 'An English summary',
    })

    expect(metadata.alternates?.canonical).toEqual(new URL('/en/blog/a-post', seo.url))
    expect(metadata.openGraph).toMatchObject({
      title: 'A post',
      description: 'An English summary',
      locale: 'en_US',
      type: 'website',
      url: new URL('/en/blog/a-post', seo.url),
    })
    expect(metadata.authors).toEqual([
      { name: 'Saikat Das', url: new URL('/en', seo.url) },
    ])
    expect(metadata.creator).toBe('Saikat Das')
    expect(metadata.publisher).toBe('Saikat Das')
    expect(metadata.twitter).toEqual({
      card: 'summary_large_image',
      title: 'A post',
      description: 'An English summary',
      images: [
        {
          url: new URL('/og?locale=en&path=%2Fblog%2Fa-post', seo.url),
          width: 1200,
          height: 630,
          alt: 'A post · Saikat Das',
          type: 'image/png',
        },
      ],
    })
  })

  it('does not double an existing English locale prefix', () => {
    const metadata = localeMetadata({
      locale: 'en',
      path: '/en/blog/a-post',
      title: 'A post',
      description: 'An English summary',
    })

    expect(metadata.alternates?.canonical).toEqual(new URL('/en/blog/a-post', seo.url))
    expect(metadata.openGraph?.url).toEqual(new URL('/en/blog/a-post', seo.url))
  })

  it('points utility pages at a valid Saikat Das OG route', () => {
    for (const path of ['/contact', '/resume', '/now', '/privacy']) {
      const metadata = localeMetadata({
        locale: 'en',
        path,
        title: path.slice(1),
        description: 'A page description',
      })

      const images = metadata.openGraph?.images
      const image = Array.isArray(images) ? images[0] : images

      expect(image).toMatchObject({
        url: new URL(`/og?locale=en&path=${encodeURIComponent(path)}`, seo.url),
        alt: `${path.slice(1)} · Saikat Das. A page description`,
      })
    }
  })
})
