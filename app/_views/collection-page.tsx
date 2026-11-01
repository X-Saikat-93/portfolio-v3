import { CollectionShelf } from '~/components/collection-shelf'
import { MusicExperience, type MusicExperienceItem } from '~/components/music-experience'
import type { CollectionKind, PortfolioItem } from '~/lib/collections/repository'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const copy: Record<CollectionKind, { heading: string; lede: string }> = {
  book: publicPageMetadata.books.en,
  music: publicPageMetadata.music.en,
  photo: publicPageMetadata.photos.en,
}

export function CollectionPageView({
  kind,
  items,
}: {
  kind: CollectionKind
  items: PortfolioItem[]
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
        title={section.heading}
        description={section.lede}
        items={musicItems}
      />
    )
  }

  const noun = kind === 'book' ? ['book', 'books'] : ['photograph', 'photographs']

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-title">{section.heading}</h1>
        <p className="page-lede">{section.lede}</p>
        {items.length > 0 ? (
          <p className="page-meta">
            {items.length} {items.length === 1 ? noun[0] : noun[1]}
          </p>
        ) : null}
      </header>
      <div className="page-body">
        <CollectionShelf kind={kind} items={items} />
      </div>
    </div>
  )
}
