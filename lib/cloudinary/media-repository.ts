import 'server-only'

import { desc, eq } from 'drizzle-orm'
import { cacheLife, cacheTag, revalidateTag } from 'next/cache'

import { cloudinaryMedia } from '~/db/schema'
import { getDatabase } from '~/db'

const mediaTag = (publicId: string) => `cloudinary-media:${publicId}`

export async function listCloudinaryMedia() {
  return getDatabase()
    .select()
    .from(cloudinaryMedia)
    .orderBy(desc(cloudinaryMedia.createdAt))
}

export async function getCloudinaryMediaByPublicId(publicId: string) {
  const [asset] = await getDatabase()
    .select()
    .from(cloudinaryMedia)
    .where(eq(cloudinaryMedia.publicId, publicId))
    .limit(1)
  return asset ?? null
}

export async function getPublicCloudinaryMediaByPublicId(publicId: string) {
  'use cache'
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 })
  cacheTag(mediaTag(publicId))

  try {
    return await getCloudinaryMediaByPublicId(publicId)
  } catch {
    return null
  }
}

export async function saveCloudinaryMedia(input: {
  publicId: string
  resourceType: string
  format?: string
  secureUrl: string
  originalName?: string
  bytes?: number
  width?: number
  height?: number
}) {
  const database = getDatabase()
  const [asset] = await database
    .insert(cloudinaryMedia)
    .values(input)
    .onConflictDoUpdate({
      target: cloudinaryMedia.publicId,
      set: input,
    })
    .returning()
  revalidateTag(mediaTag(input.publicId), 'max')
  return asset
}

export async function deleteCloudinaryMedia(publicId: string) {
  await getDatabase().delete(cloudinaryMedia).where(eq(cloudinaryMedia.publicId, publicId))
  revalidateTag(mediaTag(publicId), 'max')
}
