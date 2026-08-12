import type { Metadata } from 'next'

import { requireOwnerPage } from '~/lib/admin/server'
import { nonPublicRobots } from '~/lib/non-public-metadata'

import { ResumeEditor } from './ResumeEditor'

export const metadata: Metadata = { title: 'Resume', robots: nonPublicRobots }
export const instant = false

export default async function AdminResumePage() {
  await requireOwnerPage('/admin/resume')
  return <ResumeEditor />
}
