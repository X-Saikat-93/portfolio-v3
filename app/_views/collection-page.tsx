import { PixelCluster } from '~/components/pixel-cluster'
import { CollectionShelf } from '~/components/collection-shelf'
import type { CollectionKind, PortfolioItem } from '~/lib/collections/repository'

const copy: Record<CollectionKind, { title: string; description: string }> = {
  book: { title: 'Books', description: 'Books Saikat Das is reading, keeping, or recommending.' },
  music: { title: 'Music', description: 'Music Saikat Das is listening to and returning to.' },
  photo: { title: 'Photos', description: 'Photographs by Saikat Das.' },
}

export function CollectionPageView({ kind, items }: { kind: CollectionKind; items: PortfolioItem[] }) {
  const section = copy[kind]
  return (
    <div className="mx-auto w-full max-w-[37.5rem] px-6">
      <div className="flex items-start justify-between gap-4">
        <header>
          <h1 className="page-eyebrow enter">{section.title}</h1>
          <p className="page-introduction enter mt-4 max-w-[31rem] text-balance" style={{ '--enter-delay': '70ms' } as React.CSSProperties}>
            {section.description}
          </p>
        </header>
        <PixelCluster variant={kind === 'book' ? 2 : kind === 'music' ? 3 : 4} className="enter shrink-0" />
      </div>
      <CollectionShelf kind={kind} items={items} />
    </div>
  )
}
