import Link from 'next/link'

import { ErrorHomeAction } from '~/components/error-home-action'
import { ErrorProof } from '~/components/error-proof'
import { MissingPath } from '~/components/missing-path'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const ways = [
  { href: '/en/blog', name: publicPageMetadata.blog.en.heading },
  { href: '/en/projects', name: publicPageMetadata.projects.en.heading },
  { href: '/en/resume', name: publicPageMetadata.resume.en.heading },
  { href: '/en/contact', name: publicPageMetadata.contact.en.heading },
]

export function NotFoundPageView() {
  return (
    <ErrorProof
      code="404"
      meta={['INK / 00%', 'POS / ??']}
      status="NO IMPRESSION"
      title="This page slipped off the grid."
      body="The address works. There just isn’t a print here yet."
      detail={<MissingPath />}
      onward={
        <nav className="error-onward" aria-labelledby="error-onward-title">
          <h2 id="error-onward-title" className="error-onward-title enter" style={{ '--enter-delay': '240ms' } as React.CSSProperties}>
            Ways back
          </h2>
          <ul className="register-rows motion-list" style={{ '--motion-list-delay': '280ms' } as React.CSSProperties}>
            {ways.map((way) => (
              <li key={way.href} className="register-row">
                <span className="register-head error-way">
                  <Link href={way.href} className="register-link register-name">
                    {way.name}
                  </Link>
                  <span className="register-meta">{way.href}</span>
                  <span className="register-arrow error-way-arrow" aria-hidden="true">
                    →
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </nav>
      }
    >
      <ErrorHomeAction />
    </ErrorProof>
  )
}
