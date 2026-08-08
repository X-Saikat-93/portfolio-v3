// @vitest-environment jsdom

import { cleanup, fireEvent, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GitHubActivityGrid } from './github-activity-grid'

const DATES = Array.from({ length: 26 * 7 }, (_, index) => {
  const day = new Date(Date.UTC(2026, 0, 1 + index))
  return day.toISOString().slice(0, 10)
})

beforeEach(() => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      get matches() {
        return query === '(prefers-reduced-motion: reduce)' && false
      },
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('GitHub activity grid', () => {
  it('renders 26 week columns of 7 day cells each', () => {
    const { container } = render(
      <GitHubActivityGrid levels={'0123'.repeat(46)} dates={DATES} counts={DATES.map(() => 1)} />,
    )

    expect(container.querySelectorAll('.github-grid-col')).toHaveLength(26)
    expect(container.querySelectorAll('.github-day')).toHaveLength(26 * 7)
  })

  it('shows a composed empty state without activity data', () => {
    const { container } = render(<GitHubActivityGrid />)

    expect(container.textContent).toContain('GitHub activity will appear here')
  })

  it('reveals the hovered day count and date in the readout', () => {
    const counts = DATES.map((_, index) => (index === 10 ? 7 : 0))
    const { container } = render(<GitHubActivityGrid levels={'0'.repeat(26 * 7)} dates={DATES} counts={counts} />)

    const days = container.querySelectorAll('.github-day')
    fireEvent.pointerEnter(days[10])

    expect(container.textContent).toContain('7')
    expect(container.textContent).toContain('Jan 11')

    fireEvent.pointerLeave(container.querySelector('.github-grid-zone') as HTMLElement)
    expect(container.textContent).toContain('last 26 weeks')
  })

  it('maps cell colors to the recent window, not the start of the year', () => {
    const levels = '0'.repeat(18) + '4'.repeat(26 * 7)
    const { container } = render(
      <GitHubActivityGrid levels={levels} dates={DATES} counts={DATES.map(() => 1)} />,
    )

    const days = container.querySelectorAll('.github-day')
    expect((days[0] as HTMLElement).dataset.level).toBe('4')
    expect((days[26 * 7 - 1] as HTMLElement).dataset.level).toBe('4')
  })

  it('falls back to weekly totals when day data is missing', () => {
    const weeks = Array.from({ length: 26 }, (_, week) => week * 10)
    const { container } = render(<GitHubActivityGrid levels={'0'.repeat(26 * 7)} weeks={weeks} />)

    const dayInWeek12 = container.querySelectorAll('.github-day')[11 * 7]
    fireEvent.pointerEnter(dayInWeek12)

    expect(container.textContent).toContain('110')
    expect(container.textContent).toContain('week 12')

    fireEvent.pointerLeave(container.querySelector('.github-grid-zone') as HTMLElement)
    expect(container.textContent).toContain('last 26 weeks')
  })
})
