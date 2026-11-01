import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { PROFILES, sameAs } from './site-links'

describe('site links', () => {
  it('builds the JSON-LD sameAs list from the profiles', () => {
    expect(sameAs()).toEqual(PROFILES.map((profile) => profile.href))
    expect(sameAs()).toContain('https://x.com/Actually_Das')
    const document = readFileSync(join(process.cwd(), 'app/_components/site-document.tsx'), 'utf8')
    expect(document).toContain('sameAs: sameAs()')
  })
})
