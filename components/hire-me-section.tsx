import Link from 'next/link'

import { CopyEmail } from '~/components/copy-email'
import { HomeSection } from '~/components/home-section'
import { IndiaTime } from '~/components/india-time'
import { buttonVariants } from '~/components/ui/button-classes'
import { Seal } from '~/components/washi-art'
import { resumeProfile } from '~/lib/personal'

const EMAIL = resumeProfile.email

// The closing invitation: status, terms and two ways onward, signed with
// the seal. Server-rendered; only the clock and the copy button run on the
// client.
export function HireMeSection({ index }: { index: number }) {
  return (
    <HomeSection index={index} id="hire-me-title" title="Hire me" figure="letter">
      <div className="hire">
        <p className="hire-status">
          <span className="status-dot" aria-hidden="true" />
          Open to remote work
        </p>
        <p className="hire-role">Full-Stack Software Engineer</p>

        <dl className="hire-terms">
          <div className="hire-term">
            <dt>Based in</dt>
            <dd>India, UTC+5:30</dd>
          </div>
          <div className="hire-term">
            <dt>Local time</dt>
            <dd>
              <IndiaTime className="hire-time" />
            </dd>
          </div>
          <div className="hire-term">
            <dt>Email</dt>
            <dd className="hire-email">
              <a href={`mailto:${EMAIL}`} className="ink-link">
                {EMAIL}
              </a>
              <CopyEmail address={EMAIL} />
            </dd>
          </div>
        </dl>

        <div className="hire-close">
          <nav className="hire-actions" aria-label="Hiring links">
            <Link href="/en/contact" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              Start a conversation
            </Link>
            <Link href="/en/resume" className={buttonVariants({ variant: 'tertiary', size: 'lg' })}>
              View the resume
            </Link>
          </nav>
          <Seal className="hire-signature" />
        </div>
      </div>
    </HomeSection>
  )
}
