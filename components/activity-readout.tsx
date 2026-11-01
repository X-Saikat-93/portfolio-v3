'use client'

import { useState } from 'react'

import { ACTIVITY_DAYS, ACTIVITY_WEEKS, CELL, dateFromIso, MONTH_ROW } from '~/lib/github-activity'

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

// A pointer convenience over the activity drawing: the day under the
// pointer and its count. Screen readers get the summary label and the
// weekly table instead, so the readout itself stays out of the a11y tree.
export function ActivityReadout({
  start,
  counts,
  idle,
  children,
}: {
  start?: string
  counts: number[]
  idle: string
  children: React.ReactNode
}) {
  const [day, setDay] = useState<number | null>(null)

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const svg = event.currentTarget.querySelector('svg')
    if (!svg) return
    // pointer position in viewBox units, then the cell under it
    const box = svg.getBoundingClientRect()
    const view = svg.viewBox.baseVal
    const x = ((event.clientX - box.left) / box.width) * view.width
    const y = ((event.clientY - box.top) / box.height) * view.height
    const week = Math.floor(x / CELL)
    const weekday = Math.floor((y - MONTH_ROW) / CELL)
    const index = week * ACTIVITY_DAYS + weekday
    const inside = week >= 0 && week < ACTIVITY_WEEKS && weekday >= 0 && weekday < ACTIVITY_DAYS
    setDay(inside && index < counts.length ? index : null)
  }

  const week = day === null ? 0 : Math.floor(day / ACTIVITY_DAYS)
  const weekday = day === null ? 0 : day % ACTIVITY_DAYS

  let label = idle
  if (day !== null && start) {
    const date = new Date(dateFromIso(start).getTime() + day * 86_400_000)
    const count = counts[day] ?? 0
    label = `${dayFormatter.format(date)} · ${count} commit${count === 1 ? '' : 's'}`
  }

  return (
    <div className="activity-field" onPointerMove={onMove} onPointerLeave={() => setDay(null)}>
      <div className="activity-block">
        {children}
        {/* the cell under the pointer, pressed into the block */}
        <span
          className="activity-press"
          aria-hidden="true"
          data-active={day !== null || undefined}
          style={{ '--week': week, '--day': weekday } as React.CSSProperties}
        />
      </div>
      <p className="activity-readout" aria-hidden="true" data-active={day !== null || undefined}>
        {label}
      </p>
    </div>
  )
}
