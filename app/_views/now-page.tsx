import Link from 'next/link'

import { ExternalLabel } from '~/components/external-mark'
import { PixelCluster } from '~/components/pixel-cluster'
import { SectionTag } from '~/components/section-tag'
import type { PortfolioItem } from '~/lib/collections/repository'
import { formatDate } from '~/lib/date'
import {
  nowBuilding,
  nowLearning,
  nowLastUpdated,
  nowOpenTo,
  type NowEntry,
} from '~/lib/now'

function EntryList({ entries }: { entries: readonly NowEntry[] }) {
  return (
    <ul className="now-list">
      {entries.map((entry, index) => (
        <li key={entry.title} className="now-entry">
          <span className="now-entry-index" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="now-entry-copy">
            <span className="now-entry-title-row">
              {entry.href ? (
                <Link href={entry.href} className="now-entry-title">
                  {entry.title}
                </Link>
              ) : (
                <span className="now-entry-title">{entry.title}</span>
              )}
              {entry.meta ? <span className="now-entry-meta">{entry.meta}</span> : null}
            </span>
            <span className="now-entry-description">{entry.description}</span>
          </span>
          {entry.href ? (
            <span className="now-entry-arrow" aria-hidden="true">
              ↗
            </span>
          ) : null}
        </li>
      ))}
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
    <ul className="now-list">
      {books.map((book, index) => {
        const content = (
          <>
            <span className="now-entry-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="now-entry-copy">
              <span className="now-entry-title-row">
                <span className="now-entry-title">{book.title}</span>
                {book.year ? <span className="now-entry-meta">{book.year}</span> : null}
              </span>
              {book.creator ? <span className="now-entry-description">{book.creator}</span> : null}
            </span>
          </>
        )

        return (
          <li key={book.id} className="now-entry">
            {book.url ? (
              <a href={book.url} target="_blank" rel="noreferrer" className="now-book-link">
                {content}
                <span className="now-entry-arrow" aria-hidden="true">
                  <ExternalLabel>↗</ExternalLabel>
                </span>
              </a>
            ) : (
              content
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
    <article className="now-page mx-auto w-full max-w-[54rem] px-6">
      <header className="now-header enter">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="page-eyebrow">Now</p>
              <h1 className="now-title mt-5 text-balance">
                A small public note about what currently has my attention.
              </h1>
            </div>
            <PixelCluster variant={4} className="shrink-0 sm:hidden" />
          </div>
          <p className="now-lede mt-4">
            Work, study threads, books, and the kind of collaboration I am open to.
          </p>
        </div>
        <div className="now-header-mark">
          <PixelCluster variant={4} className="hidden sm:block" />
          <p className="now-updated">
            <span>Last updated</span>
            <time dateTime={nowLastUpdated}>{formatDate(updatedAt)}</time>
          </p>
        </div>
      </header>

      <div className="now-register">
        <section className="now-section now-section-wide" aria-labelledby="now-building">
          <SectionTag index={1} id="now-building">
            Building
          </SectionTag>
          <EntryList entries={nowBuilding} />
        </section>

        <section className="now-section" aria-labelledby="now-learning">
          <SectionTag index={2} id="now-learning">
            Learning
          </SectionTag>
          <EntryList entries={nowLearning} />
        </section>

        <section className="now-section" aria-labelledby="now-reading">
          <SectionTag index={3} id="now-reading">
            Reading
          </SectionTag>
          <ReadingList books={books} />
        </section>

        <section className="now-section now-section-wide" aria-labelledby="now-open-to">
          <SectionTag index={4} id="now-open-to">
            Open to
          </SectionTag>
          <ul className="now-open-list">
            {nowOpenTo.map((item, index) => (
              <li key={item} className="now-open-item">
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="now-contact-note">
            If the thread overlaps with your work, <Link href="/en/contact">send a note</Link>.
          </p>
        </section>
      </div>
    </article>
  )
}
