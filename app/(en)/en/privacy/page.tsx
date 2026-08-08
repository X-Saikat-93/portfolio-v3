import type { Metadata } from 'next'

import { PrivacyPageView } from '../../../_views/privacy-page'
import { localeMetadata } from '~/lib/locale-metadata'

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/privacy',
  title: 'Privacy policy',
  description:
    'How Saikat Das’s portfolio handles contact messages, analytics, browser preferences, and service providers.',
})

export default function EnglishPrivacyPage() {
  return <PrivacyPageView />
}
