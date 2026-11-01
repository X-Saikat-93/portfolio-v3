import type { Metadata } from 'next'

import { UsesPageView } from '../../../_views/uses-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { sectionJsonLd } from '~/lib/seo'

const copy = publicPageMetadata.uses.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/uses',
  ...copy,
})

export default function EnglishUsesPage() {
  return (
    <>
      <JsonLd data={sectionJsonLd('/en/uses', copy)} />
      <UsesPageView />
    </>
  )
}
