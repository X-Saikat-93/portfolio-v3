import { publicPageMetadata } from './public-page-metadata'

function publicSiteUrl() {
  const raw =
    process.env.PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === 'production' ? 'https://xsaikat.vercel.app' : 'http://localhost:3199')
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new Error('PUBLIC_SITE_URL must be a valid URL')
  }
  if (
    url.protocol !== 'https:' &&
    !['localhost', '127.0.0.1'].includes(url.hostname)
  ) {
    throw new Error('PUBLIC_SITE_URL must use HTTPS outside local development')
  }
  return url
}

export const seo = {
  title: publicPageMetadata.home.en.title,
  description: publicPageMetadata.home.en.description,
  url: publicSiteUrl(),
  twitter: '@Actually_Das',
} as const

export const seoEn = {
  title: publicPageMetadata.home.en.title,
  description: publicPageMetadata.home.en.description,
  url: seo.url,
} as const

// JSON-LD node ids shared across pages, so every page points at one Person,
// one WebSite and one Blog.
export const personId = new URL('/en#person', seo.url).href
export const websiteId = new URL('/en#website', seo.url).href
export const blogId = new URL('/en/blog#blog', seo.url).href

type PageCopy = { title: string; heading: string; description: string }

/** WebPage-family JSON-LD node for an inner page, tied to the shared WebSite. */
export function webPageJsonLd(path: string, copy: PageCopy, type = 'WebPage') {
  const url = new URL(path, seo.url).href
  return {
    '@context': 'https://schema.org',
    '@type': type,
    '@id': `${url}#page`,
    url,
    name: copy.title,
    description: copy.description,
    inLanguage: 'en',
    isPartOf: { '@id': websiteId },
  }
}

/** The pair every plain inner page carries: its WebPage and its breadcrumb. */
export function sectionJsonLd(path: string, copy: PageCopy, type = 'WebPage') {
  return [webPageJsonLd(path, copy, type), breadcrumbJsonLd([{ name: copy.heading, path }])]
}

/** BreadcrumbList JSON-LD for an inner page; Home is always the first crumb. */
export function breadcrumbJsonLd(trail: readonly { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/en' }, ...trail].map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: new URL(path, seo.url).href,
    })),
  }
}
