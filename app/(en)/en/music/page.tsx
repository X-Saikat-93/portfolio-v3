import type { Metadata } from 'next'
import { connection } from 'next/server'

import { CollectionPageView } from '../../../_views/collection-page'
import { JsonLd } from '~/components/json-ld'
import { safeListPublishedCollectionItemsLive } from '~/lib/collections/repository'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { breadcrumbJsonLd, webPageJsonLd } from '~/lib/seo'

// Music is owner-managed content and should reflect the latest published DB
// rows instead of a prerendered or cached snapshot.
export const instant = false

const copy = publicPageMetadata.music.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/music',
  ...copy,
})

export default async function EnglishMusicPage() {
  await connection()
  const items = await safeListPublishedCollectionItemsLive('music')
  return (
    <>
      <JsonLd
        data={[
          {
            ...webPageJsonLd('/en/music', copy, 'CollectionPage'),
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: items.length,
              itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'MusicRecording',
                  name: item.title,
                  byArtist: item.creator ? { '@type': 'MusicGroup', name: item.creator } : undefined,
                  datePublished: item.year ? String(item.year) : undefined,
                  url: item.url || undefined,
                },
              })),
            },
          },
          breadcrumbJsonLd([{ name: copy.heading, path: '/en/music' }]),
        ]}
      />
      <CollectionPageView kind="music" items={items} />
    </>
  )
}
