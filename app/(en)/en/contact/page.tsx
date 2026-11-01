import type { Metadata } from 'next'

import { ContactPageView } from '../../../_views/contact-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { sectionJsonLd } from '~/lib/seo'

const copy = publicPageMetadata.contact.en

export const metadata: Metadata = localeMetadata({
  locale: 'en',
  path: '/contact',
  ...copy,
})

export default function EnglishContactPage() {
  return (
    <>
      <JsonLd data={sectionJsonLd('/en/contact', copy, 'ContactPage')} />
      <ContactPageView />
    </>
  )
}
