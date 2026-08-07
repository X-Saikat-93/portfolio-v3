import '../globals.css'
import type { Metadata } from 'next'

import { rootMetadata, SiteDocument } from '../_components/site-document'
import {
  nonPublicDescriptions,
  nonPublicRobots,
} from '~/lib/non-public-metadata'

export const metadata: Metadata = {
  ...rootMetadata,
  description: nonPublicDescriptions.admin,
  robots: nonPublicRobots,
}
// The admin document stays a static shell. Better Auth validates the session
// in the protected loaders and API handlers, not in the public site layout.
export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument isAdmin locale="en">{children}</SiteDocument>
}
