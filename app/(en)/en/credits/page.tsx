import type { Metadata } from 'next'

import { CreditsPageView } from '../../../_views/credits-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { sectionJsonLd } from '~/lib/seo'

const copy = publicPageMetadata.credits.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/credits',
  ...copy,
})

export default function EnglishCreditsPage() {
  return (
    <>
      <JsonLd data={sectionJsonLd('/en/credits', copy)} />
      <CreditsPageView />
    </>
  )
}
