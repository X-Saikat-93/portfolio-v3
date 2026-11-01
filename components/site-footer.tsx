import { cacheLife } from 'next/cache'
import Link from 'next/link'

import { ExternalLabel } from '~/components/external-mark'
import { FooterClock } from '~/components/footer-clock'
import { FooterUtilities } from '~/components/footer-utilities'
import { ColophonDevice } from '~/components/washi-art'
import { formatDate } from '~/lib/date'
import { nowBuilding, nowLastUpdated } from '~/lib/now'
import { FEED, PROFILES, SITEMAP } from '~/lib/site-links'

async function CopyrightYear() {
  'use cache'
  cacheLife({ stale: 86_400, revalidate: 86_400, expire: 86_400 })

  return new Date().getFullYear()
}

// The colophon, the closing page of the printed object: the printer's
// device and signature, the sitemap, what is live (local time, the Now
// line, utilities) and the imprint. Server-rendered except the clock.
export function SiteFooter() {
  const now = nowBuilding[0]

  return (
    <footer className="colophon" aria-labelledby="colophon-title">
      <div className="colophon-plate">
        <span className="colophon-ticks" aria-hidden="true" />

        <div className="colophon-signature">
          <ColophonDevice className="colophon-device-mark" />
          <div className="colophon-signature-copy">
            <h2 id="colophon-title" className="colophon-name">
              Saikat Das
            </h2>
            <p className="colophon-line">
              Full-Stack Product Engineer. I build software that stays calm on a bad network.
            </p>
          </div>
        </div>

        <nav className="colophon-map" aria-label="Sitemap">
          {SITEMAP.map((column) => (
            <div key={column.heading} className="colophon-column">
              <h3 className="colophon-heading">{column.heading}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="ink-link">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="colophon-column">
            <h3 className="colophon-heading">Elsewhere</h3>
            <ul>
              {PROFILES.map((profile) => (
                <li key={profile.href}>
                  <a
                    href={profile.href}
                    target="_blank"
                    rel="me noreferrer"
                    className="ink-link"
                    aria-label={`${profile.label} (opens in a new tab)`}
                  >
                    <ExternalLabel>{profile.name}</ExternalLabel>
                  </a>
                </li>
              ))}
              <li>
                <a href={FEED.href} className="ink-link" aria-label={FEED.label}>
                  {FEED.name}
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="colophon-live">
          <FooterClock />
          {now ? (
            <Link href="/en/now" className="colophon-now">
              <span className="status-dot" aria-hidden="true" />
              <span>
                Now building <span className="colophon-now-title">{now.title}</span>
              </span>
              <span className="colophon-now-date">
                Updated{' '}
                <time dateTime={nowLastUpdated}>{formatDate(new Date(`${nowLastUpdated}T00:00:00Z`))}</time>
              </span>
            </Link>
          ) : null}
          <FooterUtilities locale="en" />
        </div>

        <p className="colophon-imprint">
          Set in Funnel and Geist Mono · Printed on paper · © <CopyrightYear /> Saikat Das
        </p>
      </div>
    </footer>
  )
}
