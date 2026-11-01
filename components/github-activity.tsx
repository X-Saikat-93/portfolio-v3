import { ActivityReadout } from '~/components/activity-readout'
import {
  ACTIVITY_DAYS,
  ACTIVITY_WEEKS,
  activityModel,
  activitySummary,
  CELL,
  CELL_SIZE,
  dateFromIso,
  MONTH_ROW,
} from '~/lib/github-activity'
import type { GitHubSnapshot } from '~/lib/social-live'

const weekFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

function Stat({ value, unit }: { value?: number; unit: string }) {
  // an empty reading (no followers yet) says nothing, so it is left out
  if (!value) return null
  return (
    <div className="activity-stat">
      <dt>{unit}</dt>
      <dd>{value.toLocaleString('en-US')}</dd>
    </div>
  )
}

// The last 26 weeks as ink-density cells: one SVG, one path per density,
// one summary label. Exact weekly figures sit in a table on demand.
export function GitHubActivity({ github }: { github: GitHubSnapshot }) {
  const model = activityModel(github)
  if (!model) {
    return (
      <p className="empty-state" role="status">
        GitHub activity is unavailable right now. It will return when the feed does.
      </p>
    )
  }

  const paths = ['', '', '', '', '']
  for (const { week, day, level } of model.cells) {
    paths[level] += `M${week * CELL} ${MONTH_ROW + day * CELL}h${CELL_SIZE}v${CELL_SIZE}h-${CELL_SIZE}z`
  }
  const width = ACTIVITY_WEEKS * CELL - (CELL - CELL_SIZE)
  const height = MONTH_ROW + ACTIVITY_DAYS * CELL - (CELL - CELL_SIZE)

  return (
    <div className="activity">
      <ActivityReadout
        start={model.start}
        counts={model.counts}
        idle={`${model.total.toLocaleString('en-US')} commits · last ${ACTIVITY_WEEKS} weeks`}
      >
        <svg
          className="activity-cells"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={activitySummary(model)}
        >
          {model.months.map(({ label, week }) => (
            <text key={`${label}-${week}`} className="activity-month" x={week * CELL} y="8">
              {label}
            </text>
          ))}
          {paths.map((d, level) => (d ? <path key={level} className={`activity-l${level}`} d={d} /> : null))}
        </svg>
      </ActivityReadout>

      <dl className="activity-stats">
        <Stat value={github.total} unit="Contributions this year" />
        <Stat value={github.publicRepos} unit="Public repositories" />
        <Stat value={github.followers} unit="Followers" />
      </dl>

      <details className="activity-table">
        <summary>Weekly totals</summary>
        <table>
          <caption className="sr-only">Commits per week, last {ACTIVITY_WEEKS} weeks</caption>
          <thead>
            <tr>
              <th scope="col">Week of</th>
              <th scope="col">Commits</th>
            </tr>
          </thead>
          <tbody>
            {model.weekly.map(({ start, total }) => (
              <tr key={start}>
                <td>
                  <time dateTime={start}>{weekFormatter.format(dateFromIso(start))}</time>
                </td>
                <td>{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}
