import type { Metadata } from 'next'

import { requireOwnerPage } from '~/lib/admin/server'
import { nonPublicRobots } from '~/lib/non-public-metadata'

import { CollectionEditor } from '../collections/CollectionEditor'

export const metadata: Metadata = { title: 'Books', robots: nonPublicRobots }
export const instant = false

export default async function AdminBooksPage() {
  await requireOwnerPage('/admin/books')
  return <CollectionEditor kind="book" />
}
