import Link from 'next/link'

import { CopyEmail } from '~/components/copy-email'
import { HomeSection } from '~/components/home-section'
import { IndiaTime } from '~/components/india-time'
import { buttonVariants } from '~/components/ui/button-classes'
import { Seal } from '~/components/washi-art'
import { resumeProfile } from '~/lib/personal'

const EMAIL = resumeProfile.email

// The closing invitation as a letterpress card: thick cotton stock, the
// type pressed into it, the seal blind-embossed and the edge painted
// vermilion. Server-rendered; only the clock and the copy button run on
// the client.
export function HireMeSection({ index }: { index: number }) {
  return (
    <HomeSection index={index} id="hire-me-title" title="Hire me">
      <div className="letterpress">
        <div className="letterpress-head">
          <Seal className="letterpress-seal" />
          <span className="letterpress-name">Saikat Das</span>
          <span className="letterpress-status">
            <span className="status-dot" aria-hidden="true" />
            Open to remote work
          </span>
        </div>

        <p className="letterpress-role">Full-Stack Software Engineer</p>

        <dl className="letterpress-terms">
          <div>
            <dt>Based in</dt>
            <dd>India, UTC+5:30</dd>
          </div>
          <div>
            <dt>Local time</dt>
            <dd>
              <IndiaTime className="letterpress-time" />
            </dd>
          </div>
          <div className="letterpress-email">
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${EMAIL}`} className="ink-link">
                {EMAIL}
              </a>
              <CopyEmail address={EMAIL} />
            </dd>
          </div>
        </dl>

        <nav className="letterpress-actions" aria-label="Hiring links">
          <Link href="/en/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Start a conversation
          </Link>
          <Link href="/en/resume" className="letterpress-link">
            <span className="ink-link">View the resume</span>
            <span aria-hidden="true"> →</span>
          </Link>
        </nav>
      </div>
    </HomeSection>
  )
}
