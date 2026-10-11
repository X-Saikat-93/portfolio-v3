import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import matter from 'gray-matter'
import { v2 as cloudinary } from 'cloudinary'
import { Pool, type PoolClient } from 'pg'
import { z } from 'zod'

import { normalizeDatabaseUrl } from '../db/connection-string.ts'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const blogEntrySchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().trim().max(1000),
  keywords: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  category: z.string().trim().min(1).max(80),
  date: z.coerce.date(),
  readingMinutes: z.coerce.number().int().min(1).max(120),
  coverFile: z.string().trim().min(1).max(255),
  coverSlug: z.string().regex(slugPattern),
  coverAlt: z.string().trim().min(1).max(300),
})

type BlogSeedEntry = z.infer<typeof blogEntrySchema> & { slug: string; body: string }
type UploadedImage = Awaited<ReturnType<typeof cloudinary.uploader.upload>>

const books = [
  {
    title: 'Designing Data-Intensive Applications',
    creator: 'Martin Kleppmann',
    year: 2017,
    description:
      'A guide to the trade-offs behind reliable, scalable data systems: storage, replication, partitioning, and stream processing.',
    url: 'https://dataintensive.net/?lang=en',
    coverFile: 'designing-data-intensive-applications.png',
    coverSlug: 'designing-data-intensive-applications',
    sortOrder: 10,
  },
  {
    title: 'The Pragmatic Programmer, 20th Anniversary Edition',
    creator: 'David Thomas and Andrew Hunt',
    year: 2019,
    description:
      'A field guide to the everyday decisions that keep software changeable: feedback, boundaries, automation, and communication.',
    url: 'https://pragprog.com/titles/tpp20/the-pragmatic-programmer-20th-anniversary-edition/',
    coverFile: 'the-pragmatic-programmer.png',
    coverSlug: 'the-pragmatic-programmer',
    sortOrder: 20,
  },
  {
    title: 'Refactoring, 2nd Edition',
    creator: 'Martin Fowler',
    year: 2018,
    description:
      'A catalogue of small, named transformations for changing the shape of code without changing what it does.',
    url: 'https://martinfowler.com/books/refactoring.html',
    coverFile: 'refactoring.png',
    coverSlug: 'refactoring',
    sortOrder: 30,
  },
  {
    title: 'A Philosophy of Software Design',
    creator: 'John Ousterhout',
    year: 2018,
    description:
      'A compact argument for keeping design simple, making complexity visible, and preventing accidental growth.',
    url: 'https://web.stanford.edu/~ouster/cgi-bin/aposd.php',
    coverFile: 'a-philosophy-of-software-design.png',
    coverSlug: 'a-philosophy-of-software-design',
    sortOrder: 40,
  },
  {
    title: "Don't Make Me Think, Revisited",
    creator: 'Steve Krug',
    year: 2014,
    description:
      'A practical reminder that interfaces should explain themselves before a user has to.',
    url: 'https://sensible.com/dont-make-me-think/',
    coverFile: 'dont-make-me-think.png',
    coverSlug: 'dont-make-me-think',
    sortOrder: 50,
  },
  {
    title: "The Staff Engineer's Path",
    creator: 'Tanya Reilly',
    year: 2022,
    description:
      'A guide to technical leadership without direct authority: setting direction, choosing scope, and making other engineers better.',
    url: 'https://www.oreilly.com/library/view/the-staff-engineers/9781098118723/',
    coverFile: 'the-staff-engineers-path.png',
    coverSlug: 'the-staff-engineers-path',
    sortOrder: 60,
  },
  {
    title: 'Fundamentals of Software Architecture, 2nd Edition',
    creator: 'Mark Richards and Neal Ford',
    year: 2025,
    description:
      'A practical architecture guide for making and revisiting trade-offs across patterns, components, governance, data, and modern engineering practice.',
    url: 'https://www.oreilly.com/library/view/fundamentals-of-software/9781098175504/',
    coverFile: 'fundamentals-of-software-architecture-2e.png',
    coverSlug: 'fundamentals-of-software-architecture-2e',
    sortOrder: 70,
  },
  {
    title: 'Software Architecture: The Hard Parts',
    creator: 'Neal Ford, Mark Richards, Pramod Sadalage, and Zhamak Dehghani',
    year: 2021,
    description:
      'A trade-off driven guide to service boundaries, distributed data, workflows, transactions, coupling, and the decisions that resist simple best practices.',
    url: 'https://www.oreilly.com/library/view/software-architecture-the/9781492086888/',
    coverFile: 'software-architecture-the-hard-parts.png',
    coverSlug: 'software-architecture-the-hard-parts',
    sortOrder: 80,
  },
  {
    title: 'Designing Machine Learning Systems',
    creator: 'Chip Huyen',
    year: 2022,
    description:
      'A production-first guide to reliable ML systems, from data and distribution shift to deployment, observability, continual learning, and team practice.',
    url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/titlepage01.html',
    coverFile: 'designing-machine-learning-systems.png',
    coverSlug: 'designing-machine-learning-systems',
    sortOrder: 90,
  },
  {
    title: 'AI Engineering',
    creator: 'Chip Huyen',
    year: 2024,
    description:
      'A practical foundation-model application guide covering evaluation, RAG, agents, dataset engineering, inference optimization, and feedback-driven architecture.',
    url: 'https://www.oreilly.com/library/view/ai-engineering/9781098166298/',
    coverFile: 'ai-engineering.png',
    coverSlug: 'ai-engineering',
    sortOrder: 100,
  },
] as const

