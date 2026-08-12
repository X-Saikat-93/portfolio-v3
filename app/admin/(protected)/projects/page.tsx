import Link from 'next/link'
import type { Metadata } from 'next'

import { requireOwnerPage } from '~/lib/admin/server'
import { listAdminProjectCaseStudies } from '~/lib/project-case-studies/repository'
import { projects } from '~/lib/projects'
import { nonPublicRobots } from '~/lib/non-public-metadata'

export const metadata: Metadata = { title: 'Projects', robots: nonPublicRobots }
export const instant = false

export default async function AdminProjectsPage() {
  await requireOwnerPage('/admin/projects')
  const records = await listAdminProjectCaseStudies()
  const statusByProject = new Map(records.map((record) => [record.projectId, record.status]))

  return (
    <div className="admin-editor pb-10">
      <div className="admin-editor-header">
        <div>
          <Link href="/admin" className="admin-back-link">← Admin overview</Link>
          <p className="page-eyebrow mt-5">Projects</p>
          <h1 className="mt-3 text-2xl font-medium tracking-tight">Evidence case studies</h1>
          <p className="mt-3 max-w-[32rem] text-sm leading-relaxed text-muted-foreground">Edit the DB-backed proof behind each public project page. Upload the project image directly inside the project editor.</p>
        </div>
      </div>

      <ul className="admin-project-register">
        {projects.map((project) => (
          <li key={project.id}>
            <Link href={`/admin/projects/${project.id}`} className="admin-project-register-link">
              <span className="admin-project-register-index">{String(projects.indexOf(project) + 1).padStart(2, '0')}</span>
              <span className="min-w-0 flex-1">
                <strong>{project.nameEn}</strong>
                <span>{project.category}</span>
              </span>
              <span className="admin-project-register-status">{statusByProject.get(project.id) ?? 'not started'} →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
