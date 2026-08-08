// The Now page is intentionally a small, reviewable source file. Update the
// date when the snapshot changes; do not let a build timestamp pretend that
// the content was reviewed.
export const nowLastUpdated = '2026-08-08'

export interface NowEntry {
  title: string
  description: string
  href?: string
  meta?: string
}

export const nowBuilding: readonly NowEntry[] = [
  {
    title: 'WordFlow',
    meta: 'Work in progress',
    description:
      'A language-learning product built around courses, lessons, challenges, progress, quests, and a learner shop.',
    href: '/en/projects/wordflow',
  },
]

// These are current threads represented by the published writing archive,
// rather than unsupported claims about private study plans.
export const nowLearning: readonly NowEntry[] = [
  {
    title: 'AI systems',
    description: 'Retrieval, model routing, structured output, and failure behavior.',
    href: '/en/blog/ai-search-needs-a-failure-taxonomy',
  },
  {
    title: 'Reliable real-time software',
    description: 'State transitions, reconnection, idempotency, and bounded event delivery.',
    href: '/en/blog/the-boring-architecture-of-reliable-real-time-systems',
  },
  {
    title: 'Product and data boundaries',
    description: 'Keeping ownership, caching, and evidence visible from the browser to the database.',
    href: '/en/blog/what-belongs-in-the-database',
  },
]

export const nowOpenTo: readonly string[] = [
  'Remote product engineering work',
  'End-to-end web products, APIs, and interfaces',
]
