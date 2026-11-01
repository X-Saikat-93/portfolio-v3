import { describe, expect, it } from 'vitest'

import { coverRadius, exitDuration, MAX_STAGGERED, STAGGER_MS, staggerDelay } from './motion'

describe('motion helpers', () => {
  it('staggers the first six siblings and lands the rest together', () => {
    expect(staggerDelay(0)).toBe(0)
    expect(staggerDelay(1)).toBe(STAGGER_MS)
    expect(staggerDelay(MAX_STAGGERED - 1)).toBe((MAX_STAGGERED - 1) * STAGGER_MS)
    expect(staggerDelay(MAX_STAGGERED + 4)).toBe(staggerDelay(MAX_STAGGERED - 1))
    expect(staggerDelay(-3)).toBe(0)
  })

  it('shortens exits to about 70% of the entrance', () => {
    expect(exitDuration(420)).toBe(294)
    expect(exitDuration(240)).toBe(168)
  })

  it('covers the farthest viewport corner from the origin', () => {
    expect(coverRadius(0, 0, 300, 400)).toBe(500)
    expect(coverRadius(300, 400, 300, 400)).toBe(500)
    expect(coverRadius(150, 200, 300, 400)).toBe(250)
  })
})
