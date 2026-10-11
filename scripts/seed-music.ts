import { v2 as cloudinary } from 'cloudinary'
import { Pool, type PoolClient } from 'pg'

import { normalizeDatabaseUrl } from '../db/connection-string.ts'

const music = [
  {
    title: 'Closer',
    creator: 'The Chainsmokers, Halsey',
    year: 2016,
    description:
      'The gateway pick: immediate, hook-heavy, and still their clearest pop-electronic crossover.',
    url: 'https://open.spotify.com/track/7BKLCZ1jbUBVqRi2FVlTVw',
    sortOrder: 10,
  },
  {
    title: "Don't Let Me Down",
    creator: 'The Chainsmokers, Daya',
    year: 2016,
    description:
      'For a harder start: a tight build and vocal lift when a stubborn bug needs a reset.',
    url: 'https://open.spotify.com/track/1i1fxkWeaMmKEB4T7zqbzK',
    sortOrder: 20,
  },
  {
    title: 'Roses',
    creator: 'The Chainsmokers, ROZES',
    year: 2015,
    description:
      'The softer entry: spare, melodic, and good for the first quiet hour of a long build.',
    url: 'https://open.spotify.com/track/7HZk5WvfSrkIfk6iOYMhSu',
    sortOrder: 30,
  },
  {
    title: 'Something Just Like This',
    creator: 'The Chainsmokers, Coldplay',
    year: 2017,
    description:
      'Large-scale and optimistic; a momentum track for a shipping push or a long deploy window.',
    url: 'https://open.spotify.com/track/1dNIEtp7AY3oDAKCGg2XkH',
    sortOrder: 40,
  },
  {
    title: 'Paris',
    creator: 'The Chainsmokers',
    year: 2017,
    description:
      'A restrained, nocturnal cut that works well behind reading, architecture, and review work.',
    url: 'https://open.spotify.com/track/15vzANxN8G9wWfwAJLLMCg',
    sortOrder: 50,
  },
  {
    title: 'All We Know',
    creator: 'The Chainsmokers, Phoebe Ryan',
    year: 2016,
    description:
      'Bittersweet and low-key; a late-evening choice when the task is more thinking than typing.',
    url: 'https://open.spotify.com/track/4NBTZtAt1F13VvlSKe6KTl',
    sortOrder: 60,
  },
  {
    title: 'This Feeling',
    creator: 'The Chainsmokers, Kelsea Ballerini',
    year: 2018,
    description:
      'A brighter, guitar-leaning pivot that breaks up a long electronic run without losing pace.',
    url: 'https://open.spotify.com/track/6WjFvdsFkuBtXgz27ixBCL',
    sortOrder: 70,
  },
  {
    title: 'Takeaway',
    creator: 'The Chainsmokers, ILLENIUM, Lennon Stella',
    year: 2019,
    description:
      'A cinematic collaboration for the final stretch of a project or a late-night refactor.',
    url: 'https://open.spotify.com/track/6wo37KVqFJhtuxPTpLCcfe',
    sortOrder: 80,
  },
  {
    title: 'Addicted',
    creator: 'Zerb, The Chainsmokers, Ink',
    year: 2024,
    description:
      'Short, punchy, and modern; ideal for a quick loop of small tasks between deeper sessions.',
    url: 'https://open.spotify.com/track/5ZUIPLoTLJZrPQh2kFZEUM',
    sortOrder: 90,
  },
  {
    title: 'Love Is Kind',
    creator: 'The Chainsmokers, Oaks',
    year: 2026,
    description:
      'A current-era pick that shows a softer, more open side of the duo on their latest collaboration.',
    url: 'https://open.spotify.com/album/0wP1ridvw0gHq6gOkIrLBU',
    sortOrder: 100,
  },
] as const

type UploadedImage = Awaited<ReturnType<typeof cloudinary.uploader.upload>>

