import { CloudinaryImage } from '~/components/cloudinary-image'

export type MusicArtworkItem = {
  title: string
  creator?: string | null
  imagePublicId?: string | null
}

export function MusicRecordArtwork({
  item,
  size = 'feature',
  eager = false,
}: {
  item: MusicArtworkItem
  size?: 'feature' | 'home' | 'inline'
  eager?: boolean
}) {
  return (
    <div className={`music-record-artwork music-record-artwork--${size}`}>
      <span className="music-record-disc" aria-hidden="true">
        <span className="music-record-disc-label" />
      </span>
      <span className="music-record-sleeve">
        {item.imagePublicId ? (
          <CloudinaryImage
            publicId={item.imagePublicId}
            alt={`${item.title} artwork`}
            width={1000}
            height={1000}
            preserveAspectRatio
            sizes={size === 'feature' ? '(max-width: 63.99rem) 84vw, 39rem' : size === 'home' ? '4rem' : '2.75rem'}
            loading={eager ? 'eager' : 'lazy'}
            className="music-record-image"
          />
        ) : (
          <span className="music-record-fallback">
            <span>{item.title}</span>
            {item.creator ? <span>{item.creator}</span> : null}
          </span>
        )}
      </span>
    </div>
  )
}
