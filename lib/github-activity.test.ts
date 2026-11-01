import { describe, expect, it } from 'vitest'

import { ACTIVITY_DAYS, ACTIVITY_WEEKS, activityModel, activitySummary } from './github-activity'

function snapshot(weeks = ACTIVITY_WEEKS) {
  const days = weeks * ACTIVITY_DAYS
  const start = Date.UTC(2026, 4, 3)
  const dates = Array.from({ length: days }, (_, i) =>
    new Date(start + i * 86_400_000).toISOString().slice(0, 10),
  )
  const counts = Array.from({ length: days }, (_, i) => (i % 7 === 2 ? 5 : i % 3))
  // a year of levels: only the tail belongs to the window
  const levels = '4'.repeat(100) + counts.map((c) => String(Math.min(4, c))).join('')
  return { levels, dates, counts }
}

describe('activityModel', () => {
  it('returns null without contribution levels', () => {
    expect(activityModel({})).toBeNull()
  })

  it('draws the last 26 weeks, one cell per day, column by week', () => {
    const model = activityModel(snapshot())!
    expect(model.cells).toHaveLength(ACTIVITY_WEEKS * ACTIVITY_DAYS)
    expect(model.cells[0]).toEqual({ week: 0, day: 0, level: 0 })
    expect(model.cells[9]).toMatchObject({ week: 1, day: 2, level: 4 })
    expect(model.cells.at(-1)).toMatchObject({ week: ACTIVITY_WEEKS - 1, day: 6 })
  })

  it('sums weeks, labels each month once, and finds the busiest week', () => {
    const data = snapshot()
    const model = activityModel(data)!
    expect(model.weekly).toHaveLength(ACTIVITY_WEEKS)
    expect(model.total).toBe(data.counts.reduce((a, b) => a + b, 0))
    expect(model.weekly.reduce((a, w) => a + w.total, 0)).toBe(model.total)
    expect(new Set(model.months.map((m) => m.label)).size).toBe(model.months.length)
    expect(model.months[0]).toEqual({ label: 'May', week: 0 })
    expect(model.busiest?.total).toBe(Math.max(...model.weekly.map((w) => w.total)))
  })

  it('summarises the drawing in one sentence', () => {
    const model = activityModel(snapshot())!
    expect(activitySummary(model)).toMatch(/^GitHub activity: [\d,]+ commits in the last 26 weeks\. The busiest week began /)
  })
})
