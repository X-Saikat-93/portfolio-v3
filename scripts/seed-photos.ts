import { v2 as cloudinary } from 'cloudinary'
import { Pool, type PoolClient } from 'pg'

import { normalizeDatabaseUrl } from '../db/connection-string.ts'

type CloudinaryPhoto = {
  public_id: string
  resource_type: string
  format?: string
  secure_url: string
  original_filename?: string
  bytes?: number
  width?: number
  height?: number
  created_at?: string
  context?: {
    custom?: Record<string, string | undefined>
  }
}

const defaultPhotoPrefix = 'saikat-das/photos/'

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Set ${name} before seeding photos.`)
  return value
}

function normalizePrefix(value: string) {
  const prefix = value.trim().replace(/^\/+/, '')
  return prefix ? `${prefix.replace(/\/+$/, '')}/` : defaultPhotoPrefix
}

function humanize(value: string) {
  return value
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase())
}

function customValue(photo: CloudinaryPhoto, ...keys: string[]) {
  for (const key of keys) {
    const value = photo.context?.custom?.[key]?.trim()
    if (value) return value
  }
  return ''
}

function photoDetails(photo: CloudinaryPhoto, sortOrder: number) {
  const fallbackTitle = photo.public_id.split('/').at(-1) || photo.original_filename || 'Photo'
  const yearValue = customValue(photo, 'year', 'date')
  const year = yearValue && /^\d{4}$/.test(yearValue) ? Number(yearValue) : null
  const sortValue = customValue(photo, 'sortOrder', 'order')
  const parsedSortOrder = sortValue ? Number(sortValue) : Number.NaN

  return {
    title: customValue(photo, 'title', 'name') || humanize(fallbackTitle),
    creator: customValue(photo, 'creator', 'credit', 'location'),
    year,
    description: customValue(photo, 'description', 'caption', 'alt'),
    url: customValue(photo, 'url', 'link') || null,
    sortOrder: Number.isInteger(parsedSortOrder) ? parsedSortOrder : sortOrder,
  }
}

async function listPhotos(prefix: string) {
  const photos: CloudinaryPhoto[] = []
  let nextCursor: string | undefined

  do {
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      prefix,
      max_results: 500,
      ...(nextCursor ? { next_cursor: nextCursor } : {}),
    })
    photos.push(...(result.resources as CloudinaryPhoto[]))
    nextCursor = result.next_cursor
  } while (nextCursor)

  return photos
    .filter((photo) => photo.public_id.startsWith(prefix))
    .sort((left, right) => left.public_id.localeCompare(right.public_id))
}

function cloudinaryStatus(error: unknown) {
  if (typeof error !== 'object' || error === null) return null
  const status = (error as Record<string, unknown>).http_code
  return typeof status === 'number' ? status : null
}

async function getPhoto(publicId: string) {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'image',
      type: 'upload',
    })
    return result as CloudinaryPhoto
  } catch (error) {
    if (cloudinaryStatus(error) === 404) return null
    throw error
  }
}

async function upsertMedia(client: PoolClient, photo: CloudinaryPhoto) {
  await client.query(
    `INSERT INTO cloudinary_media
      (public_id, resource_type, format, secure_url, original_name, bytes, width, height)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (public_id) DO UPDATE SET
       resource_type = EXCLUDED.resource_type,
       format = EXCLUDED.format,
       secure_url = EXCLUDED.secure_url,
       original_name = EXCLUDED.original_name,
       bytes = EXCLUDED.bytes,
       width = EXCLUDED.width,
       height = EXCLUDED.height`,
    [
      photo.public_id,
      photo.resource_type,
      photo.format ?? null,
      photo.secure_url,
      photo.original_filename ?? null,
      photo.bytes ?? null,
      photo.width ?? null,
      photo.height ?? null,
    ],
  )
}

async function upsertPortfolioItem(
  client: PoolClient,
  photo: CloudinaryPhoto,
  details: ReturnType<typeof photoDetails>,
) {
  const updated = await client.query(
    `UPDATE portfolio_items
     SET title = $1, creator = $2, year = $3, description = $4, url = $5,
         status = 'published', sort_order = $6, updated_at = NOW()
     WHERE kind = 'photo' AND image_public_id = $7`,
    [
      details.title,
      details.creator,
      details.year,
      details.description,
      details.url,
      details.sortOrder,
      photo.public_id,
    ],
  )

  if (updated.rowCount === 0) {
    await client.query(
      `INSERT INTO portfolio_items
        (kind, title, creator, year, description, url, image_public_id, status, sort_order)
       VALUES ('photo', $1, $2, $3, $4, $5, $6, 'published', $7)`,
      [
        details.title,
        details.creator,
        details.year,
        details.description,
        details.url,
        photo.public_id,
        details.sortOrder,
      ],
    )
  }
}

async function seed() {
  const cloudName = requiredEnvironment('CLOUDINARY_CLOUD_NAME')
  const apiKey = requiredEnvironment('CLOUDINARY_API_KEY')
  const apiSecret = requiredEnvironment('CLOUDINARY_API_SECRET')
  const connectionString =
    process.env.MIGRATION_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  if (!connectionString) throw new Error('Set MIGRATION_DATABASE_URL or DATABASE_URL before seeding photos.')

  const prefix = normalizePrefix(process.env.CLOUDINARY_PHOTOS_PREFIX || defaultPhotoPrefix)
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })

  const avatarPublicId =
    process.env.NEXT_PUBLIC_CLOUDINARY_AVATAR_PUBLIC_ID?.trim() || 'saikat-das/avatar'
  const [avatar, folderPhotos] = await Promise.all([
    getPhoto(avatarPublicId),
    listPhotos(prefix),
  ])
  const photos = [
    ...(avatar
      ? [
          {
            asset: avatar,
            details: {
              title: 'Portrait',
              creator: 'Saikat Das',
              year: null,
              description: 'Portrait photograph of Saikat Das.',
              url: null,
              sortOrder: 10,
            },
          },
        ]
      : []),
    ...folderPhotos
      .filter((photo) => photo.public_id !== avatarPublicId)
      .map((photo, index) => ({
        asset: photo,
        details: photoDetails(photo, (index + 2) * 10),
      })),
  ]
  if (photos.length === 0) {
    console.log(`No Cloudinary photo assets found under ${prefix} and no avatar was found. Nothing was published.`)
    return
  }

  const pool = new Pool({ connectionString: normalizeDatabaseUrl(connectionString) })
  const client = await pool.connect()
  let inTransaction = false

  try {
    await client.query('BEGIN')
    inTransaction = true

    for (const photo of photos) {
      await upsertMedia(client, photo.asset)
      await upsertPortfolioItem(client, photo.asset, photo.details)
    }

    await client.query('COMMIT')
    inTransaction = false
    console.log(`Seeded ${photos.length} published photo records from Cloudinary (avatar plus ${prefix}).`)
  } catch (error) {
    if (inTransaction) await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

try {
  await seed()
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Photo seed failed.')
  process.exitCode = 1
}
