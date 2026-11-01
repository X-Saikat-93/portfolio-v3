import Link from 'next/link'

import type { PortfolioItem } from '~/lib/collections/repository'
import { formatDate } from '~/lib/date'
import {
  nowBuilding,
  nowLearning,
  nowLastUpdated,
  nowOpenTo,
  type NowEntry,
} from '~/lib/now'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const copy = publicPageMetadata.now.en

// A dated register: each thread is a labelled group on one sheet, its
// entries ruled off beneath. A linked entry's name carries the link.
function Thread({
  id,
  numeral,
  label,
  children,
}: {
  id: string
  numeral: string
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="register-group" aria-labelledby={id}>
      <h2 id={id} className="register-label page-label">
        <span className="register-numeral" aria-hidden="true">
          {numeral}
        </span>
        {label}
      </h2>
      {children}
    </section>
  )
}

function Entries({ entries }: { entries: readonly NowEntry[] }) {
  return (
    <ul className="register-rows">
      {entries.map((entry) => (
        <li key={entry.title} className="register-row">
          <span className="register-head">
            <span className="register-name">
              {entry.href ? (
                <Link href={entry.href} className="register-link">
                  {entry.title}
                </Link>
              ) : (
                entry.title
              )}
            </span>
            {entry.meta ? <span className="register-meta">{entry.meta}</span> : null}
            {entry.href ? (
              <span className="register-arrow" aria-hidden="true">
                ↗
              </span>
            ) : null}
          </span>
          <p className="register-note">{entry.description}</p>
        </li>
      ))}
    </ul>
  )
}

function Reading({ books }: { books: PortfolioItem[] }) {
  if (books.length === 0) {
    return (
      <p className="register-note" role="status">
        No books have been published yet.
      </p>
    )
  }

  return (
    <ul className="register-rows">
      {books.map((book) => (
        <li key={book.id} className="register-row">
          <span className="register-head">
            <span className="register-name">
              {book.url ? (
                <a href={book.url} target="_blank" rel="noreferrer" className="register-link">
                  {book.title}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                book.title
              )}
            </span>
            {book.year ? <span className="register-meta">{book.year}</span> : null}
          </span>
          {book.creator ? <p className="register-note">{book.creator}</p> : null}
        </li>
      ))}
    </ul>
  )
}

export function NowPageView({ books }: { books: PortfolioItem[] }) {
  const updatedAt = new Date(`${nowLastUpdated}T00:00:00+05:30`)

  return (
    <article className="page">
      <header className="page-head">
        <h1 className="page-title">{copy.heading}</h1>
        <p className="page-lede">{copy.lede}</p>
        <p className="page-meta">
          <span className="page-meta-item">
            <span className="status-dot" aria-hidden="true" />
            Updated <time dateTime={nowLastUpdated}>{formatDate(updatedAt)}</time>
          </span>
        </p>
      </header>

      <div className="page-body register paper paper-grain paper-edge">
        <Thread id="now-building" numeral="I" label="Building">
          <Entries entries={nowBuilding} />
        </Thread>
        <Thread id="now-learning" numeral="II" label="Learning">
          <Entries entries={nowLearning} />
        </Thread>
        <Thread id="now-reading" numeral="III" label="Reading">
          <Reading books={books} />
        </Thread>
        <Thread id="now-open-to" numeral="IV" label="Open to">
          <div>
            <ul className="register-rows">
              {nowOpenTo.map((item) => (
                <li key={item} className="register-row register-row-wide">
                  <span className="register-name">{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/en/contact" className="now-contact ink-link">
              Get in touch <span aria-hidden="true">→</span>
            </Link>
          </div>
        </Thread>
      </div>
    </article>
  )
}
