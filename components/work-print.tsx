import type { CSSProperties } from 'react'
import Link from 'next/link'

import { projectPath, projectStatusTone, type Project } from '~/lib/projects'

// One project as a print: category and status, the name, what it is, the
// system flow it runs, and the way in. The homepage lays three loose on the
// desk; the projects page sets them all on a grid.
export function WorkPrint({
  project,
  index,
  caseStudy,
  stageRow = false,
}: {
  project: Project
  index: number
  caseStudy: boolean
  /** mark the print as a row of the projects blueprint stage */
  stageRow?: boolean
}) {
  return (
    <li
      className="work-print"
      style={{ '--i': index } as CSSProperties}
      {...(stageRow ? { 'data-list-stage-row': '', 'data-list-stage-id': project.id } : {})}
    >
      {stageRow ? <span className="work-print-anchor" aria-hidden="true" data-list-stage-anchor /> : null}
      <Link href={projectPath(project.id)} className="work-print-sheet">
        <span className="work-print-meta">
          <span>{project.category}</span>
          <span className="work-print-status" data-tone={projectStatusTone(project.status)}>
            <span className="status-dot" aria-hidden="true" />
            {project.status}
          </span>
        </span>
        <span className="work-print-name">{project.nameEn}</span>
        <span className="work-print-summary">{project.descriptionEn ?? project.description}</span>
        {project.flow.length ? (
          <span className="work-print-trace" role="img" aria-label={`System flow: ${project.flow.join(', ')}`}>
            {project.flow.map((stage) => (
              <span key={stage} aria-hidden="true">
                {stage}
              </span>
            ))}
          </span>
        ) : null}
        <span className="work-print-foot">
          <span>{project.role}</span>
          <span className="work-print-cta">
            {caseStudy ? 'Read the case study' : 'View the project'}
            <span aria-hidden="true"> →</span>
          </span>
        </span>
      </Link>
    </li>
  )
}
