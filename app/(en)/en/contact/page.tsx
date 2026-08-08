import type { Metadata } from 'next'

import { ContactPageView } from '../../../_views/contact-page'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const copy = publicPageMetadata.contact.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/contact',
  ...copy,
})

export default function EnglishContactPage() {
  return <ContactPageView />
}
