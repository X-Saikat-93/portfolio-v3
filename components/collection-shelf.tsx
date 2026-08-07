import Link from 'next/link'

import { CloudinaryImage } from '~/components/cloudinary-image'
import type { CollectionKind, PortfolioItem } from '~/lib/collections/repository'

const labels: Record<CollectionKind, { singular: string; empty: string }> = {
  book: { singular: 'book', empty: 'Books will appear here when you add and publish them.' },
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
    return <p className="mt-10 text-sm text-muted-foreground">{labels[kind].empty}</p>
  }

  if (kind === 'photo') {
    return (
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.id} className="group">
            <div className="aspect-[3/2] overflow-hidden rounded-sm border border-border bg-muted/20 transition-transform duration-300 ease-[ease] group-hover:-translate-y-1">
              <ItemImage item={item} kind={kind} />
            </div>
            {item.title ? <p className="mt-2 truncate text-xs text-muted-foreground">{item.title}</p> : null}
          </li>
        ))}
      </ul>
    )
  }

  return (
    <ul className="mt-10 divide-y divide-border border-y border-border">
      {items.map((item) => {
        const content = (
          <>
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded-sm border border-border bg-muted/20 transition-transform duration-300 ease-[ease] group-hover:-translate-y-1">
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
          <li key={item.id} className="group flex gap-4 py-4">
            {item.url ? (
              <Link href={item.url} target="_blank" rel="noreferrer" className="flex min-w-0 gap-4">
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
