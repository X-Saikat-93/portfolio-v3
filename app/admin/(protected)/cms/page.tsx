import type { Metadata } from 'next'

import { requireOwnerPage } from '~/lib/admin/server'
import { nonPublicRobots } from '~/lib/non-public-metadata'

import { CmsEditor } from './CmsEditor'

export const metadata: Metadata = {
  title: 'CMS',
  robots: nonPublicRobots,
}

export const instant = false

export default async function AdminCmsPage() {
  await requireOwnerPage('/admin/cms')
  return <CmsEditor />
}
