import { CollectionPageView } from '../../../_views/collection-page'
import { safeListPublishedCollectionItems } from '~/lib/collections/repository'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'

// The active photo publication streams into a prefetched masonry shell.
export const instant = true

const copy = publicPageMetadata.photos.en

export const metadata = localeMetadata({
  locale: 'en',
  path: '/photos',
  ...copy,
})

export default async function EnglishPhotosPage() {
  const items = await safeListPublishedCollectionItems('photo')
  return <CollectionPageView kind="photo" items={items} />
}
