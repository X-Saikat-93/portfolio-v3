import type { CSSProperties } from 'react'
import Link from 'next/link'

import { CloudinaryImage } from '~/components/cloudinary-image'
import type { PortfolioItem } from '~/lib/collections/repository'

// Thickness, length and set-back cycle in a fixed order, so the stack looks
// piled by hand but renders the same on every request. The longest books
// sit at the bottom.
const STACK = [
  { t: 1.75, len: 84, x: 0.5, ink: 'ink' },
  { t: 2.125, len: 90, x: 0.125, ink: 'indigo' },
  { t: 1.625, len: 86, x: 0.75, ink: 'paper' },
  { t: 2, len: 93, x: 0.25, ink: 'kraft' },
  { t: 1.875, len: 89, x: 0.625, ink: 'matcha' },
  { t: 2.25, len: 96, x: 0, ink: 'ink' },
  { t: 1.75, len: 94, x: 0.375, ink: 'kraft' },
  { t: 2.375, len: 100, x: 0.125, ink: 'indigo' },
] as const

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`
}

function Note({ kind, title, href, count }: { kind: string; title?: string; href: string; count: string }) {
  return (
    <p className="collection-note">
      <span className="collection-kind">{kind}</span>
      {title ? <span className="collection-title">{title}</span> : null}
      <Link href={href} className="collection-count ink-link">
        {count}
      </Link>
    </p>
  )
}

// Collections as three objects resting on one ruled line: the reading list
// as a stack of books (one slides out under the pointer), the first record
// in its sleeve with the disc showing, and the first photograph mounted
// with corners.
export function HomeShelf({
  books,
  music,
  photos,
}: {
  books: readonly PortfolioItem[]
  music: readonly PortfolioItem[]
  photos: readonly PortfolioItem[]
}) {
  const record = music[0]
  const photo = photos[0]

  return (
    <div className="collection">
      {books.length > 0 ? (
        <div className="collection-piece collection-books">
          <div className="collection-object">
            <ul className="stack" aria-label={`Books, ${plural(books.length, 'book', 'books')}`}>
              {books.slice(0, STACK.length).map((book, i) => {
                const spine = STACK[i]
                return (
                  <li
                    key={book.id}
                    className="stack-book"
                    data-ink={spine.ink}
                    style={{ '--t': `${spine.t}rem`, '--len': `${spine.len}%`, '--x': `${spine.x}rem` } as CSSProperties}
                  >
                    <Link href="/en/books" className="stack-spine">
                      <span className="stack-title">{book.title}</span>
                      {book.creator ? <span className="sr-only"> by {book.creator}</span> : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
          <Note kind="Books" href="/en/books" count={plural(books.length, 'book', 'books')} />
        </div>
      ) : null}

      {record ? (
        <div className="collection-piece collection-record">
          <div className="collection-object">
            <Link
              href="/en/music"
              className="record"
              aria-label={`${record.title}${record.creator ? ` by ${record.creator}` : ''}, in Music`}
            >
              <span className="record-disc" aria-hidden="true" />
              <span className="record-sleeve">
                {record.imagePublicId ? (
                  <CloudinaryImage
                    publicId={record.imagePublicId}
                    alt=""
                    width={480}
                    height={480}
                    crop="fill"
                    sizes="(min-width: 64rem) 14rem, 40vw"
                    loading="lazy"
                    className="record-art"
                  />
                ) : null}
              </span>
            </Link>
          </div>
          <Note
            kind="Music"
            title={record.creator ? `${record.title} · ${record.creator}` : record.title}
            href="/en/music"
            count={plural(music.length, 'record', 'records')}
          />
        </div>
      ) : null}

      {photo ? (
        <div className="collection-piece collection-photo">
          <div className="collection-object">
            <Link href="/en/photos" className="mount" aria-label={`${photo.title}, in Photos`}>
              <span className="mount-print">
                {photo.imagePublicId ? (
                  <CloudinaryImage
                    publicId={photo.imagePublicId}
                    alt={photo.description || photo.title}
                    width={480}
                    height={600}
                    crop="fill"
                    sizes="(min-width: 64rem) 12rem, 40vw"
                    loading="lazy"
                    className="mount-image"
                  />
                ) : null}
              </span>
            </Link>
          </div>
          <Note kind="Photos" title={photo.title} href="/en/photos" count={plural(photos.length, 'photograph', 'photographs')} />
        </div>
      ) : null}
    </div>
  )
}
