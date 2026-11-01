import { eq } from 'drizzle-orm'

import { getDatabase } from '~/db/runtime'
import { cmsEntries } from '~/db/schema'

const REFRESH_MS = 30_000

async function loadPublishedSlugs() {
  const rows = await getDatabase()
    .select({ slug: cmsEntries.slug })
    .from(cmsEntries)
    .where(eq(cmsEntries.status, 'published'))
  return rows.map(({ slug }) => slug)
}

// The proxy answers unknown posts with a real 404, which the page cannot:
// with Cache Components it has already streamed a 200 shell. The published
// set is cached in the process and reloaded on a miss at most every
// REFRESH_MS, so a new post shows up within that window and bogus slugs
// cannot drive one query each. Without a database answer it fails open and
// the page's own notFound() (with noindex) still applies.
export function createPublishedSlugCheck(
  load: () => Promise<readonly string[]> = loadPublishedSlugs,
  refreshMs = REFRESH_MS,
  now: () => number = Date.now,
) {
  let slugs: Set<string> | null = null
  let loadedAt = -Infinity
  let pending: Promise<void> | null = null

  const refresh = () =>
    (pending ??= load()
      .then((list) => {
        slugs = new Set(list)
        loadedAt = now()
      })
      .catch(() => {
        // keep the last good set; retry after the same window
        loadedAt = now()
      })
      .finally(() => {
        pending = null
      }))

  return async function isPublishedSlug(slug: string) {
    if (slugs?.has(slug)) return true
    if (now() - loadedAt >= refreshMs) await refresh()
    return slugs ? slugs.has(slug) : true
  }
}

export const isPublishedBlogSlug = createPublishedSlugCheck()
