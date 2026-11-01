import type { Metadata } from 'next'

import type { Locale } from './locale-route'
import { localePath } from './locale-route'
import { publicPageMetadata } from './public-page-metadata'
import { seo } from './seo'

interface LocaleMetadataOptions {
  locale: Locale
  path: string
  title: string
  /** The headline the OG card prints, when it differs from the search title. */
  heading?: string
  description: string
  type?: 'article' | 'website'
}

const SOCIAL_IMAGE_VERSION = process.env.VERCEL_GIT_COMMIT_SHA
  ? 'v5-' + process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 12)
  : 'v5'
const SECTION_IMAGE_PATHS = new Set([
  '/blog',
  '/photos',
  '/books',
  '/music',
  '/projects',
  '/now',
  '/resume',
  '/contact',
  '/uses',
  '/privacy',
  '/terms',
  '/credits',
])

const home = publicPageMetadata.home.en

const FEED_TITLE = `${seo.title} — ${publicPageMetadata.blog.en.heading}`

const BASE_KEYWORDS = ['Saikat Das', 'Saikat Das portfolio', 'full-stack software engineer']

// Only facts already on the site: stack and sections it actually publishes.
const SECTION_KEYWORDS: Record<string, string[]> = {
  '/': [
    'software engineer',
    'full-stack developer',
    'web products',
    'APIs',
    'data systems',
    'Node.js',
    'React',
    'Next.js',
    'PostgreSQL',
    'Redis',
  ],
  '/blog': ['software engineering blog', 'AI systems', 'AI agents', 'inference infrastructure', 'distributed systems', 'data systems', 'web applications'],
  '/projects': ['projects', 'case studies', 'Zaruro', 'recruitment operations platform', 'open-source', 'production software'],
  '/resume': ['resume', 'CV', 'full-stack software engineer resume', 'hire a full-stack engineer'],
  '/now': ['now page', 'current work', 'open to work'],
  '/uses': ['uses page', 'developer setup', 'tech stack', 'tools'],
  '/contact': ['contact', 'hire Saikat Das', 'work with Saikat Das'],
  '/photos': ['photography', 'photos'],
  '/books': ['reading list', 'books'],
  '/music': ['music', 'listening list'],
  '/terms': ['terms of use'],
  '/credits': ['credits', 'open-source licences'],
}

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
  heading = title,
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
        ? `Saikat Das · ${home.ogKicker}${sentenceSeparator}${home.ogHeading} ${home.ogDescription}`
        : SECTION_IMAGE_PATHS.has(path)
          ? `${heading} · Saikat Das${sentenceSeparator}${description}`
        : `${title} · Saikat Das`,
    type: 'image/jpeg',
  }

  return {
    title,
    description,
    ...(SECTION_KEYWORDS[path] ? { keywords: [...BASE_KEYWORDS, ...SECTION_KEYWORDS[path]] } : {}),
    authors: [{ name: 'Saikat Das', url: new URL('/en', seo.url) }],
    creator: 'Saikat Das',
    publisher: 'Saikat Das',
    alternates: {
      canonical,
      languages: pair.languages,
      // the writing feed is advertised wherever writing is listed or read
      ...(path === '/' || path === '/blog' || path.startsWith('/blog/')
        ? {
            types: {
              'application/rss+xml': [{ url: new URL('/en/feed.xml', seo.url).href, title: FEED_TITLE }],
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
      site: seo.twitter,
      creator: seo.twitter,
      title,
      description,
      images: [image],
    },
  }
}
