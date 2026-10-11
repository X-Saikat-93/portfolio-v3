import type { CSSProperties } from 'react'

import { GitHubActivityGrid } from '~/components/github-activity-grid'
import { SectionTag } from '~/components/section-tag'
import { TechStackRegister } from '~/components/tech-stack-register'
import { GitHubGlyph, type GitHubSnapshot } from '~/components/social-cards'
import { formatMonthDay } from '~/lib/date'
import { T } from '~/lib/i18n'

function Stat({ value, unit }: { value?: number; unit: string }) {
  // an empty reading (no followers yet) says nothing, so it is left out
  if (!value) return null
  return (
    <div className="github-plate-stat">
      <dt className="github-plate-stat-unit">{unit}</dt>
      <dd className="github-plate-stat-value">{value.toLocaleString()}</dd>
    </div>
  )
}

// Homepage "Code" section: the live GitHub activity plate (the same
// contribution blocks as the footer hover card; a playhead sweeps the grid
// in on reveal, rests on today, and follows the inspected week), then the
// verified stack those commits are written in.
export function CodeSection({
  github,
  index,
}: {
  github: GitHubSnapshot
  index: number
}) {
  const { user, to, levels, weeks, dates, counts } = github
  return (
    <section className="code-section mt-16" aria-labelledby="code-title">
      <div className="flex items-end justify-between gap-4">
        <SectionTag index={index} id="code-title">
          Code
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
          <GitHubGlyph />
          <span className="github-plate-handle">@{user}</span>
          {to ? (
            <time className="github-plate-updated" dateTime={to}>
              <T zh="更新于" en="updated" /> {formatMonthDay(new Date(`${to}T00:00:00Z`))}
            </time>
          ) : null}
        </div>

        <GitHubActivityGrid levels={levels} weeks={weeks} dates={dates} counts={counts} />

        <dl className="github-plate-foot">
          <Stat value={github.total} unit="contributions this year" />
          <Stat value={github.publicRepos} unit="public repositories" />
          <Stat value={github.followers} unit="followers" />
        </dl>
      </div>

      <h3 className="code-stack-title">Written with</h3>
      <TechStackRegister />
    </section>
  )
}
