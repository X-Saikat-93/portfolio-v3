import 'server-only'

import { desc, eq } from 'drizzle-orm'

import { cloudinaryMedia } from '~/db/schema'
import { getDatabase } from '~/db'

export async function listCloudinaryMedia() {
  return getDatabase()
    .select()
    .from(cloudinaryMedia)
    .orderBy(desc(cloudinaryMedia.createdAt))
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
  return asset
}

export async function deleteCloudinaryMedia(publicId: string) {
  await getDatabase().delete(cloudinaryMedia).where(eq(cloudinaryMedia.publicId, publicId))
}
