import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { FEED, PROFILES, sameAs, SITEMAP } from './site-links'

describe('site links', () => {
  it('builds the JSON-LD sameAs list from the footer profiles', () => {
    expect(sameAs()).toEqual(PROFILES.map((profile) => profile.href))
    const document = readFileSync(join(process.cwd(), 'app/_components/site-document.tsx'), 'utf8')
    expect(document).toContain('sameAs: sameAs()')
  })

  it('names every profile for assistive technology and keeps X on the handle', () => {
    for (const profile of PROFILES) expect(profile.label).toMatch(/^Saikat Das on /)
    expect(PROFILES.find((p) => p.name === 'X')?.href).toBe('https://x.com/Actually_Das')
    expect(FEED.href).toBe('/en/feed.xml')
  })

  it('keeps every sitemap route under /en', () => {
    for (const column of SITEMAP) for (const link of column.links) expect(link.href).toMatch(/^\/en\//)
  })
})
