import Link from 'next/link'

import { localePath, type Locale } from '~/lib/locale-route'

export function FooterUtilities({ locale = 'en' }: { locale?: Locale }) {
  return (
    <nav className="footer-utility" aria-label="Footer utilities">
      <Link href={localePath(locale, '/privacy')} className="footer-utility-link">
        Privacy policy
      </Link>
      <a href="#main-content" className="footer-utility-link footer-back-to-top">
        <span>Back to top</span>
        <span aria-hidden="true">↑</span>
      </a>
    </nav>
  )
}
