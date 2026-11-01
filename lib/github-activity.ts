import type { GitHubSnapshot } from '~/lib/social-live'

// The homepage activity plate: the last 26 weeks as ink-density cells in one
// SVG. This module turns the cached snapshot into the drawing and its
// summaries, so the component only lays out what it is given.

export const ACTIVITY_WEEKS = 26
export const ACTIVITY_DAYS = 7
export const CELL = 10 // px per cell, gap included
export const CELL_SIZE = 8
export const MONTH_ROW = 14 // px above the cells for month labels

export interface ActivityCell {
  week: number
  day: number
  level: number
}

export interface ActivityModel {
  cells: ActivityCell[]
  months: { label: string; week: number }[]
  weekly: { start: string; total: number }[]
  total: number
  busiest?: { start: string; total: number }
  /** First date in the window (ISO), for the pointer readout. */
  start?: string
  counts: number[]
}

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })

export function dateFromIso(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function activityModel(snapshot: Pick<GitHubSnapshot, 'levels' | 'dates' | 'counts'>): ActivityModel | null {
  if (!snapshot.levels) return null
  const span = ACTIVITY_WEEKS * ACTIVITY_DAYS
  // `levels` covers the tracked year; the plate shows the same last-26-week
  // window as `dates` and `counts`.
  const levels = snapshot.levels.slice(-span)
  const dates = snapshot.dates?.slice(-span) ?? []
  const counts = snapshot.counts?.slice(-span) ?? []

  const cells: ActivityCell[] = []
  for (let i = 0; i < levels.length; i++) {
    const level = Number(levels[i])
    cells.push({
      week: Math.floor(i / ACTIVITY_DAYS),
      day: i % ACTIVITY_DAYS,
      level: Number.isFinite(level) ? Math.min(4, Math.max(0, level)) : 0,
    })
  }

  const months: ActivityModel['months'] = []
  const weekly: ActivityModel['weekly'] = []
  for (let week = 0; week * ACTIVITY_DAYS < dates.length; week++) {
    const start = dates[week * ACTIVITY_DAYS]
    const label = monthFormatter.format(dateFromIso(start))
    if (months.at(-1)?.label !== label) months.push({ label, week })
    const total = counts
      .slice(week * ACTIVITY_DAYS, (week + 1) * ACTIVITY_DAYS)
      .reduce((sum, count) => sum + count, 0)
    weekly.push({ start, total })
  }

  const total = counts.reduce((sum, count) => sum + count, 0)
  const busiest = weekly.reduce<ActivityModel['busiest']>(
    (best, week) => (week.total > (best?.total ?? 0) ? week : best),
    undefined,
  )

  return { cells, months, weekly, total, busiest, start: dates[0], counts }
}

/** One sentence that stands in for the drawing for screen readers. */
export function activitySummary(model: ActivityModel) {
  const busiest = model.busiest
    ? ` The busiest week began ${new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' }).format(dateFromIso(model.busiest.start))}, with ${model.busiest.total.toLocaleString('en-US')}.`
    : ''
  return `GitHub activity: ${model.total.toLocaleString('en-US')} commits in the last ${ACTIVITY_WEEKS} weeks.${busiest}`
}
