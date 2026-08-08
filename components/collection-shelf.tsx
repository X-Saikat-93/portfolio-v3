import Link from 'next/link'

import { CloudinaryImage } from '~/components/cloudinary-image'
import type { CollectionKind, PortfolioItem } from '~/lib/collections/repository'

const labels: Record<CollectionKind, { singular: string; empty: string }> = {
  book: { singular: 'book', empty: 'No books have been published yet.' },
  music: { singular: 'record', empty: 'Music will appear here when you add and publish it.' },
  photo: { singular: 'photo', empty: 'Photos will appear here when you add and publish them.' },
}

function ItemImage({ item, kind }: { item: PortfolioItem; kind: CollectionKind }) {
  if (item.imagePublicId) {
    return (
      <CloudinaryImage
        publicId={item.imagePublicId}
        alt={item.title}
        width={kind === 'photo' ? 480 : 220}
        height={kind === 'photo' ? 320 : 280}
        sizes={kind === 'photo' ? '(max-width: 640px) 50vw, 240px' : '112px'}
        className="h-full w-full object-cover"
      />
    )
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-muted/40 px-3 text-center text-xs text-muted-foreground">
      {kind === 'photo' ? 'Image coming soon' : item.title}
    </span>
  )
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
      <ul className="motion-list mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const content = (
            <>
              <div
                className={`aspect-[3/2] overflow-hidden rounded-sm border border-border bg-muted/20${
                  item.url ? ' transition-transform duration-300 ease-[ease] group-hover:-translate-y-1' : ''
                }`}
              >
                <ItemImage item={item} kind={kind} />
              </div>
              {item.title ? (
                <p className="mt-2 truncate text-xs text-muted-foreground">{item.title}</p>
              ) : null}
            </>
          )

          return (
            <li key={item.id} className={item.url ? 'group' : undefined}>
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

  if (kind === 'book') {
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

  return (
    <ul className="motion-list mt-10 divide-y divide-border border-y border-border">
      {items.map((item) => {
        const content = (
          <>
            <div className={`h-28 w-24 shrink-0 overflow-hidden rounded-sm border border-border bg-muted/20${item.url ? ' transition-transform duration-300 ease-[ease] group-hover:-translate-y-1' : ''}`}>
              <ItemImage item={item} kind={kind} />
            </div>
            <span className="min-w-0 py-1">
              <span className="block truncate text-sm font-medium text-foreground">{item.title}</span>
              {item.creator ? <span className="mt-1 block truncate text-sm text-muted-foreground">{item.creator}</span> : null}
              {item.year ? <span className="mt-2 block text-xs tabular-nums text-muted-foreground">{item.year}</span> : null}
              {item.description ? <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{item.description}</span> : null}
            </span>
          </>
        )

        return (
          <li key={item.id} className={`flex gap-4 py-4${item.url ? ' group' : ''}`}>
            {item.url ? (
              <Link href={item.url} target="_blank" rel="noreferrer" className="collection-row-link flex min-w-0 gap-4">
                {content}
              </Link>
            ) : (
              <div className="flex min-w-0 gap-4">{content}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
