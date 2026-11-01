import { describe, expect, it } from 'vitest'

import { publicPageMetadata, type PublicSection } from './public-page-metadata'

const sections = Object.keys(publicPageMetadata).filter(
  (key): key is PublicSection => key !== 'home',
)

describe('public page metadata copy', () => {
  it('names Saikat Das in every search description', () => {
    expect(publicPageMetadata.home.en.description).toMatch(/^Saikat Das is a full-stack software engineer/)
    for (const section of sections) {
      expect(publicPageMetadata[section].en.description, section).toContain('Saikat Das')
    }
  })

  it('keeps titles and descriptions inside search and social budgets', () => {
    for (const section of sections) {
      const copy = publicPageMetadata[section].en
      // the root layout appends " | Saikat Das"
      expect(`${copy.title} | Saikat Das`.length, section).toBeLessThanOrEqual(60)
      expect(copy.description.length, section).toBeLessThanOrEqual(160)
      expect(copy.heading.length, section).toBeGreaterThan(0)
    }
  })

  it('serves the same English copy on the legacy locale key', () => {
    for (const section of [...sections, 'home'] as const) {
      expect(publicPageMetadata[section].zh, section).toEqual(publicPageMetadata[section].en)
    }
  })

  it('keeps the copy plain and on brand', () => {
    const text = JSON.stringify(publicPageMetadata).toLowerCase()
    expect(text).not.toContain('senior')
    expect(text).not.toContain('cali')
  })
})
