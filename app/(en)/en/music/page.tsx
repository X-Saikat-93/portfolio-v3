import type { Metadata } from 'next'

import { CollectionPageView } from '../../../_views/collection-page'
import { safeListPublishedCollectionItems } from '~/lib/collections/repository'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'

export const instant = true

const copy = publicPageMetadata.music.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/music',
  ...copy,
})

export default async function EnglishMusicPage() {
  const items = await safeListPublishedCollectionItems('music')
  return <CollectionPageView kind="music" items={items} />
}
