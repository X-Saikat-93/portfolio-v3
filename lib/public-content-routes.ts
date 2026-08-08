// Seeded slugs keep discovery available during a database outage. Published
// route authority lives in the database-backed repository and page.
export const publishedPostSlugs: readonly string[] = [
  'the-production-shape-of-an-ai-feature',
  'rag-is-a-data-product',
  'designing-an-agent-loop-that-can-stop',
  'context-windows-are-not-memory',
  'structured-output-is-an-api-contract',
  'streaming-is-not-progress',
  'model-routing-is-a-product-decision',
  'ai-search-needs-a-failure-taxonomy',
  'cache-boundaries-before-cache-apis',
  'the-quiet-work-of-making-a-portfolio-honest',
  'small-interactions-need-a-reason',
  'the-boring-architecture-of-reliable-real-time-systems',
  'what-belongs-in-the-database',
  'database-migrations-are-product-changes',
  'a-homepage-is-a-contract',
  'the-first-boundary-is-the-browser',
  'when-an-empty-state-is-correct',
  'the-work-between-a-click-and-a-database-row',
]

const blogSlugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isBlogPostSlug(slug: string) {
  return blogSlugPattern.test(slug)
}
