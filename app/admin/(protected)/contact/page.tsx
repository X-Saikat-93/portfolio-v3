import type { Metadata } from 'next'

import { ContactInbox } from '~/components/contact-inbox'
import { requireOwnerPage } from '~/lib/admin/server'
import { nonPublicRobots } from '~/lib/non-public-metadata'

export const metadata: Metadata = {
  title: 'Contact inbox',
  robots: nonPublicRobots,
}

export const instant = false

export default async function AdminContactPage() {
  await requireOwnerPage('/admin/contact')
  return <ContactInbox />
}
