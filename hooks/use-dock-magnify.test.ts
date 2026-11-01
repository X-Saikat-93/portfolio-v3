import { describe, expect, it } from 'vitest'

import { MAGNIFY_MAX, MAGNIFY_RADIUS, magnification } from './use-dock-magnify'

describe('magnification', () => {
  it('peaks under the pointer and never exceeds the cap', () => {
    expect(magnification(0)).toBeCloseTo(MAGNIFY_MAX)
    for (let d = -200; d <= 200; d += 7) expect(magnification(d)).toBeLessThanOrEqual(MAGNIFY_MAX)
  })

  it('falls off symmetrically and rests at 1 beyond the radius', () => {
    expect(magnification(-30)).toBeCloseTo(magnification(30))
    expect(magnification(40)).toBeLessThan(magnification(20))
    expect(magnification(MAGNIFY_RADIUS)).toBe(1)
    expect(magnification(MAGNIFY_RADIUS * 2)).toBe(1)
  })
})
