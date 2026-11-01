import Link from 'next/link'

import { RevealScope } from '~/components/reveal-scope'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const copy = publicPageMetadata.privacy.en
const EMAIL = 'ibx.saikat37@gmail.com'
export const PRIVACY_EFFECTIVE = '2026-11-01'

// Every row describes behaviour in this repository: the contact route, the
// rate limiter, the media loader and the client storage keys. Change the
// page and its effective date when the data handling changes.
const providers = [
  {
    name: 'Vercel',
    purpose: 'Hosts and serves the site. Processes ordinary request logs (IP address, user agent, page requested, time).',
    href: 'https://vercel.com/legal/privacy-policy',
  },
  {
    name: 'Neon',
    purpose: 'Postgres storage for contact submissions and the site’s own content.',
    href: 'https://neon.tech/privacy-policy',
  },
  {
    name: 'Upstash',
    purpose: 'Short-lived, hashed identifiers used to rate-limit the contact form.',
    href: 'https://upstash.com/static/trust/privacy.pdf',
  },
  {
    name: 'Cloudinary',
    purpose: 'Delivers the images and the resume PDF; your browser requests them from Cloudinary directly.',
    href: 'https://cloudinary.com/privacy',
  },
] as const

const storage = [
  { key: 'theme', where: 'Local storage', purpose: 'Your light, dark, or system theme choice.' },
  { key: 'sound', where: 'Local storage', purpose: 'Whether interface sounds are on.' },
  { key: 'shortcuts', where: 'Local storage', purpose: 'Whether single-key keyboard shortcuts are on.' },
  {
    key: 'portfolio:command-palette-hint:v1',
    where: 'Local storage',
    purpose: 'Remembers that the search hint has been shown, so it appears once.',
  },
  {
    key: 'owner',
    where: 'Local storage',
    purpose: 'Set only in the site owner’s browser after signing in to the admin.',
  },
  {
    key: 'v',
    where: 'Session storage',
    purpose: 'Remembers that the opening animation has played; cleared when the tab closes.',
  },
] as const

// Each section is an h2 and its blocks in the prose column, which numbers
// the headings in roman as the posts do.
function PolicySection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <>
      <h2 id={id}>{title}</h2>
      {children}
    </>
  )
}

