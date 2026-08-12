export type CloudinaryCrop = 'fill' | 'fit' | 'scale' | 'thumb'

export type CloudinaryImageOptions = {
  width: number
  height?: number
  crop?: CloudinaryCrop
  gravity?: 'auto' | 'center' | 'face'
  version?: string
}

export const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? ''
export const cloudinaryAvatarPublicId =
  process.env.NEXT_PUBLIC_CLOUDINARY_AVATAR_PUBLIC_ID ?? 'saikat-das/avatar'
export const cloudinaryAvatarVersion = process.env.NEXT_PUBLIC_CLOUDINARY_AVATAR_VERSION ?? ''
export const cloudinaryResumePublicId =
  process.env.NEXT_PUBLIC_CLOUDINARY_RESUME_PUBLIC_ID ?? 'saikat-das/resume'
export const cloudinaryOgPublicId =
  process.env.NEXT_PUBLIC_CLOUDINARY_OG_PUBLIC_ID ?? 'saikat-das/og/portfolio-systems-v3'

function encodePublicId(publicId: string) {
  return publicId
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/')
}

export function cloudinaryImageUrl(
  publicId: string,
  {
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    version = publicId === cloudinaryAvatarPublicId ? cloudinaryAvatarVersion : '',
  }: CloudinaryImageOptions,
) {
  if (!cloudinaryCloudName || !publicId) return null

  const transform = [
    `c_${crop}`,
    `w_${Math.max(1, Math.round(width))}`,
    height ? `h_${Math.max(1, Math.round(height))}` : null,
    gravity ? `g_${gravity}` : null,
    'f_auto',
    'q_auto',
  ]
    .filter(Boolean)
    .join(',')

  const url = `https://res.cloudinary.com/${cloudinaryCloudName}/image/upload/${transform}/${encodePublicId(publicId)}`
  return version ? `${url}?v=${encodeURIComponent(version)}` : url
}

export function cloudinaryRawUrl(publicId: string, extension = 'pdf', version = '') {
  if (!cloudinaryCloudName || !publicId) return null
  const suffix = publicId.toLowerCase().endsWith(`.${extension}`) ? '' : `.${extension}`
  const versionSegment = version ? `v${encodeURIComponent(version)}/` : ''
  return `https://res.cloudinary.com/${cloudinaryCloudName}/raw/upload/${versionSegment}${encodePublicId(publicId)}${suffix}`
}
