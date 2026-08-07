import type { Metadata } from 'next'

import { ContactPageView } from '../../../_views/contact-page'
import { localeMetadata } from '~/lib/locale-metadata'

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/contact',
  title: 'Contact',
  description: 'Send a private message to Saikat Das.',
})

export default function EnglishContactPage() {
  return <ContactPageView />
}
