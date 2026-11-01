import '../../globals.css'

import { rootMetadata, rootViewport, SiteDocument } from '../../_components/site-document'

export const metadata = rootMetadata
export const viewport = rootViewport

export default function EnglishRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteDocument locale="en">{children}</SiteDocument>
}
