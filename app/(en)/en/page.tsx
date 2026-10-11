import type { Metadata } from 'next'

import { JsonLd } from '~/components/json-ld'
import { HomePageView } from '../../_views/home-page'
import { localeMetadata } from '~/lib/locale-metadata'
import { seoEn } from '~/lib/seo'

// The active photo publication streams into a prefetched homepage shell.
export const instant = true

export const metadata: Metadata = {
  ...localeMetadata({
    locale: 'en',
    path: '/',
    title: seoEn.title,
    description: seoEn.description,
  }),
  title: { absolute: seoEn.title },
}

export default function EnglishHomePage() {
  const canonical = new URL('/en', seoEn.url).href

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          '@id': canonical + '#profile',
          url: canonical,
          name: seoEn.title,
          description: seoEn.description,
          inLanguage: 'en-US',
          mainEntity: {
            '@id': canonical + '#person',
          },
        }}
      />
      <HomePageView locale="en" />
    </>
  )
}
