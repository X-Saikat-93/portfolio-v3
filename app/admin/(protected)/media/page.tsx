import type { Metadata } from 'next'

import { requireOwnerPage } from '~/lib/admin/server'
import { nonPublicRobots } from '~/lib/non-public-metadata'

import { CloudinaryMediaPanel } from './CloudinaryMediaPanel'

export const metadata: Metadata = {
  title: 'Media',
  robots: nonPublicRobots,
}

export const instant = false

export default async function AdminMediaPage() {
  await requireOwnerPage('/admin/media')
  return <CloudinaryMediaPanel />
}
