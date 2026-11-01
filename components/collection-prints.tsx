import Link from 'next/link'

import { CloudinaryImage } from '~/components/cloudinary-image'
import type { PortfolioItem } from '~/lib/collections/repository'

type Print = {
  kind: string
  href: string
  noun: [singular: string, plural: string]
  items: readonly PortfolioItem[]
  alt: (item: PortfolioItem) => string
}

// Books, records and photographs as small framed prints: the latest item
// in a paper mat, its title, and the size of the collection behind it.
export function CollectionPrints({
  books,
  music,
  photos,
}: {
  books: readonly PortfolioItem[]
  music: readonly PortfolioItem[]
  photos: readonly PortfolioItem[]
}) {
  const prints: Print[] = [
    { kind: 'Books', href: '/en/books', noun: ['book', 'books'], items: books, alt: (b) => `Cover of ${b.title}` },
    { kind: 'Music', href: '/en/music', noun: ['record', 'records'], items: music, alt: (m) => `${m.title} artwork` },
    { kind: 'Photos', href: '/en/photos', noun: ['photograph', 'photographs'], items: photos, alt: (p) => p.description || p.title },
  ]

  return (
    <ul className="prints">
      {prints
        .filter((print) => print.items.length > 0)
        .map(({ kind, href, noun, items, alt }) => {
          const latest = items[0]
          return (
            <li key={kind} className="print">
              <Link href={href} className="print-link">
                <span className="print-mat">
                  {latest.imagePublicId ? (
                    <CloudinaryImage
                      publicId={latest.imagePublicId}
                      alt={alt(latest)}
                      width={480}
                      height={600}
                      crop="fill"
                      sizes="(min-width: 48rem) 12rem, 30vw"
                      loading="lazy"
                      className="print-image"
                    />
                  ) : (
                    <span className="print-blank" aria-hidden="true" />
                  )}
                </span>
                <span className="print-caption">
                  <span className="print-kind">{kind}</span>
                  <span className="print-title">{latest.title}</span>
                  {latest.creator ? <span className="print-creator">{latest.creator}</span> : null}
                  <span className="print-count">
                    {items.length} {items.length === 1 ? noun[0] : noun[1]}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
    </ul>
  )
}
