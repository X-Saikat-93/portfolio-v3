import { basename, isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { v2 as cloudinary } from 'cloudinary'
import { Pool } from 'pg'

import { normalizeDatabaseUrl } from '../db/connection-string.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const configuredPath = process.env.RESUME_FILE?.trim()
const resumePath = configuredPath
  ? isAbsolute(configuredPath)
    ? configuredPath
    : join(root, configuredPath)
  : join(root, '_inputs', 'Saikat_Das_SWE_Resume_v1.pdf')

async function seedResume() {
  const connectionString = process.env.MIGRATION_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || 'saikat-das'

  if (!connectionString) throw new Error('Set MIGRATION_DATABASE_URL or DATABASE_URL before seeding the resume.')
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET before seeding the resume.')
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  const asset = await cloudinary.uploader.upload(resumePath, {
    folder,
    public_id: 'resume',
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
  })

  const pool = new Pool({ connectionString: normalizeDatabaseUrl(connectionString) })
  try {
    await pool.query(
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
        asset.public_id,
        asset.resource_type,
        asset.format,
        asset.secure_url,
        basename(resumePath),
        asset.bytes,
        asset.width,
        asset.height,
      ],
    )
  } finally {
    await pool.end()
  }

  console.log(`Seeded resume PDF as ${asset.public_id}.`)
}

await seedResume()
