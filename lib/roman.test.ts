import { describe, expect, it } from 'vitest'

import { toRoman } from './roman'

describe('toRoman', () => {
  it('numbers sections like a manual', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 9, 14, 40, 1994].map(toRoman)).toEqual([
      'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'IX', 'XIV', 'XL', 'MCMXCIV',
    ])
  })

  it('falls back to digits outside the roman range', () => {
    expect(toRoman(0)).toBe('0')
    expect(toRoman(4000)).toBe('4000')
  })
})
