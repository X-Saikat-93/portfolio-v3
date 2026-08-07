import type { Metadata } from 'next'

import { requireOwnerPage } from '~/lib/admin/server'
import { nonPublicRobots } from '~/lib/non-public-metadata'

import { CollectionEditor } from '../collections/CollectionEditor'

export const metadata: Metadata = { title: 'Music', robots: nonPublicRobots }
export const instant = false

export default async function AdminMusicPage() {
  await requireOwnerPage('/admin/music')
  return <CollectionEditor kind="music" />
}
