import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { connection } from 'next/server'

import { CollectionPageView } from '../../../_views/collection-page'
import { safeListPublishedCollectionItemsLive } from '~/lib/collections/repository'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'

// Music is owner-managed content and should reflect the latest published DB
// rows instead of a prerendered or cached snapshot.
export const instant = false

const copy = publicPageMetadata.music.en
const musicDisplay = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-music-display',
})

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/music',
  ...copy,
})

export default async function EnglishMusicPage() {
  await connection()
  const items = await safeListPublishedCollectionItemsLive('music')
  return <CollectionPageView kind="music" items={items} displayFontClassName={musicDisplay.variable} />
}