export function PrivacyPageView() {
  return (
    <article className="page">
      <header className="page-head">
        <h1 className="page-title">{copy.heading}</h1>
        <p className="page-lede">{copy.lede}</p>
        <p className="page-meta">
          <span className="page-meta-item">
            <span className="status-dot" aria-hidden="true" />
            Effective <time dateTime={PRIVACY_EFFECTIVE}>November 1, 2026</time>
          </span>
          <Link href="/en/terms" className="ink-link">
            Terms of use
          </Link>
        </p>
      </header>

      {/* the notice is one sheet; sections below the fold develop in as
          they're reached */}
      <div className="page-body legal-sheet paper paper-grain paper-edge">
        <RevealScope className="prose legal-text">
          <PolicySection id="privacy-summary" title="In short">
            <ul>
              <li>Browsing this site does not create an account, set cookies, or run analytics or advertising trackers.</li>
              <li>The only personal information collected is what you choose to send through the contact form.</li>
              <li>Nothing is sold, shared for marketing, or used to build a profile of you.</li>
              <li>
                You can ask to see, correct, or delete your message at any time by writing to{' '}
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
              </li>
            </ul>
          </PolicySection>

          <PolicySection id="privacy-scope" title="Who runs this site">
            <p>
              This personal portfolio is operated by Saikat Das, an individual based in India, who decides how the
              information described here is used. It has no public accounts, advertising, or payment system. I do not
              sell personal information or use contact details for marketing.
            </p>
            <p>
              This notice covers the public English pages under <code>/en</code>, including the contact form and the
              media delivered on those pages. The owner-only admin area is outside its scope.
            </p>
          </PolicySection>

          <PolicySection id="privacy-contact" title="Contact messages">
            <p>
              When you use the contact form, the site collects the name, email address, subject, and message you
              submit, along with the time it arrived. These fields are stored in a private Neon Postgres database and
              shown only in the owner-protected admin inbox.
            </p>
            <p>
              When email delivery is configured, the same details are sent through the configured SMTP provider to
              Saikat’s private notification inbox, with your address as the reply-to, so a reply comes from a person
              and not a system. The details are used only to read and answer your message and to keep the resulting
              correspondence.
            </p>
            <p>
              Sending a message is voluntary. Under India’s Digital Personal Data Protection Act, 2023, a message you
              send for the purpose of getting a reply is processed as a legitimate use of data you chose to provide;
              under the GDPR, the basis is the legitimate interest in answering you, or the steps you asked for before
              any engagement. Without a working email address I cannot reply, but nothing else depends on it.
            </p>
            <p>
              Please do not include sensitive information, such as health, financial, or identity-document details,
              that the conversation does not need.
            </p>
          </PolicySection>

          <PolicySection id="privacy-measurement" title="Analytics & security">
            <p>
              The portfolio does not run third-party analytics, advertising trackers, session recording, or custom
              analytics events. It does not use cookies for visitors.
            </p>
            <p>
              To protect the contact form from abuse, the server reads the network address supplied by the hosting
              layer, converts it to a SHA-256 hash, and uses only that hash as the Upstash rate-limit identifier
              (by default, five messages an hour). The raw address is not added to the contact submission record. The
              hosting provider processes ordinary request logs separately, as any web server does.
            </p>
          </PolicySection>

          <PolicySection id="privacy-browser" title="Browser storage">
            <p>
              A few preferences are kept in your browser so the site remembers them. They never leave your device,
              are not used for tracking, and can be removed at any time by clearing this site’s data.
            </p>
            <table>
              <thead>
                <tr>
                  <th scope="col">Key</th>
                  <th scope="col">Where</th>
                  <th scope="col">Purpose</th>
                </tr>
              </thead>
              <tbody>
                {storage.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <code>{row.key}</code>
                    </td>
                    <td>{row.where}</td>
                    <td>{row.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              The public portfolio does not set advertising cookies. Signing in to the admin sets session cookies, and
              only the site owner can sign in.
            </p>
          </PolicySection>

          <PolicySection id="privacy-providers" title="Service providers">
            <p>
              A small set of infrastructure providers process data only where needed to operate the portfolio. Their
              own notices govern the information they process.
            </p>
            <ul className="privacy-providers">
              {providers.map((provider) => (
                <li key={provider.name}>
                  <a href={provider.href} target="_blank" rel="noreferrer" className="privacy-provider-name">
                    {provider.name}
                    <span className="sr-only"> privacy notice (opens in a new tab)</span>
                    <span aria-hidden="true"> ↗</span>
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
              The site’s fonts are served from the site itself, so no font service sees your visit. Profile and
              activity data shown in the footer is fetched by the server from GitHub; your browser does not contact
              GitHub unless you follow a link. If you follow a link to GitHub, LinkedIn, X, Spotify, or another
              external site, that service’s privacy notice applies after you leave this portfolio.
            </p>
          </PolicySection>

          <PolicySection id="privacy-transfers" title="Where data is processed">
            <p>
              The providers above operate infrastructure in several countries, so information you send may be stored
              or processed outside India. Each provider applies its own safeguards to that processing, described in the
              notices linked above.
            </p>
          </PolicySection>

          <PolicySection id="privacy-retention" title="Retention & security">
            <p>
              Contact messages are kept for 36 months from the day they arrive, so an ongoing conversation keeps
              its history, and are then deleted from the database automatically. The notification email copy is
              deleted by hand on the same schedule. You can ask for earlier deletion at any time. Rate-limit
              identifiers expire with the rate-limit window; provider-side logs and backups follow each provider’s
              retention terms.
            </p>
            <p>
              Access controls, server-only credentials, encrypted connections, a content security policy, input
              validation, and rate limiting are used to protect the site. No internet service can guarantee absolute
              security; if a breach affecting your message ever occurred, I would tell you as applicable law requires.
            </p>
          </PolicySection>

          <PolicySection id="privacy-choices" title="Your rights">
            <p>
              You can ask for a summary of the information held about you, and for it to be corrected, completed,
              updated, or erased. You can also object to its use or ask for a copy. Email from the address you used to
              send your message, so the request can be matched to it.
            </p>
            <ul>
              <li>
                <strong>In India</strong>, under the Digital Personal Data Protection Act, 2023, you may also nominate
                another person to exercise these rights if you die or become unable to. If a grievance is not resolved
                here, you may complain to the Data Protection Board of India.
              </li>
              <li>
                <strong>In the EU and UK</strong>, under the GDPR, you also have the rights to restriction and
                portability, and to complain to your local data protection authority.
              </li>
            </ul>
            <p>
              Send privacy questions, requests, or grievances to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. I respond as
              soon as I can, and within the time applicable law requires. I may ask for a detail of the original
              message to confirm a request is yours.
            </p>
          </PolicySection>

          <PolicySection id="privacy-children" title="Children">
            <p>
              The site is not directed at children, and I do not knowingly collect information from anyone under 18.
              If you believe a child has sent a message, write to the address above and it will be deleted.
            </p>
          </PolicySection>

          <PolicySection id="privacy-changes" title="Changes to this notice">
            <p>
              This notice is updated when the site’s data handling changes; the effective date above changes with it.
              The use of this site is also governed by the <Link href="/en/terms">Terms of use</Link>, and the{' '}
              <Link href="/en/credits">Credits and licences</Link> page lists the third-party software and services
              the site uses.
            </p>
          </PolicySection>
        </RevealScope>
      </div>
    </article>
  )
}
