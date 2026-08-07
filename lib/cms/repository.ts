import 'server-only'

import { desc, eq } from 'drizzle-orm'

import { getDatabase } from '~/db'
import { cmsEntries } from '~/db/schema'

export async function listCmsEntries() {
  return getDatabase().select().from(cmsEntries).orderBy(desc(cmsEntries.updatedAt))
}

export async function createCmsEntry(input: {
  slug: string
  title: string
  description: string
  body: string
  status: 'draft' | 'published'
}) {
  const [entry] = await getDatabase().insert(cmsEntries).values({
    ...input,
    publishedAt: input.status === 'published' ? new Date() : null,
  }).returning()
  return entry
}

export async function updateCmsEntry(
  id: string,
  input: Partial<{
    slug: string
    title: string
    description: string
    body: string
    status: 'draft' | 'published'
  }>,
) {
  const [entry] = await getDatabase().update(cmsEntries).set({
    ...input,
    ...(input.status ? { publishedAt: input.status === 'published' ? new Date() : null } : {}),
    updatedAt: new Date(),
  }).where(eq(cmsEntries.id, id)).returning()
  return entry
}

export async function deleteCmsEntry(id: string) {
  await getDatabase().delete(cmsEntries).where(eq(cmsEntries.id, id))
}
