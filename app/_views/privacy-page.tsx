import { ExternalLabel } from '~/components/external-mark'
import { PixelCluster } from '~/components/pixel-cluster'
import { SectionTag } from '~/components/section-tag'

const providers = [
  {
    name: 'Neon',
    purpose: 'Postgres storage for private contact submissions.',
    href: 'https://neon.tech/privacy-policy',
  },
  {
    name: 'Upstash',
    purpose: 'Temporary hashed identifiers used to rate-limit contact requests.',
    href: 'https://upstash.com/static/trust/privacy.pdf',
  },
  {
    name: 'Cloudinary',
    purpose: 'Delivery of published images and the resume PDF.',
    href: 'https://cloudinary.com/privacy',
  },
] as const

function PolicySection({
  index,
  id,
  title,
  children,
}: {
  index: number
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section
      className="privacy-section enter"
      aria-labelledby={id}
      style={{ '--enter-delay': `${90 + index * 45}ms` } as React.CSSProperties}
    >
      <SectionTag index={index} id={id}>
        {title}
      </SectionTag>
      <div className="privacy-copy">{children}</div>
    </section>
  )
}

export function PrivacyPageView() {
  return (
    <article className="privacy-page mx-auto w-full max-w-[37.5rem] px-6">
      <header className="privacy-header">
        <div>
          <p className="page-eyebrow enter">Privacy / public notice</p>
          <h1 className="privacy-title enter mt-5 text-balance">Privacy policy</h1>
          <p
            className="privacy-lede enter mt-4 text-balance"
            style={{ '--enter-delay': '70ms' } as React.CSSProperties}
          >
            A clear account of what this portfolio handles when you browse it or send a
            message.
          </p>
        </div>
        <div className="privacy-header-mark enter" aria-label="Policy effective date">
          <PixelCluster variant={5} />
          <p>
            <span>Effective</span>
            <time dateTime="2026-08-08">08 Aug 2026</time>
          </p>
        </div>
      </header>

      <div className="privacy-register">
        <PolicySection index={1} id="privacy-scope" title="Scope">
          <p>
            This personal portfolio is operated by Saikat Das. It has no public account,
            advertising, or payment system. I do not sell personal information or use contact
            details for marketing.
          </p>
          <p>
            This notice covers the public English pages under <code>/en</code>, including the
            contact form and media delivered on those pages.
          </p>
        </PolicySection>

        <PolicySection index={2} id="privacy-contact" title="Contact messages">
          <p>
            When you use the contact form, the site collects the name, email address, subject,
            and message you submit. These fields are stored in a private Neon Postgres database
            and shown in the owner-protected admin inbox.
          </p>
          <p>
            When email delivery is configured, the same details are sent through the configured
            SMTP provider to Saikat’s private notification inbox. They are used to read and reply
            to your message and maintain the resulting correspondence. Please do not include
            sensitive information that is not needed for the conversation.
          </p>
        </PolicySection>

        <PolicySection index={3} id="privacy-measurement" title="Analytics & security">
          <p>
            The portfolio does not run third-party analytics, advertising trackers, or custom
            analytics events. It does not use cookies.
          </p>
          <p>
            To protect the contact form from abuse, the server reads the network address supplied
            by the hosting layer, converts it to a SHA-256 hash, and uses only that hash as the
            Upstash rate-limit identifier. The raw address is not added to the contact submission
            record. Hosting providers may process ordinary request logs separately.
          </p>
        </PolicySection>

        <PolicySection index={4} id="privacy-browser" title="Browser storage">
          <p>
            Theme and sound choices are saved in local storage. A session-only flag remembers
            whether the introductory animation has already played. These preferences stay in
            your browser and can be removed by clearing this site’s data.
          </p>
          <p>
            The public portfolio does not set advertising cookies.
          </p>
        </PolicySection>

        <PolicySection index={5} id="privacy-providers" title="Service providers">
          <p>
            A small set of infrastructure providers process data only where needed to operate the
            portfolio. Their own notices govern the information they process.
          </p>
          <ul className="privacy-provider-list">
            {providers.map((provider) => (
              <li key={provider.name}>
                <a href={provider.href} target="_blank" rel="noreferrer">
                  <ExternalLabel>{provider.name}</ExternalLabel>
                </a>
                <span>{provider.purpose}</span>
              </li>
            ))}
            <li>
              <span className="privacy-provider-name">Email provider</span>
              <span>Delivery of private contact-form notifications.</span>
            </li>
          </ul>
          <p>
            If you follow a link to GitHub, LinkedIn, or another external site, that service’s
            privacy notice applies after you leave this portfolio.
          </p>
        </PolicySection>

        <PolicySection index={6} id="privacy-retention" title="Retention & security">
          <p>
            Contact submissions are retained while they are useful for responding and maintaining
            correspondence. No automatic deletion schedule is currently configured. Rate-limit
            identifiers expire according to the configured rate-limit window; provider-side logs
            and copies follow each provider’s retention terms.
          </p>
          <p>
            Access controls, server-only credentials, encrypted connections, input validation,
            and rate limiting are used to protect the site. No internet service can guarantee
            absolute security.
          </p>
        </PolicySection>

        <PolicySection index={7} id="privacy-choices" title="Your choices">
          <p>
            You may ask for access to, correction of, or deletion of a contact message by emailing
            from the address used to submit it. Additional rights may apply depending on where you
            live.
          </p>
          <p>
            Send privacy questions or requests to{' '}
            <a href="mailto:ibx.saikat37@gmail.com">ibx.saikat37@gmail.com</a>. This notice may be
            updated when the site’s data handling changes; the effective date above will change
            with it.
          </p>
        </PolicySection>
      </div>
    </article>
  )
}
