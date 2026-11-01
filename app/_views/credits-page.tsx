import Link from 'next/link'

import { RevealScope } from '~/components/reveal-scope'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const copy = publicPageMetadata.credits.en
const EMAIL = 'ibx.saikat37@gmail.com'
export const CREDITS_UPDATED = '2026-11-01'

type Credit = { name: string; owner: string; licence: string; href: string }

// Only what the site ships or shows: the self-hosted fonts in app/fonts.ts
// and lib/og.tsx, and the libraries imported by public pages. Update the list
// when a dependency is added or dropped.
const type: readonly Credit[] = [
  {
    name: 'Funnel Sans and Funnel Display',
    owner: 'NORD ID',
    licence: 'SIL Open Font License 1.1',
    href: 'https://fonts.google.com/specimen/Funnel+Sans',
  },
  {
    name: 'Geist Mono',
    owner: 'Vercel',
    licence: 'SIL Open Font License 1.1',
    href: 'https://vercel.com/font',
  },
  {
    name: 'Frex Sans GB (social cards)',
    owner: 'The Flex Sans GB Project Authors, based on IBM Plex',
    licence: 'SIL Open Font License 1.1',
    href: 'https://gitee.com/NightFurySL2001/flex-sc',
  },
]

const software: readonly Credit[] = [
  { name: 'Next.js', owner: 'Vercel', licence: 'MIT License', href: 'https://github.com/vercel/next.js' },
  { name: 'React', owner: 'Meta Platforms', licence: 'MIT License', href: 'https://github.com/facebook/react' },
  {
    name: 'Tailwind CSS',
    owner: 'Tailwind Labs',
    licence: 'MIT License',
    href: 'https://github.com/tailwindlabs/tailwindcss',
  },
  { name: 'Base UI', owner: 'MUI', licence: 'MIT License', href: 'https://github.com/mui/base-ui' },
  { name: 'Motion', owner: 'Matt Perry', licence: 'MIT License', href: 'https://github.com/motiondivision/motion' },
  { name: 'GSAP', owner: 'GreenSock, a Webflow company', licence: 'GSAP Standard License', href: 'https://gsap.com/standard-license' },
  { name: 'Lucide icons', owner: 'Lucide contributors', licence: 'ISC License', href: 'https://github.com/lucide-icons/lucide' },
  { name: 'Shiki', owner: 'Pine Wu and Anthony Fu', licence: 'MIT License', href: 'https://github.com/shikijs/shiki' },
  {
    name: 'Beautiful Mermaid',
    owner: 'Craft Docs',
    licence: 'MIT License',
    href: 'https://github.com/lukilabs/beautiful-mermaid',
  },
  { name: 'Cuelume', owner: 'Daniel Belyi', licence: 'MIT License', href: 'https://github.com/Danilaa1/cuelume' },
]

const services = [
  { name: 'Vercel', purpose: 'Hosting' },
  { name: 'Neon', purpose: 'Database for the site’s content and contact messages' },
  { name: 'Cloudinary', purpose: 'Image and resume PDF delivery' },
  { name: 'Upstash', purpose: 'Contact form rate limiting' },
  { name: 'GitHub', purpose: 'Repository and activity data, fetched by the server' },
] as const

function CreditList({ items }: { items: readonly Credit[] }) {
  return (
    <ul className="privacy-providers">
      {items.map((item) => (
        <li key={item.name}>
          <a href={item.href} target="_blank" rel="noreferrer" className="privacy-provider-name">
            {item.name}
            <span className="sr-only"> (opens in a new tab)</span>
            <span aria-hidden="true"> ↗</span>
          </a>
          <span>
            {item.owner} · {item.licence}
          </span>
        </li>
      ))}
    </ul>
  )
}

// Set on the same sheet as the privacy notice and the terms.
export function CreditsPageView() {
  return (
    <article className="page">
      <header className="page-head">
        <h1 className="page-title">{copy.heading}</h1>
        <p className="page-lede">{copy.lede}</p>
        <p className="page-meta">
          <span className="page-meta-item">
            <span className="status-dot" aria-hidden="true" />
            Updated <time dateTime={CREDITS_UPDATED}>November 1, 2026</time>
          </span>
          <Link href="/en/terms" className="ink-link">
            Terms of use
          </Link>
        </p>
      </header>

      <div className="page-body legal-sheet paper paper-grain paper-edge">
        <RevealScope className="prose legal-text">
          <h2 id="credits-type">Type</h2>
          <p>
            Every font is served from this site, so no font service is contacted when a page loads. Each is used
            under the SIL Open Font License.
          </p>
          <CreditList items={type} />

          <h2 id="credits-software">Software</h2>
          <p>
            The source code of this site is © Saikat Das and published under the{' '}
            <a href="https://github.com/X-Saikat-93/portfolio-v3/blob/main/LICENSE">MIT License</a>. It is built with
            the libraries below. Each library’s full licence text ships with its published package, and the
            repository’s <code>package.json</code> lists every dependency.
          </p>
          <CreditList items={software} />

          <h2 id="credits-artwork">Artwork</h2>
          <ul>
            <li>
              Book covers belong to their publishers and cover designers. They appear on the Books page only to
              identify each book.
            </li>
            <li>
              Album artwork belongs to the artists and their labels. It is taken from Spotify’s public embed
              information, shown only to identify each recording, and linked back to Spotify.
            </li>
            <li>
              Everything else, including the writing, photographs, illustrations, and design, is covered by the{' '}
              <Link href="/en/terms">Terms of use</Link>.
            </li>
          </ul>

          <h2 id="credits-services">Services</h2>
          <p>
            The site runs on these services. How each one handles data is set out in the{' '}
            <Link href="/en/privacy">Privacy policy</Link>.
          </p>
          <ul>
            {services.map((service) => (
              <li key={service.name}>
                <strong>{service.name}</strong>: {service.purpose}.
              </li>
            ))}
          </ul>

          <h2 id="credits-corrections">Corrections</h2>
          <p>
            If a credit is missing or wrong, or you own something shown here and want it changed or removed, write to{' '}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a> with the page address. It will be fixed promptly.
          </p>
        </RevealScope>
      </div>
    </article>
  )
}
