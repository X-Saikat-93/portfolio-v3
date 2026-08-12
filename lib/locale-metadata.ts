import type { Metadata } from 'next'

import type { Locale } from './locale-route'
import { localePath } from './locale-route'
import { seo } from './seo'

interface LocaleMetadataOptions {
  locale: Locale
  path: string
  title: string
  description: string
  type?: 'article' | 'website'
}

const SOCIAL_IMAGE_VERSION = process.env.VERCEL_GIT_COMMIT_SHA
  ? 'v3-' + process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 12)
  : 'v3'
const SECTION_IMAGE_PATHS = new Set([
  '/blog',
  '/photos',
  '/books',
  '/music',
  '/projects',
  '/now',
  '/resume',
  '/contact',
  '/privacy',
])

export function socialImageUrl(locale: Locale, path: string) {
  const url = new URL('/og', seo.url)
  url.searchParams.set('locale', locale)
  url.searchParams.set('path', path)
  if (SOCIAL_IMAGE_VERSION) url.searchParams.set('v', SOCIAL_IMAGE_VERSION)
  return url
}

export function localeRoutePair(path: string) {
  const en = new URL(localePath('en', path), seo.url)

  return {
    zh: en,
    en,
    languages: {
      en: en.href,
      'x-default': en.href,
    },
  }
}

/** Build server-rendered metadata for one side of a Chinese/English route pair. */
export function localeMetadata({
  locale,
  path,
  title,
  description,
  type = 'website',
}: LocaleMetadataOptions): Metadata {
  const pair = localeRoutePair(path)
  const canonical = pair.en
  const sentenceSeparator = '. '
  const image = {
    url: socialImageUrl(locale, path),
    width: 1200,
    height: 630,
    alt:
      path === '/'
        ? `${title}${sentenceSeparator}${description}`
        : SECTION_IMAGE_PATHS.has(path)
          ? `${title} · Saikat Das${sentenceSeparator}${description}`
        : `${title} · Saikat Das`,
    type: 'image/png',
  }

  return {
    title,
    description,
    authors: [{ name: 'Saikat Das', url: new URL('/en', seo.url) }],
    creator: 'Saikat Das',
    publisher: 'Saikat Das',
    alternates: {
      canonical,
      languages: pair.languages,
      ...(path === '/'
        ? {
            types: {
              'application/rss+xml': new URL('/en/feed.xml', seo.url).href,
            },
          }
        : {}),
    },
    openGraph: {
      title,
      description,
      type,
      locale: 'en_US',
      siteName: 'Saikat Das',
      url: canonical,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}