type SpotifyOEmbed = {
  thumbnail_url?: string
  thumbnail_width?: number
  thumbnail_height?: number
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function fetchSpotifyCover(url: string) {
  const metadataResponse = await fetch(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
  )
  if (!metadataResponse.ok) {
    throw new Error(`Spotify artwork metadata failed for ${url} (${metadataResponse.status}).`)
  }

  const metadata = (await metadataResponse.json()) as SpotifyOEmbed
  if (!metadata.thumbnail_url) {
    throw new Error(`Spotify did not return cover artwork for ${url}.`)
  }

  const imageResponse = await fetch(metadata.thumbnail_url)
  if (!imageResponse.ok) {
    throw new Error(`Spotify cover download failed for ${url} (${imageResponse.status}).`)
  }

  const contentType = imageResponse.headers.get('content-type')?.split(';', 1)[0] || 'image/jpeg'
  if (!contentType.startsWith('image/')) {
    throw new Error(`Spotify returned a non-image cover for ${url}.`)
  }

  const bytes = Buffer.from(await imageResponse.arrayBuffer())
  if (bytes.length === 0 || bytes.length > 10_000_000) {
    throw new Error(`Spotify cover has an invalid size for ${url}.`)
  }

  return `data:${contentType};base64,${bytes.toString('base64')}`
}

async function uploadSpotifyCovers(): Promise<Map<string, UploadedImage>> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || 'saikat-das'

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET before seeding music.',
    )
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })

  const covers = new Map<string, UploadedImage>()
  for (const item of music) {
    const slug = slugify(item.title)
    const image = await fetchSpotifyCover(item.url)
    const asset = await cloudinary.uploader.upload(image, {
      folder,
      public_id: `music-covers/chainsmokers/${slug}`,
      overwrite: true,
      invalidate: true,
      resource_type: 'image',
    })
    covers.set(item.title, asset)
  }

  return covers
}

async function upsertMedia(client: PoolClient, cover: UploadedImage, originalName: string) {
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
      cover.public_id,
      cover.resource_type,
      cover.format,
      cover.secure_url,
      originalName,
      cover.bytes,
      cover.width,
      cover.height,
    ],
  )
}

async function seed() {
  const connectionString = process.env.MIGRATION_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  if (!connectionString) throw new Error('Set MIGRATION_DATABASE_URL or DATABASE_URL before seeding music.')

  const covers = await uploadSpotifyCovers()
  const pool = new Pool({ connectionString: normalizeDatabaseUrl(connectionString) })
  const client = await pool.connect()
  let inTransaction = false

  try {
    await client.query('BEGIN')
    inTransaction = true

    for (const item of music) {
      const cover = covers.get(item.title)
      if (!cover) throw new Error(`Spotify cover upload missing for ${item.title}.`)
      await upsertMedia(client, cover, `${slugify(item.title)}.jpg`)

      const updated = await client.query(
        `UPDATE portfolio_items
         SET creator = $1, year = $2, description = $3, url = $4,
             image_public_id = $5, status = 'published', sort_order = $6, updated_at = NOW()
         WHERE kind = 'music' AND title = $7`,
        [
          item.creator,
          item.year,
          item.description,
          item.url,
          cover.public_id,
          item.sortOrder,
          item.title,
        ],
      )

      if (updated.rowCount === 0) {
        await client.query(
          `INSERT INTO portfolio_items
            (kind, title, creator, year, description, url, image_public_id, status, sort_order)
           VALUES ('music', $1, $2, $3, $4, $5, $6, 'published', $7)`,
          [
            item.title,
            item.creator,
            item.year,
            item.description,
            item.url,
            cover.public_id,
            item.sortOrder,
          ],
        )
      }
    }

    await client.query('COMMIT')
    inTransaction = false
    console.log(`Seeded ${music.length} music records with individual Spotify covers.`)
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
  console.error(error instanceof Error ? error.message : 'Music seed failed.')
  process.exitCode = 1
}
