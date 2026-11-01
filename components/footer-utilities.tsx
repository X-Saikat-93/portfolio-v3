import Link from 'next/link'

import { localePath, type Locale } from '~/lib/locale-route'

export function FooterUtilities({ locale = 'en' }: { locale?: Locale }) {
  return (
    <nav className="footer-utility" aria-label="Footer utilities">
      <Link href={localePath(locale, '/privacy')} className="footer-utility-link">
        Privacy policy
      </Link>
      <Link href={localePath(locale, '/terms')} className="footer-utility-link">
        Terms of use
      </Link>
      <Link href={localePath(locale, '/credits')} className="footer-utility-link">
        Credits
      </Link>
      <a href="#main-content" className="footer-utility-link footer-back-to-top">
        <span>Back to top</span>
        <span aria-hidden="true">↑</span>
      </a>
    </nav>
  )
}
