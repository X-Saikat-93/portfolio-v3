import { ContactForm } from '~/components/contact-form'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { PROFILES } from '~/lib/site-links'

const copy = publicPageMetadata.contact.en
const EMAIL = 'ibx.saikat37@gmail.com'

const channels = [
  { label: 'Email', href: `mailto:${EMAIL}`, text: EMAIL, external: false },
  ...PROFILES.map(({ name, href }) => ({
    label: name,
    href,
    text: href.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''),
    external: true,
  })),
]

// The letter on the left; the direct lines beside it, on the same stock.
export function ContactPageView() {
  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-title">{copy.heading}</h1>
        <p className="page-lede">{copy.lede}</p>
      </header>

      <div className="page-body contact-desk">
        <ContactForm />
        <aside className="contact-aside paper paper-grain" aria-labelledby="contact-direct">
          <h2 id="contact-direct" className="page-label">
            Direct
          </h2>
          <ul className="register-rows">
            {channels.map((channel) => (
              <li key={channel.label} className="register-row register-row-wide">
                <span className="register-meta">{channel.label}</span>
                <span className="register-head">
                  <span className="contact-channel">
                    <a
                      href={channel.href}
                      className="register-link"
                      {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    >
                      {channel.text}
                      {channel.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
                    </a>
                  </span>
                  <span className="register-arrow" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="register-note contact-aside-note">Based in India, UTC+5:30.</p>
        </aside>
      </div>
    </div>
  )
}
