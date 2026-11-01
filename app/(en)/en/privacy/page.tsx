import type { Metadata } from 'next'

import { PrivacyPageView } from '../../../_views/privacy-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { sectionJsonLd } from '~/lib/seo'

const copy = publicPageMetadata.privacy.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/privacy',
  ...copy,
})

export default function EnglishPrivacyPage() {
  return (
    <>
      <JsonLd data={sectionJsonLd('/en/privacy', copy)} />
      <PrivacyPageView />
    </>
  )
}
