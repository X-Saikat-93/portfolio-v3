import type { Metadata } from 'next'

import { requireOwnerPage } from '~/lib/admin/server'
import { nonPublicRobots } from '~/lib/non-public-metadata'

import { CollectionEditor } from '../collections/CollectionEditor'

export const metadata: Metadata = { title: 'Photos', robots: nonPublicRobots }
export const instant = false

export default async function AdminPhotosPage() {
  await requireOwnerPage('/admin/photos')
  return <CollectionEditor kind="photo" />
}
