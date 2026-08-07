import type { Metadata } from 'next'

import { requireOwnerPage } from '~/lib/admin/server'
import { nonPublicRobots } from '~/lib/non-public-metadata'

import { CollectionEditor } from './CollectionEditor'

export const metadata: Metadata = { title: 'Collections', robots: nonPublicRobots }
export const instant = false

export default async function AdminCollectionsPage() {
  await requireOwnerPage('/admin/collections')
  return (
    <div className="space-y-12">
      <CollectionEditor kind="book" />
      <CollectionEditor kind="music" />
      <CollectionEditor kind="photo" />
    </div>
  )
}
