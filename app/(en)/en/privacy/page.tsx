import type { Metadata } from 'next'

import { PrivacyPageView } from '../../../_views/privacy-page'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const copy = publicPageMetadata.privacy.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/privacy',
  ...copy,
})

export default function EnglishPrivacyPage() {
  return <PrivacyPageView />
}
