import { CollectionPageView } from '../../../_views/collection-page'
import { connection } from 'next/server'

import { safeListPublishedCollectionItemsLive } from '~/lib/collections/repository'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'

// Photo updates should appear as soon as the corresponding database row changes.
export const instant = false

const copy = publicPageMetadata.photos.en

export const metadata = localeMetadata({
  locale: 'en',
  path: '/photos',
  ...copy,
})

export default async function EnglishPhotosPage() {
  await connection()
  const items = await safeListPublishedCollectionItemsLive('photo')
  return <CollectionPageView kind="photo" items={items} />
}
