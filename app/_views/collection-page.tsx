import { PixelCluster } from '~/components/pixel-cluster'
import { CollectionShelf } from '~/components/collection-shelf'
import { MusicExperience, type MusicExperienceItem } from '~/components/music-experience'
import type { CollectionKind, PortfolioItem } from '~/lib/collections/repository'

const copy: Record<CollectionKind, { title: string; description: string }> = {
  book: { title: 'Books', description: 'Books Saikat Das is reading, keeping, or recommending.' },
  music: { title: 'Music', description: 'Music Saikat Das is listening to and returning to.' },
  photo: { title: 'Photos', description: 'Photographs by Saikat Das.' },
}

export function CollectionPageView({
  kind,
  items,
  displayFontClassName,
}: {
  kind: CollectionKind
  items: PortfolioItem[]
  displayFontClassName?: string
}) {
  const section = copy[kind]

  if (kind === 'music') {
    const musicItems: MusicExperienceItem[] = items.map((item) => ({
      id: item.id,
      title: item.title,
      creator: item.creator,
      year: item.year,
      url: item.url,
      imagePublicId: item.imagePublicId,
    }))

    return (
      <MusicExperience
        title={section.title}
        description={section.description}
        items={musicItems}
        displayFontClassName={displayFontClassName}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-[37.5rem] px-6">
      <div className="flex items-start justify-between gap-4">
        <header>
          <h1 className="page-eyebrow enter">{section.title}</h1>
          <p className="page-introduction enter mt-4 max-w-[31rem] text-balance" style={{ '--enter-delay': '70ms' } as React.CSSProperties}>
            {section.description}
          </p>
        </header>
        <PixelCluster variant={kind === 'book' ? 2 : 4} className="enter shrink-0" />
      </div>
      <CollectionShelf kind={kind} items={items} />
    </div>
  )
}
