import type { CSSProperties } from 'react'

import { GitHubActivityGrid } from '~/components/github-activity-grid'
import { SectionTag } from '~/components/section-tag'
import { GitHubGlyph, type GitHubSnapshot } from '~/components/social-cards'
import { formatMonthDay } from '~/lib/date'
import { T } from '~/lib/i18n'

function Stat({ value, unit }: { value?: number; unit: string }) {
  if (value == null) return null
  return (
    <div className="github-plate-stat">
      <dt className="github-plate-stat-unit">{unit}</dt>
      <dd className="github-plate-stat-value">{value.toLocaleString()}</dd>
    </div>
  )
}

// Homepage live-activity plate: the same contribution blocks shown when
// hovering the GitHub link in the footer, set as a numbered section with a
// hover-inspectable grid and a ruled stat foot.
export function GitHubCommitsSection({
  github,
  index,
}: {
  github: GitHubSnapshot
  index: number
}) {
  const { user, to, levels, weeks, dates, counts } = github
  return (
    <section className="mt-16" aria-labelledby="github-commits-title">
      <div className="flex items-end justify-between gap-4">
        <SectionTag index={index} id="github-commits-title">
          Commits
        </SectionTag>
        <a
          href={`https://github.com/${user}`}
          target="_blank"
          rel="noreferrer"
          className="github-commits-link"
        >
          GitHub
          <span className="github-commits-link-arrow" aria-hidden>
            ↗
          </span>
        </a>
      </div>

      <div
        className="github-plate mt-4 enter"
        style={{ '--enter-delay': '120ms' } as CSSProperties}
      >
        <div className="github-plate-head">
          <span className="github-plate-flag" aria-hidden />
          <span className="github-plate-handle">@{user}</span>
          {to ? (
            <time className="github-plate-updated" dateTime={to}>
              <T zh="更新于" en="updated" /> {formatMonthDay(new Date(`${to}T00:00:00Z`))}
            </time>
          ) : null}
        </div>

        <GitHubActivityGrid levels={levels} weeks={weeks} dates={dates} counts={counts} />

        <dl className="github-plate-foot">
          <Stat value={github.total} unit="contributions · 12mo" />
          <Stat value={github.publicRepos} unit="public repos" />
          <Stat value={github.followers} unit="followers" />
          <GitHubGlyph />
        </dl>
      </div>
    </section>
  )
}
