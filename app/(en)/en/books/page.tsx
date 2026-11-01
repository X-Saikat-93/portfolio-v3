import type { Metadata } from 'next'

import { CollectionPageView } from '../../../_views/collection-page'
import { JsonLd } from '~/components/json-ld'
import { cloudinaryImageUrl } from '~/lib/cloudinary/image-url'
import { localeMetadata } from '~/lib/locale-metadata'
import { safeListPublishedCollectionItems } from '~/lib/collections/repository'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { breadcrumbJsonLd, webPageJsonLd } from '~/lib/seo'

export const instant = true

const copy = publicPageMetadata.books.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/books',
  ...copy,
})

export default async function EnglishBooksPage() {
  const items = await safeListPublishedCollectionItems('book')
  return (
    <>
      <JsonLd
        data={[
          {
            ...webPageJsonLd('/en/books', copy, 'CollectionPage'),
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: items.length,
              itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'Book',
                  name: item.title,
                  author: item.creator
                    ? { '@type': 'Person', name: item.creator }
                    : undefined,
                  datePublished: item.year ? String(item.year) : undefined,
                  description: item.description || undefined,
                  url: item.url || undefined,
                  image: item.imagePublicId
                    ? cloudinaryImageUrl(item.imagePublicId, {
                        width: 480,
                        height: 720,
                        crop: 'fill',
                        gravity: 'center',
                      })
                    : undefined,
                },
              })),
            },
          },
          breadcrumbJsonLd([{ name: copy.heading, path: '/en/books' }]),
        ]}
      />
      <CollectionPageView kind="book" items={items} />
    </>
  )
}
