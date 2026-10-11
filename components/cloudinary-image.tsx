'use client'

import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'

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
  fallbackSrc?: string
  preserveAspectRatio?: boolean
}

export function CloudinaryImage({
  publicId,
  width,
  height,
  crop = 'fill',
  gravity = 'auto',
  alt,
  fallbackSrc,
  preserveAspectRatio = false,
  ...props
}: CloudinaryImageProps) {
  const url = cloudinaryImageUrl(publicId, { width, height, crop, gravity })
  const [failed, setFailed] = useState(false)

  if (!url || failed) {
    if (fallbackSrc) {
      return <Image {...props} src={fallbackSrc} alt={alt} width={width} height={height} />
    }

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
      onError={(event) => {
        props.onError?.(event)
        setFailed(true)
      }}
      loader={({ width: requestedWidth }) => {
        const requestedHeight = preserveAspectRatio
          ? Math.max(1, Math.round((height * requestedWidth) / width))
          : height

        return cloudinaryImageUrl(publicId, {
          width: requestedWidth,
          height: requestedHeight,
          crop,
          gravity,
        }) ?? url
      }}
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
      fallbackSrc={props.fallbackSrc ?? '/images/saikat-avatar-preview.webp'}
      crop="fill"
      gravity="face"
    />
  )
}
