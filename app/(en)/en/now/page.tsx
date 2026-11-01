import type { Metadata } from 'next'

import { NowPageView } from '../../../_views/now-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { safeListPublishedCollectionItems } from '~/lib/collections/repository'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { sectionJsonLd } from '~/lib/seo'

export const instant = true

const copy = publicPageMetadata.now.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/now',
  ...copy,
})

export default async function EnglishNowPage() {
  const books = await safeListPublishedCollectionItems('book')
  return (
    <>
      <JsonLd data={sectionJsonLd('/en/now', copy)} />
      <NowPageView books={books} />
    </>
  )
}
