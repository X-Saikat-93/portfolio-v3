// Saikat's profiles elsewhere. The Person JSON-LD `sameAs` is built from
// this list (lib/site-links.test.ts).

export const PROFILES = [
  { name: 'GitHub', href: 'https://github.com/X-Saikat-93' },
  { name: 'LinkedIn', href: 'https://www.linkedin.com/in/saikat933/' },
  { name: 'X', href: 'https://x.com/Actually_Das' },
] as const

export const sameAs = () => PROFILES.map(({ href }) => href)
