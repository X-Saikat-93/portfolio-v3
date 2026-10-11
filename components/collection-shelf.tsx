import Link from 'next/link'

import { CloudinaryImage } from '~/components/cloudinary-image'
import type { CollectionKind, PortfolioItem } from '~/lib/collections/repository'

const labels: Record<CollectionKind, { singular: string; empty: string }> = {
  book: { singular: 'book', empty: 'No books have been published yet.' },
  music: { singular: 'record', empty: 'Music will appear here when you add and publish it.' },
  photo: { singular: 'photo', empty: 'Photos will appear here when you add and publish them.' },
}

function PhotoImage({ item }: { item: PortfolioItem }) {
  if (item.imagePublicId) {
    return (
      <CloudinaryImage
        publicId={item.imagePublicId}
        alt={item.title}
        width={480}
        height={320}
        sizes="(max-width: 640px) 50vw, 240px"
        className="photo-print-image"
      />
    )
  }

  return <span className="photo-print-empty">Image coming soon</span>
}

export function CollectionShelf({
  kind,
  items,
}: {
  kind: CollectionKind
  items: PortfolioItem[]
}) {
  if (items.length === 0) {
    return (
      <p className="empty-state enter mt-10 text-sm" role="status">
        {labels[kind].empty}
      </p>
    )
  }

  if (kind === 'photo') {
    return (
      <ul className="photo-sheet motion-list" aria-label="Photos">
        {items.map((item) => {
          const content = (
            <>
              <span className="photo-print">
                <PhotoImage item={item} />
              </span>
              {item.title ? <span className="photo-print-caption">{item.title}</span> : null}
            </>
          )

          return (
            <li key={item.id} className="photo-sheet-item">
              {item.url ? (
                <Link href={item.url} target="_blank" rel="noreferrer" className="collection-photo-link">
                  {content}
                </Link>
              ) : (
                content
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  // music renders through MusicExperience, so what remains is the book shelf
  return (
    <ul className="book-shelf" aria-label="Books">
      {items.map((item, index) => {
        const content = (
          <>
            <div className="book-cover-wrap">
              <div className="book-cover-shadow" aria-hidden="true" />
              <div className="book-cover-frame">
                {item.imagePublicId ? (
                  <CloudinaryImage
                    publicId={item.imagePublicId}
                    alt={`${item.title} cover artwork`}
                    width={480}
                    height={720}
                    sizes="(max-width: 640px) 42vw, 220px"
                    preload={index === 0}
                    className="book-cover-image"
                  />
                ) : (
                  <span className="book-cover-fallback">{item.title}</span>
                )}
                <span className="book-cover-caption" aria-hidden="true">
                  <span className="book-cover-caption-title">{item.title}</span>
                  {item.creator ? <span className="book-cover-caption-author">{item.creator}</span> : null}
                </span>
              </div>
            </div>
            <span className="book-card-copy">
              <span className="book-card-title">{item.title}</span>
              {item.creator ? <span className="book-card-creator">{item.creator}</span> : null}
              {item.year ? <span className="book-card-year">{item.year}</span> : null}
              {item.description ? <span className="book-card-description">{item.description}</span> : null}
            </span>
          </>
        )

        return (
          <li key={item.id} className="book-shelf-item" data-book-index={index}>
            {item.url ? (
              <Link href={item.url} target="_blank" rel="noreferrer" className="book-card">
                {content}
              </Link>
            ) : (
              <div className="book-card book-card-static">{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
