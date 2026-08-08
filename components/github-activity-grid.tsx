'use client'

import { useEffect, useRef, useState } from 'react'

import { T } from '~/lib/i18n'

const GRID_WEEKS = 26
const GRID_DAYS = 7

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' })
const dayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})
const fullDayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

function dateFromIso(iso: string) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

// Animated tabular count: eases toward the hovered day's commit total so
// the readout feels alive without fighting the reduced-motion contract.
function useAnimatedNumber(value: number) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fromRef.current = value
      setDisplay(value)
      return
    }

    const from = fromRef.current
    if (from === value) return
    const start = performance.now()
    const duration = 340
    let raf: number

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (value - from) * eased)
      setDisplay(current)
      fromRef.current = current
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return display
}

function monthSpans(dates?: string[]) {
  const spans: { label: string; weeks: number }[] = []
  for (let week = 0; week < GRID_WEEKS; week++) {
    const iso = dates?.[week * GRID_DAYS]
    if (!iso) continue
    const label = monthFormatter.format(dateFromIso(iso))
    const last = spans[spans.length - 1]
    if (last && last.label === label) last.weeks += 1
    else spans.push({ label, weeks: 1 })
  }
  return spans
}

function Readout({
  activeDay,
  dates,
  counts,
  weeks,
  total,
}: {
  activeDay: number | null
  dates?: string[]
  counts?: number[]
  weeks?: number[]
  total: number
}) {
  const activeCount = activeDay != null ? counts?.[activeDay] : undefined
  const activeDate = activeDay != null && dates ? dates[activeDay] : undefined
  const activeWeek = activeDay != null ? Math.floor(activeDay / GRID_DAYS) : null
  const weekTotal = activeWeek != null ? weeks?.[activeWeek] : undefined
  const isDayMode = activeDay != null && activeDate != null && activeCount != null
  const animated = useAnimatedNumber(activeDay != null ? (activeCount ?? weekTotal ?? total) : total)

  return (
    <span className="github-grid-readout-value" key={activeDay ?? 'idle'}>
      {isDayMode ? (
        <>
          <T zh="次提交" en="commits" />
          <b>{animated.toLocaleString()}</b>
          <span className="github-grid-readout-date">
            {dayFormatter.format(dateFromIso(activeDate))}
          </span>
        </>
      ) : activeDay != null ? (
        <>
          <T zh={`第 ${String((activeWeek ?? 0) + 1).padStart(2, '0')} 周`} en={`week ${String((activeWeek ?? 0) + 1).padStart(2, '0')}`} />
          <b>{weekTotal?.toLocaleString() ?? '—'}</b>
          <T zh="次提交" en="commits" />
        </>
      ) : (
        <>
          <T zh="最近 26 周" en="last 26 weeks" />
          <b>{total.toLocaleString()}</b>
          <T zh="次提交" en="commits" />
        </>
      )}
    </span>
  )
}

export function GitHubActivityGrid({
  levels,
  weeks,
  dates,
  counts,
}: {
  levels?: string
  weeks?: number[]
  dates?: string[]
  counts?: number[]
}) {
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const spans = monthSpans(dates)
  // `levels` covers the full tracked year; the grid shows only the last
  // 26 weeks, so slice it to the same window as `dates`/`counts` or the
  // cell colors and the hover readout would point at different days.
  const gridLevels = levels?.slice(-GRID_WEEKS * GRID_DAYS) ?? ''
  const total = counts?.reduce((sum, count) => sum + count, 0) ?? weeks?.reduce((sum, week) => sum + week, 0) ?? 0
  const startWeekday = dates?.[0] ? dateFromIso(dates[0]).getUTCDay() : 0

  if (!levels) {
    return (
      <p className="github-grid-empty" role="status">
        <T
          zh="GitHub 提交将在数据更新后显示。"
          en="GitHub activity will appear here once the feed resolves."
        />
      </p>
    )
  }

  return (
    <div
      className="github-grid-zone"
      onPointerLeave={() => setActiveDay(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setActiveDay(null)
      }}
    >
      <div className="github-grid-readout" aria-live="polite" aria-atomic="true">
        <span className="github-grid-readout-label">
          <T zh="每日提交" en="daily commits" />
        </span>
        <Readout
          activeDay={activeDay}
          dates={dates}
          counts={counts}
          weeks={weeks}
          total={total}
        />
      </div>

      <div className="github-grid-frame">
        <div className="github-grid-months" aria-hidden>
          {spans.map((span, index) => (
            <span
              key={`${span.label}-${index}`}
              className="github-grid-month"
              style={{ '--cols': span.weeks } as React.CSSProperties}
            >
              {span.label}
            </span>
          ))}
        </div>
        <div className="github-grid-body">
          <div className="github-grid-rail" aria-hidden>
            {Array.from({ length: GRID_DAYS }, (_, day) => {
              const weekday = (startWeekday + day) % 7
              const label =
                weekday === 1 ? 'Mon' : weekday === 3 ? 'Wed' : weekday === 5 ? 'Fri' : ''
              return <span key={day}>{label}</span>
            })}
          </div>
          <div className="github-grid-track" role="group" aria-label="GitHub contribution activity, last 26 weeks">
            {Array.from({ length: GRID_WEEKS }, (_, week) => (
              <div key={week} className="github-grid-col">
                {Array.from({ length: GRID_DAYS }, (_, day) => {
                  const index = week * GRID_DAYS + day
                  const iso = dates?.[index]
                  const count = counts?.[index]
                  return (
                    <button
                      key={day}
                      type="button"
                      className="github-day"
                      data-level={gridLevels[index] ?? '0'}
                      data-latest={index === (dates?.length ?? 0) - 1 || null}
                      aria-label={
                        iso
                          ? `${count ?? 0} commits on ${fullDayFormatter.format(dateFromIso(iso))}`
                          : `Week ${week + 1} of 26, day ${day + 1}`
                      }
                      style={{ '--ci': index } as React.CSSProperties}
                      onPointerEnter={() => setActiveDay(index)}
                      onFocus={() => setActiveDay(index)}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
