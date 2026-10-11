import type { CSSProperties } from 'react'
import Link from 'next/link'

import { SectionTag } from '~/components/section-tag'
import { projectPath, projectStatusTone, type Project } from '~/lib/projects'

// Homepage proof of work: a few projects, each with its outcome line and a
// compact system trace that runs once as the section reveals.
export function SelectedWork({
  index,
  projects,
  caseStudyIds,
}: {
  index: number
  projects: readonly Project[]
  caseStudyIds: ReadonlySet<string>
}) {
  if (projects.length === 0) return null

  return (
    <section className="mt-16" aria-labelledby="selected-work-title">
      <div className="flex items-end justify-between gap-4">
        <SectionTag index={index} id="selected-work-title">
          Selected work
        </SectionTag>
        <Link href="/en/projects" className="selected-work-all">
          All projects
        </Link>
      </div>

      <ul className="selected-work-list mt-4">
        {projects.map((project, i) => (
          <li
            key={project.id}
            className="selected-work-item"
            style={{ '--i': i } as CSSProperties}
          >
            <Link href={projectPath(project.id)} className="selected-work-row">
              <span className="selected-work-head">
                <span className="selected-work-name">{project.nameEn}</span>
                <span className="project-meta">
                  {caseStudyIds.has(project.id) ? (
                    <span className="project-case-tag">Case study</span>
                  ) : null}
                  <span className="project-status" data-tone={projectStatusTone(project.status)}>
                    {project.status}
                  </span>
                </span>
              </span>
              <span className="selected-work-domain">
                {project.category}
                <span className="selected-work-role">{project.role}</span>
              </span>
              <span className="selected-work-summary">
                {project.descriptionEn ?? project.description}
              </span>
              {project.flow.length ? (
                <span
                  className="selected-work-trace"
                  aria-label={`System flow: ${project.flow.join(', ')}`}
                  role="img"
                  style={{ '--n': project.flow.length } as CSSProperties}
                >
                  {project.flow.map((stage, step) => (
                    <span
                      key={stage}
                      className="selected-work-stage"
                      style={{ '--s': step } as CSSProperties}
                      aria-hidden
                    >
                      <span className="selected-work-node" />
                      <span className="selected-work-stage-label">{stage}</span>
                    </span>
                  ))}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
