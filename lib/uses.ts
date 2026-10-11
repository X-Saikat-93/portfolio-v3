// The Uses page: a reviewable inventory of what the work is done with.
// Only facts Saikat has confirmed belong here. Update the date when the
// list changes; a build timestamp must not pretend the list was reviewed.
export const usesLastUpdated = '2026-10-11'

export interface UsesItem {
  name: string
  /** why it is in the kit, in one line */
  note: string
  href?: string
}

export interface UsesGroup {
  id: string
  label: string
  items: readonly UsesItem[]
}

// Groups with no items are not rendered. Hardware and editor details are
// deliberately empty until Saikat supplies them, rather than guessed.
export const usesGroups: readonly UsesGroup[] = [
  {
    id: 'desk',
    label: 'Desk',
    items: [],
  },
  {
    id: 'editor',
    label: 'Editor & terminal',
    items: [],
  },
  {
    id: 'stack',
    label: 'Daily stack',
    items: [
      { name: 'TypeScript', note: 'Every product and API, front to back.' },
      { name: 'React & Next.js', note: 'Interfaces, routing, and server rendering.' },
      { name: 'Node.js', note: 'APIs, workers, and real-time services.' },
      { name: 'PostgreSQL', note: 'The system of record; Drizzle ORM on top.' },
      { name: 'Redis', note: 'Queues, caches, and rate limits.' },
      { name: 'Tailwind CSS', note: 'Utility layer under hand-written design CSS.' },
      { name: 'Docker', note: 'Local services and production images.' },
    ],
  },
  {
    id: 'services',
    label: 'Services',
    items: [
      { name: 'GitHub', note: 'Source, reviews, and Actions pipelines.', href: 'https://github.com/X-Saikat-93' },
      { name: 'Vercel', note: 'Hosting and preview deployments.' },
      { name: 'Neon', note: 'Serverless Postgres for CMS and contact records.' },
      { name: 'Cloudinary', note: 'Published images and the resume PDF.' },
      { name: 'Upstash', note: 'Redis for contact-form rate limiting.' },
    ],
  },
  {
    id: 'site',
    label: 'This site',
    items: [
      { name: 'Next.js 16', note: 'App Router, cache components, Turbopack.' },
      { name: 'Drizzle & Neon', note: 'Owner-only CMS, collections, and the inbox.' },
      { name: 'MDX', note: 'Writing, compiled with syntax-highlighted code.' },
      { name: 'Funnel Sans & Display', note: 'Reading and headline cuts of one family.' },
      { name: 'Frex Sans GB', note: 'The print register: labels, dates, and plates.' },
      { name: 'Halftone portrait', note: 'The homepage print, drawn on a hex grid in the browser.' },
    ],
  },
]
