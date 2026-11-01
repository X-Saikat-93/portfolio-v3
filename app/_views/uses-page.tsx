import Link from 'next/link'

import { formatDate } from '~/lib/date'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { toRoman } from '~/lib/roman'
import { usesGroups, usesLastUpdated, type UsesGroup } from '~/lib/uses'

const copy = publicPageMetadata.uses.en

// An inventory on one register sheet: each group a labelled block, each
// line the tool and what it is used for. Empty groups are not printed.
function UsesGroupBlock({ group, index }: { group: UsesGroup; index: number }) {
  return (
    <section className="register-group" aria-labelledby={`uses-${group.id}`}>
      <h2 id={`uses-${group.id}`} className="register-label page-label">
        <span className="register-numeral" aria-hidden="true">
          {toRoman(index + 1)}
        </span>
        {group.label}
      </h2>
      <ul className="register-rows">
        {group.items.map((item) => (
          <li key={item.name} className="register-row">
            <span className="register-head">
              <span className="register-name">
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer" className="register-link">
                    {item.name}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  item.name
                )}
              </span>
              {item.href ? (
                <span className="register-arrow" aria-hidden="true">
                  ↗
                </span>
              ) : null}
            </span>
            <p className="register-note">{item.note}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function UsesPageView() {
  const groups = usesGroups.filter((group) => group.items.length > 0)
  const updatedAt = new Date(`${usesLastUpdated}T00:00:00+05:30`)

  return (
    <article className="page">
      <header className="page-head">
        <h1 className="page-title">{copy.heading}</h1>
        <p className="page-lede">{copy.lede}</p>
        <p className="page-meta">
          <span className="page-meta-item">
            <span className="status-dot" aria-hidden="true" />
            Updated <time dateTime={usesLastUpdated}>{formatDate(updatedAt)}</time>
          </span>
        </p>
      </header>

      <div className="page-body register paper paper-grain paper-edge">
        {groups.map((group, index) => (
          <UsesGroupBlock key={group.id} group={group} index={index} />
        ))}
      </div>

      <p className="page-foot">
        What I am building with it now is on the{' '}
        <Link href="/en/now" className="ink-link">
          Now page
        </Link>
        .
      </p>
    </article>
  )
}