const root = fileURLToPath(new URL('..', import.meta.url))

async function uploadContentCovers(blogEntries: BlogSeedEntry[]) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || 'saikat-das'
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET before seeding covers.')
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  const bookUploads = new Map<string, UploadedImage>()
  const blogUploads = new Map<string, UploadedImage>()

  for (const book of books) {
    const asset = await cloudinary.uploader.upload(
      join(root, 'public', 'images', 'books', book.coverFile),
      {
        folder,
        public_id: `book-covers/${book.coverSlug}`,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
      },
    )
    bookUploads.set(book.title, asset)
  }

  for (const entry of blogEntries) {
    const asset = await cloudinary.uploader.upload(
      join(root, 'public', 'images', 'blog', entry.coverFile),
      {
        folder,
        public_id: `blog-covers/${entry.coverSlug}`,
        overwrite: true,
        invalidate: true,
        resource_type: 'image',
      },
    )
    blogUploads.set(entry.slug, asset)
  }

  return { bookUploads, blogUploads }
}

async function readBlogEntries(): Promise<BlogSeedEntry[]> {
  const contentRoot = join(root, 'content', 'blog')
  const directories = await readdir(contentRoot, { withFileTypes: true })
  const entries: BlogSeedEntry[] = []

  for (const directory of directories.sort((a, b) => a.name.localeCompare(b.name))) {
    if (!directory.isDirectory() || !slugPattern.test(directory.name)) continue
    const source = await readFile(join(contentRoot, directory.name, 'index.mdx'), 'utf8')
    const parsed = matter(source)
    const frontmatter = blogEntrySchema.parse(parsed.data)
    entries.push({ slug: directory.name, ...frontmatter, body: parsed.content.trim() })
  }

  return entries
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
  if (!connectionString) throw new Error('Set MIGRATION_DATABASE_URL or DATABASE_URL before seeding content.')

  const pool = new Pool({ connectionString: normalizeDatabaseUrl(connectionString) })
  const client = await pool.connect()
  let inTransaction = false

  try {
    const blogEntries = await readBlogEntries()
    const { bookUploads, blogUploads } = await uploadContentCovers(blogEntries)
    await client.query('BEGIN')
    inTransaction = true

    for (const entry of blogEntries) {
      const cover = blogUploads.get(entry.slug)
      if (!cover) throw new Error(`Cover upload missing for ${entry.title}.`)
      await upsertMedia(client, cover, entry.coverFile)

      await client.query(
        `INSERT INTO cms_entries
          (slug, title, description, seo_keywords, body, category, reading_minutes,
           cover_image_public_id, cover_image_alt, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'published', $10)
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           seo_keywords = EXCLUDED.seo_keywords,
           body = EXCLUDED.body,
           category = EXCLUDED.category,
           reading_minutes = EXCLUDED.reading_minutes,
           cover_image_public_id = EXCLUDED.cover_image_public_id,
           cover_image_alt = EXCLUDED.cover_image_alt,
           status = 'published',
           published_at = EXCLUDED.published_at,
           updated_at = NOW()`,
        [
          entry.slug,
          entry.title,
          entry.description,
          JSON.stringify(entry.keywords),
          entry.body,
          entry.category,
          entry.readingMinutes,
          cover.public_id,
          entry.coverAlt,
          entry.date,
        ],
      )
    }

    for (const book of books) {
      const cover = bookUploads.get(book.title)
      if (!cover) throw new Error(`Cover upload missing for ${book.title}.`)
      await upsertMedia(client, cover, book.coverFile)

      const updated = await client.query(
        `UPDATE portfolio_items
         SET creator = $1, year = $2, description = $3, url = $4,
             image_public_id = $5, status = 'published', sort_order = $6, updated_at = NOW()
         WHERE kind = 'book' AND title = $7`,
        [book.creator, book.year, book.description, book.url, cover.public_id, book.sortOrder, book.title],
      )

      if (updated.rowCount === 0) {
        await client.query(
          `INSERT INTO portfolio_items
            (kind, title, creator, year, description, url, image_public_id, status, sort_order)
           VALUES ('book', $1, $2, $3, $4, $5, $6, 'published', $7)`,
          [book.title, book.creator, book.year, book.description, book.url, cover.public_id, book.sortOrder],
        )
      }
    }

    await client.query('COMMIT')
    inTransaction = false
    console.log(`Seeded ${blogEntries.length} blog posts and ${books.length} books.`)
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
  console.error(error instanceof Error ? error.message : 'Content seed failed.')
  process.exitCode = 1
}
