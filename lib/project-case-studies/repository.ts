import 'server-only'

import { and, desc, eq } from 'drizzle-orm'
import { cacheLife, cacheTag, revalidateTag } from 'next/cache'
import { z } from 'zod'

import { getDatabase } from '~/db'
import { projectCaseStudies } from '~/db/schema'
import type { ProjectCaseStudy } from '~/lib/projects'

const projectCaseStudySchema = z.object({
  heroImagePublicId: z.string().trim().min(1).nullable().optional(),
  heroImageAlt: z.string().trim().max(300).optional(),
  framing: z.string().trim().min(1),
  challenge: z.string().trim().min(1),
  ownership: z.array(z.string().trim().min(1)),
  proof: z.array(
    z.object({
      label: z.string().trim().min(1),
      value: z.string().trim().min(1),
    }),
  ),
  decisions: z.array(
    z.object({
      title: z.string().trim().min(1),
      body: z.string().trim().min(1),
    }),
  ),
  evidence: z.array(z.string().trim().min(1)),
  boundary: z.string().trim().min(1),
})

function toProjectCaseStudy(entry: typeof projectCaseStudies.$inferSelect): ProjectCaseStudy | null {
  const parsed = projectCaseStudySchema.safeParse({
    heroImagePublicId: entry.heroImagePublicId,
    heroImageAlt: entry.heroImageAlt,
    framing: entry.framing,
    challenge: entry.challenge,
    ownership: entry.ownership,
    proof: entry.proof,
    decisions: entry.decisions,
    evidence: entry.evidence,
    boundary: entry.boundary,
  })

  return parsed.success ? parsed.data : null
}

export type AdminProjectCaseStudy = typeof projectCaseStudies.$inferSelect

export type ProjectCaseStudyInput = {
  heroImagePublicId?: string | null
  heroImageAlt?: string
  framing: string
  challenge: string
  ownership: string[]
  proof: Array<{ label: string; value: string }>
  decisions: Array<{ title: string; body: string }>
  evidence: string[]
  boundary: string
  status: 'draft' | 'published'
}

export async function listAdminProjectCaseStudies() {
  return getDatabase()
    .select()
    .from(projectCaseStudies)
    .orderBy(desc(projectCaseStudies.updatedAt))
}

export async function getAdminProjectCaseStudy(projectId: string) {
  const [entry] = await getDatabase()
    .select()
    .from(projectCaseStudies)
    .where(eq(projectCaseStudies.projectId, projectId))
    .limit(1)

  return entry ?? null
}

export async function upsertProjectCaseStudy(projectId: string, input: ProjectCaseStudyInput) {
  const database = getDatabase()
  const publishedAt = input.status === 'published' ? new Date() : null
  const values = {
    projectId,
    heroImagePublicId: input.heroImagePublicId || null,
    heroImageAlt: input.heroImageAlt?.trim() ?? '',
    framing: input.framing,
    challenge: input.challenge,
    ownership: input.ownership,
    proof: input.proof,
    decisions: input.decisions,
    evidence: input.evidence,
    boundary: input.boundary,
    status: input.status,
    publishedAt,
    updatedAt: new Date(),
  } as const

  const [entry] = await database
    .insert(projectCaseStudies)
    .values(values)
    .onConflictDoUpdate({
      target: projectCaseStudies.projectId,
      set: values,
    })
    .returning()

  revalidateTag('project-case-studies', 'max')
  revalidateTag(`project-case-study:${projectId}`, 'max')
  return entry
}

export async function deleteProjectCaseStudy(projectId: string) {
  const result = await getDatabase()
    .delete(projectCaseStudies)
    .where(eq(projectCaseStudies.projectId, projectId))

  revalidateTag('project-case-studies', 'max')
  revalidateTag(`project-case-study:${projectId}`, 'max')
  return result
}

export async function listPublishedProjectCaseStudies() {
  const entries = await getDatabase()
    .select()
    .from(projectCaseStudies)
    .where(eq(projectCaseStudies.status, 'published'))
    .orderBy(desc(projectCaseStudies.publishedAt), desc(projectCaseStudies.updatedAt))

  return entries.flatMap((entry) => {
    const caseStudy = toProjectCaseStudy(entry)
    return caseStudy ? [{ projectId: entry.projectId, caseStudy }] : []
  })
}

export async function getPublishedProjectCaseStudy(projectId: string) {
  const [entry] = await getDatabase()
    .select()
    .from(projectCaseStudies)
    .where(and(eq(projectCaseStudies.projectId, projectId), eq(projectCaseStudies.status, 'published')))
    .limit(1)

  return entry ? toProjectCaseStudy(entry) : null
}

export async function safeListPublishedProjectCaseStudies() {
  'use cache'
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 })
  cacheTag('project-case-studies')

  try {
    return await listPublishedProjectCaseStudies()
  } catch {
    return [] as Array<{ projectId: string; caseStudy: ProjectCaseStudy }>
  }
}

export async function safeGetPublishedProjectCaseStudy(projectId: string) {
  'use cache'
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 })
  cacheTag('project-case-studies', `project-case-study:${projectId}`)

  try {
    return await getPublishedProjectCaseStudy(projectId)
  } catch {
    return null
  }
}
