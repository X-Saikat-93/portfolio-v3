import Link from 'next/link'

import { ExternalLabel } from '~/components/external-mark'
import { PixelCluster } from '~/components/pixel-cluster'
import { RevealScope } from '~/components/reveal-scope'
import type { PortfolioItem } from '~/lib/collections/repository'
import { formatDate } from '~/lib/date'
import {
  nowBuilding,
  nowLearning,
  nowLastUpdated,
  nowOpenTo,
  type NowEntry,
} from '~/lib/now'

// A dated ledger: each thread's label hangs in the left margin (and stays
// pinned there while its entries scroll past on wide screens).
function NowThread({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="now-thread" aria-labelledby={id}>
      <h2 id={id} className="now-thread-label">
        <span>{label}</span>
      </h2>
      <div className="now-thread-body">{children}</div>
    </section>
  )
}

function EntryList({ entries }: { entries: readonly NowEntry[] }) {
  return (
    <ul className="now-list motion-list">
      {entries.map((entry) => {
        const copy = (
          <>
            <span className="now-entry-title-row">
              <span className="now-entry-title">{entry.title}</span>
              {entry.meta ? <span className="now-entry-meta">{entry.meta}</span> : null}
            </span>
            <span className="now-entry-description">{entry.description}</span>
          </>
        )

        return (
          <li key={entry.title}>
            {entry.href ? (
              <Link href={entry.href} className="now-entry">
                <span className="now-entry-copy">{copy}</span>
                <span className="now-entry-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ) : (
              <div className="now-entry">
                <span className="now-entry-copy">{copy}</span>
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function ReadingList({ books }: { books: PortfolioItem[] }) {
  if (books.length === 0) {
    return (
      <p className="empty-state text-sm" role="status">
        No books have been published yet.
      </p>
    )
  }

  return (
    <ul className="now-shelf motion-list">
      {books.map((book) => {
        const content = (
          <>
            <span className="now-book-copy">
              <span className="now-book-title">
                {book.url ? <ExternalLabel>{book.title}</ExternalLabel> : book.title}
              </span>
              {book.creator ? <span className="now-book-creator">{book.creator}</span> : null}
            </span>
            {book.year ? <span className="now-book-year">{book.year}</span> : null}
          </>
        )

        return (
          <li key={book.id}>
            {book.url ? (
              <a href={book.url} target="_blank" rel="noreferrer" className="now-book">
                {content}
              </a>
            ) : (
              <div className="now-book">{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function NowPageView({ books }: { books: PortfolioItem[] }) {
  const updatedAt = new Date(`${nowLastUpdated}T00:00:00+05:30`)

  return (
    <article className="now-page mx-auto w-full max-w-[37.5rem] px-6">
      <header className="now-header">
        <div className="flex items-start justify-between gap-4">
          <p className="page-eyebrow enter">Now</p>
          <PixelCluster variant={4} className="enter shrink-0" />
        </div>
        <h1
          className="now-title enter mt-5 text-balance"
          style={{ '--enter-delay': '50ms' } as React.CSSProperties}
        >
          A small public note about what currently has my attention.
        </h1>
        <p
          className="now-lede enter mt-4"
          style={{ '--enter-delay': '90ms' } as React.CSSProperties}
        >
          Work, study threads, books, and the kind of collaboration I am open to.
        </p>
        <p
          className="now-dateline enter"
          style={{ '--enter-delay': '130ms' } as React.CSSProperties}
        >
          <span className="now-dateline-lamp" aria-hidden="true" />
          <span>Updated</span>
          <time dateTime={nowLastUpdated}>{formatDate(updatedAt)}</time>
        </p>
      </header>

      <RevealScope className="now-ledger">
        <NowThread id="now-building" label="Building">
          <EntryList entries={nowBuilding} />
        </NowThread>

        <NowThread id="now-learning" label="Learning">
          <EntryList entries={nowLearning} />
        </NowThread>

        <NowThread id="now-reading" label="Reading">
          <ReadingList books={books} />
        </NowThread>

        <NowThread id="now-open-to" label="Open to">
          <ul className="now-open-list motion-list">
            {nowOpenTo.map((item) => (
              <li key={item} className="now-open-item">
                {item}
              </li>
            ))}
          </ul>
          <Link href="/en/contact" className="now-contact-link">
            Send a note
            <span aria-hidden="true">↗</span>
          </Link>
        </NowThread>
      </RevealScope>
    </article>
  )
}
