import 'server-only'

import { desc, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'

import { getDatabase } from '~/db'
import { cmsEntries } from '~/db/schema'

export async function listCmsEntries() {
  return getDatabase().select().from(cmsEntries).orderBy(desc(cmsEntries.updatedAt))
}

export async function createCmsEntry(input: {
  slug: string
  title: string
  description: string
  seoKeywords: string[]
  body: string
  category: string
  readingMinutes: number
  coverImagePublicId: string | null
  coverImageAlt: string
  status: 'draft' | 'published'
}) {
  const [entry] = await getDatabase().insert(cmsEntries).values({
    ...input,
    publishedAt: input.status === 'published' ? new Date() : null,
  }).returning()
  revalidateTag('blog-posts', 'max')
  revalidateTag(`blog-post:${input.slug}`, 'max')
  return entry
}

export async function updateCmsEntry(
  id: string,
  input: Partial<{
    slug: string
    title: string
    description: string
    seoKeywords: string[]
    body: string
    category: string
    readingMinutes: number
    coverImagePublicId: string | null
    coverImageAlt: string
    status: 'draft' | 'published'
  }>,
) {
  const [entry] = await getDatabase().update(cmsEntries).set({
    ...input,
    ...(input.status ? { publishedAt: input.status === 'published' ? new Date() : null } : {}),
    updatedAt: new Date(),
  }).where(eq(cmsEntries.id, id)).returning()
  if (entry) {
    revalidateTag('blog-posts', 'max')
    revalidateTag(`blog-post:${entry.slug}`, 'max')
  }
  return entry
}

export async function deleteCmsEntry(id: string) {
  const [entry] = await getDatabase().delete(cmsEntries).where(eq(cmsEntries.id, id)).returning({ slug: cmsEntries.slug })
  revalidateTag('blog-posts', 'max')
  if (entry) revalidateTag(`blog-post:${entry.slug}`, 'max')
}
