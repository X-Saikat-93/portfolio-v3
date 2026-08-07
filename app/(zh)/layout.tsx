import '../globals.css'

import { rootMetadata, SiteDocument } from '../_components/site-document'

export const metadata = rootMetadata

export default function RootFallbackLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument locale="en">{children}</SiteDocument>
}
