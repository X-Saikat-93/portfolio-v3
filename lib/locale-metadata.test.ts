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
})
