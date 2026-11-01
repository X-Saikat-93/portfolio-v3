import { CollectionPageView } from '../../../_views/collection-page'
import { connection } from 'next/server'

import { JsonLd } from '~/components/json-ld'
import { cloudinaryImageUrl } from '~/lib/cloudinary/image-url'
import { safeListPublishedCollectionItemsLive } from '~/lib/collections/repository'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { breadcrumbJsonLd, webPageJsonLd } from '~/lib/seo'

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
  return (
    <>
      <JsonLd
        data={[
          {
            ...webPageJsonLd('/en/photos', copy, 'CollectionPage'),
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: items.length,
              itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'ImageObject',
                  name: item.title,
                  description: item.description || undefined,
                  contentUrl: item.imagePublicId
                    ? cloudinaryImageUrl(item.imagePublicId, { width: 1600, crop: 'fit', gravity: 'center' })
                    : undefined,
                },
              })),
            },
          },
          breadcrumbJsonLd([{ name: copy.heading, path: '/en/photos' }]),
        ]}
      />
      <CollectionPageView kind="photo" items={items} />
    </>
  )
}
