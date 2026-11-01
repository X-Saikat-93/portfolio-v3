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
      site: '@Actually_Das',
      creator: '@Actually_Das',
      title: 'A post',
      description: 'An English summary',
      images: [
        {
          url: new URL('/og?locale=en&path=%2Fblog%2Fa-post&v=v5', seo.url),
          width: 1200,
          height: 630,
          alt: 'A post · Saikat Das',
          type: 'image/jpeg',
        },
      ],
    })
  })

  it('describes the line the home social card prints', () => {
    const metadata = localeMetadata({
      locale: 'en',
      path: '/',
      title: 'Saikat Das | Full-Stack Software Engineer',
      description: 'A search description the card does not print.',
    })

    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        alt:
          'Saikat Das · Full-Stack Software Engineer. I build software that stays calm on a bad network. Web products, APIs, and data systems, from architecture to production.',
      }),
    ])
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

  it('advertises the English writing feed from the homepage and writing pages', () => {
    for (const path of ['/', '/blog', '/blog/a-post']) {
      const metadata = localeMetadata({
        locale: 'en',
        path,
        title: 'Saikat Das | Full-Stack Software Engineer',
        description: 'A full-stack software engineer portfolio.',
      })

      expect(metadata.alternates?.types, path).toEqual({
        'application/rss+xml': [
          {
            url: new URL('/en/feed.xml', seo.url).href,
            title: 'Saikat Das | Full-Stack Software Engineer — Writing',
          },
        ],
      })
    }

    expect(
      localeMetadata({ locale: 'en', path: '/projects', title: 'Projects', description: 'Work.' }).alternates
        ?.types,
    ).toBeUndefined()
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
        url: new URL('/og?locale=en&path=' + encodeURIComponent(path) + '&v=v5', seo.url),
        alt: `${path.slice(1)} · Saikat Das. A page description`,
      })
    }
  })

  it('describes a section card by the headline it prints', () => {
    const metadata = localeMetadata({
      locale: 'en',
      path: '/now',
      title: 'Now: Current Work and Reading',
      heading: 'Now',
      description: 'A page description',
    })
    const images = metadata.openGraph?.images
    const image = Array.isArray(images) ? images[0] : images

    expect(metadata.title).toBe('Now: Current Work and Reading')
    expect(image).toMatchObject({ alt: 'Now · Saikat Das. A page description' })
  })
})
