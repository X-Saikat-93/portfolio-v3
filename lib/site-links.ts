// The site's own map and its profiles elsewhere. The footer renders both;
// the Person JSON-LD `sameAs` is built from PROFILES, so the two never
// disagree (lib/site-links.test.ts).

export const PROFILES = [
  { name: 'GitHub', href: 'https://github.com/X-Saikat-93', label: 'Saikat Das on GitHub' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/saikat933/', label: 'Saikat Das on LinkedIn' },
  { name: 'X', href: 'https://x.com/Actually_Das', label: 'Saikat Das on X, @Actually_Das' },
] as const

export const FEED = { name: 'RSS', href: '/en/feed.xml', label: 'RSS feed of the writing' } as const

export const SITEMAP = [
  {
    heading: 'Work',
    links: [
      { name: 'Projects', href: '/en/projects' },
      { name: 'Resume', href: '/en/resume' },
    ],
  },
  {
    heading: 'Writing',
    links: [{ name: 'All writing', href: '/en/blog' }],
  },
  {
    heading: 'Collections',
    links: [
      { name: 'Photos', href: '/en/photos' },
      { name: 'Books', href: '/en/books' },
      { name: 'Music', href: '/en/music' },
    ],
  },
  {
    heading: 'About',
    links: [
      { name: 'Now', href: '/en/now' },
      { name: 'Uses', href: '/en/uses' },
    ],
  },
  {
    heading: 'Contact',
    links: [{ name: 'Send a message', href: '/en/contact' }],
  },
] as const

export const sameAs = () => PROFILES.map(({ href }) => href)
