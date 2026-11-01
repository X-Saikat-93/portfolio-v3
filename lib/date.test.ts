import { describe, expect, it } from 'vitest'

import { formatDate, formatDateEn, formatMonthDay } from './date'

describe('India long dates', () => {
  const date = new Date('2026-07-14T16:30:00.000Z')

  it('formats the same India calendar day in English', () => {
    expect(formatDate(date)).toBe('July 14, 2026')
    expect(formatDateEn(date)).toBe('July 14, 2026')
  })

  it('formats the archive month and day on the India calendar', () => {
    expect(formatMonthDay(new Date('2026-10-31T20:00:00.000Z'))).toBe('Nov 1')
  })
})
