import { describe, expect, it } from 'vitest'

import { formatDate, formatDateEn } from './date'

describe('India long dates', () => {
  const date = new Date('2026-07-14T16:30:00.000Z')

  it('formats the same India calendar day in English', () => {
    expect(formatDate(date)).toBe('July 14, 2026')
    expect(formatDateEn(date)).toBe('July 14, 2026')
  })
})
