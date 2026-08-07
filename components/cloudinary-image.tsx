import Image, { type ImageProps } from 'next/image'

import {
  cloudinaryAvatarPublicId,
  cloudinaryImageUrl,
  type CloudinaryCrop,
} from '~/lib/cloudinary/image-url'

type CloudinaryImageProps = Omit<ImageProps, 'src' | 'loader' | 'width' | 'height'> & {
  publicId: string
  width: number
  height: number
  crop?: CloudinaryCrop
  gravity?: 'auto' | 'center' | 'face'
}

export function CloudinaryImage({
  publicId,
  width,
  height,
  crop = 'fill',
  gravity = 'auto',
  alt,
  ...props
}: CloudinaryImageProps) {
  const url = cloudinaryImageUrl(publicId, { width, height, crop, gravity })
  if (!url) {
    return (
      <span
        aria-label={alt}
        role={alt ? 'img' : undefined}
        className={props.className}
        style={{
          display: 'inline-flex',
          width,
          height,
          alignItems: 'center',
          justifyContent: 'center',
          ...props.style,
        }}
      >
        SD
      </span>
    )
  }

  return (
    <Image
      {...props}
      src={publicId}
      alt={alt}
      width={width}
      height={height}
      loader={({ width: requestedWidth }) =>
        cloudinaryImageUrl(publicId, {
          width: requestedWidth,
          height,
          crop,
          gravity,
        }) ?? url
      }
    />
  )
}

export function CloudinaryAvatar(
  props: Omit<CloudinaryImageProps, 'publicId' | 'width' | 'height'> & {
    width?: number
    height?: number
  },
) {
  const width = props.width ?? 40
  const height = props.height ?? 40
  return (
    <CloudinaryImage
      {...props}
      publicId={cloudinaryAvatarPublicId}
      width={width}
      height={height}
      crop="fill"
      gravity="face"
    />
  )
}
