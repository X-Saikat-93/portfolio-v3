import 'server-only'

import { and, asc, desc, eq } from 'drizzle-orm'
import { cacheLife, cacheTag, revalidateTag } from 'next/cache'

import { getDatabase } from '~/db'
import { portfolioItems } from '~/db/schema'

export type CollectionKind = 'book' | 'music' | 'photo'
export type CollectionStatus = 'draft' | 'published'
export type PortfolioItem = typeof portfolioItems.$inferSelect

const publicItemOrder = [asc(portfolioItems.sortOrder), desc(portfolioItems.updatedAt)]
const publicCollectionTags = ['book', 'music', 'photo'].map(
  (kind) => `portfolio-items:${kind}`,
)

function revalidatePublicCollections() {
  for (const tag of publicCollectionTags) revalidateTag(tag, 'max')
}

export function listPublishedCollectionItems(kind: CollectionKind) {
  return getDatabase()
    .select()
    .from(portfolioItems)
    .where(and(eq(portfolioItems.kind, kind), eq(portfolioItems.status, 'published')))
    .orderBy(...publicItemOrder)
}

export async function safeListPublishedCollectionItems(kind: CollectionKind) {
  'use cache'
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 })
  cacheTag(`portfolio-items:${kind}`)

  try {
    return await listPublishedCollectionItems(kind)
  } catch {
    return [] as PortfolioItem[]
  }
}

// Use this only for public surfaces that must reflect the database on every
// request. The regular helper above remains cached for the other collections.
export async function safeListPublishedCollectionItemsLive(kind: CollectionKind) {
  try {
    return await listPublishedCollectionItems(kind)
  } catch {
    return [] as PortfolioItem[]
  }
}

export function listAdminCollectionItems(kind?: CollectionKind) {
  const database = getDatabase()
  return kind
    ? database
        .select()
        .from(portfolioItems)
        .where(eq(portfolioItems.kind, kind))
        .orderBy(...publicItemOrder)
    : database.select().from(portfolioItems).orderBy(...publicItemOrder)
}

export async function createCollectionItem(input: {
  kind: CollectionKind
  title: string
  creator: string
  year?: number | null
  description: string
  url?: string | null
  imagePublicId?: string | null
  status: CollectionStatus
  sortOrder: number
}) {
  const [item] = await getDatabase()
    .insert(portfolioItems)
    .values({
      ...input,
      year: input.year ?? null,
      url: input.url || null,
      imagePublicId: input.imagePublicId || null,
    })
    .returning()
  revalidatePublicCollections()
  return item
}

export async function updateCollectionItem(
  id: string,
  input: Partial<{
    kind: CollectionKind
    title: string
    creator: string
    year: number | null
    description: string
    url: string | null
    imagePublicId: string | null
    status: CollectionStatus
    sortOrder: number
  }>,
) {
  const [item] = await getDatabase()
    .update(portfolioItems)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(portfolioItems.id, id))
    .returning()
  revalidatePublicCollections()
  return item
}

export async function deleteCollectionItem(id: string) {
  const result = await getDatabase().delete(portfolioItems).where(eq(portfolioItems.id, id))
  revalidatePublicCollections()
  return result
}
