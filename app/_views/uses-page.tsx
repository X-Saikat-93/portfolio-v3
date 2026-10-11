import Link from 'next/link'

import { ExternalLabel } from '~/components/external-mark'
import { PixelCluster } from '~/components/pixel-cluster'
import { RevealScope } from '~/components/reveal-scope'
import { formatDate } from '~/lib/date'
import { usesGroups, usesLastUpdated, type UsesGroup } from '~/lib/uses'

// An inventory sheet: each group is a numbered plate, each line runs name,
// dotted leader, note, like a parts list. Empty groups are not printed.
function UsesPlate({ group, index }: { group: UsesGroup; index: number }) {
  return (
    <section className="uses-plate" aria-labelledby={`uses-${group.id}`}>
      <h2 id={`uses-${group.id}`} className="uses-plate-label">
        <span className="uses-plate-index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span>{group.label}</span>
      </h2>
      <ul className="uses-list motion-list">
        {group.items.map((item, i) => (
          <li key={item.name} className="uses-item" style={{ '--i': i } as React.CSSProperties}>
            <span className="uses-item-name">
              {item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer" className="uses-item-link">
                  <ExternalLabel>{item.name}</ExternalLabel>
                </a>
              ) : (
                item.name
              )}
            </span>
            <span className="uses-item-leader" aria-hidden="true" />
            <span className="uses-item-note">{item.note}</span>
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
    <article className="uses-page mx-auto w-full max-w-[37.5rem] px-6">
      <header className="uses-header">
        <div className="flex items-start justify-between gap-4">
          <p className="page-eyebrow enter">Uses</p>
          <PixelCluster variant={3} className="enter shrink-0" />
        </div>
        <h1
          className="uses-title enter mt-5 text-balance"
          style={{ '--enter-delay': '50ms' } as React.CSSProperties}
        >
          The kit the work gets done with.
        </h1>
        <p className="uses-lede enter mt-4" style={{ '--enter-delay': '90ms' } as React.CSSProperties}>
          Stack, services, and what this site itself runs on. Kept short and reviewed by hand.
        </p>
        <p className="uses-dateline enter" style={{ '--enter-delay': '130ms' } as React.CSSProperties}>
          <span className="uses-dateline-lamp" aria-hidden="true" />
          <span>Updated</span>
          <time dateTime={usesLastUpdated}>{formatDate(updatedAt)}</time>
        </p>
      </header>

      <RevealScope className="uses-register">
        {groups.map((group, index) => (
          <UsesPlate key={group.id} group={group} index={index} />
        ))}
      </RevealScope>

      <p className="uses-foot enter-swing">
        What I am building with it right now is on the <Link href="/en/now">Now page</Link>.
      </p>
    </article>
  )
}
