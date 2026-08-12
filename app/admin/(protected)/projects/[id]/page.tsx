import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProjectEditor } from '../ProjectEditor'
import { requireOwnerPage } from '~/lib/admin/server'
import { getAdminProjectCaseStudy } from '~/lib/project-case-studies/repository'
import { getProjectById } from '~/lib/projects'
import { nonPublicRobots } from '~/lib/non-public-metadata'

export const metadata: Metadata = { title: 'Project case study', robots: nonPublicRobots }
export const instant = false

export default async function AdminProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireOwnerPage(`/admin/projects/${id}`)
  const project = getProjectById(id)
  if (!project) notFound()

  const record = await getAdminProjectCaseStudy(project.id)
  return (
    <>
      <ProjectEditor project={project} initialRecord={record} />
      <p className="mx-auto max-w-[42rem] px-6 pb-10 text-xs leading-relaxed text-muted-foreground">
        Project identity and links stay in the verified project registry. The case-study copy, status, and optional hero asset are stored in Neon.
        <Link href="/admin/media" className="ml-1 underline underline-offset-4">Open media archive</Link>
      </p>
    </>
  )
}
