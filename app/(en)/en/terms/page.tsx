import type { Metadata } from 'next'

import { TermsPageView } from '../../../_views/terms-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { sectionJsonLd } from '~/lib/seo'

const copy = publicPageMetadata.terms.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/terms',
  ...copy,
})

export default function EnglishTermsPage() {
  return (
    <>
      <JsonLd data={sectionJsonLd('/en/terms', copy)} />
      <TermsPageView />
    </>
  )
}
