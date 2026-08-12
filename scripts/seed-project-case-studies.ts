import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Pool } from 'pg'
import { z } from 'zod'

import { normalizeDatabaseUrl } from '../db/connection-string.ts'

const caseStudySchema = z.object({
  projectId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(160),
  heroImagePublicId: z.string().trim().min(1).max(500).nullable().optional(),
  heroImageAlt: z.string().trim().max(300).optional(),
  framing: z.string().trim().min(1),
  challenge: z.string().trim().min(1),
  ownership: z.array(z.string().trim().min(1)).min(1),
  proof: z.array(
    z.object({
      label: z.string().trim().min(1),
      value: z.string().trim().min(1),
    }),
  ).min(1),
  decisions: z.array(
    z.object({
      title: z.string().trim().min(1),
      body: z.string().trim().min(1),
    }),
  ).min(1),
  evidence: z.array(z.string().trim().min(1)).min(1),
  boundary: z.string().trim().min(1),
})

const root = fileURLToPath(new URL('..', import.meta.url))

async function readCaseStudies() {
  const contentRoot = join(root, 'content', 'case-studies')
  const files = (await readdir(contentRoot))
    .filter((file) => file.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b))

  return Promise.all(
    files.map(async (file) => {
      const source = await readFile(join(contentRoot, file), 'utf8')
      return caseStudySchema.parse(JSON.parse(source))
    }),
  )
}

async function seed() {
  const connectionString = process.env.MIGRATION_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  if (!connectionString) throw new Error('Set MIGRATION_DATABASE_URL or DATABASE_URL before seeding case studies.')

  const pool = new Pool({ connectionString: normalizeDatabaseUrl(connectionString) })
  const client = await pool.connect()
  let inTransaction = false

  try {
    const entries = await readCaseStudies()
    await client.query('BEGIN')
    inTransaction = true

    for (const entry of entries) {
      await client.query(
        `INSERT INTO project_case_studies
          (project_id, hero_image_public_id, hero_image_alt, framing, challenge, ownership, proof, decisions, evidence, boundary,
           status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'published', NOW())
         ON CONFLICT (project_id) DO UPDATE SET
           hero_image_public_id = EXCLUDED.hero_image_public_id,
           hero_image_alt = EXCLUDED.hero_image_alt,
           framing = EXCLUDED.framing,
           challenge = EXCLUDED.challenge,
           ownership = EXCLUDED.ownership,
           proof = EXCLUDED.proof,
           decisions = EXCLUDED.decisions,
           evidence = EXCLUDED.evidence,
           boundary = EXCLUDED.boundary,
           status = 'published',
           published_at = EXCLUDED.published_at,
           updated_at = NOW()`,
        [
          entry.projectId,
          entry.heroImagePublicId ?? null,
          entry.heroImageAlt ?? '',
          entry.framing,
          entry.challenge,
          JSON.stringify(entry.ownership),
          JSON.stringify(entry.proof),
          JSON.stringify(entry.decisions),
          JSON.stringify(entry.evidence),
          entry.boundary,
        ],
      )
    }

    await client.query('COMMIT')
    inTransaction = false
    console.log(`Seeded ${entries.length} project case studies.`)
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
  console.error(error instanceof Error ? error.message : 'Project case-study seed failed.')
  process.exitCode = 1
}
