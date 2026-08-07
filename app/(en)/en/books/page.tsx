import type { Metadata } from 'next'

import { CollectionPageView } from '../../../_views/collection-page'
import { localeMetadata } from '~/lib/locale-metadata'
import { safeListPublishedCollectionItems } from '~/lib/collections/repository'
import { publicPageMetadata } from '~/lib/public-page-metadata'

export const instant = true

const copy = publicPageMetadata.books.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/books',
  ...copy,
})

export default async function EnglishBooksPage() {
  const items = await safeListPublishedCollectionItems('book')
  return <CollectionPageView kind="book" items={items} />
}
