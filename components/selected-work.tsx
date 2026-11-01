import type { CSSProperties } from 'react'
import Link from 'next/link'

import { HomeSection, SectionLink } from '~/components/home-section'
import { projectPath, projectStatusTone, type Project } from '~/lib/projects'
import { toRoman } from '~/lib/roman'

// Proof of work as printed plates: each with its outcome line and the
// system trace drawn once in fine ink as the section reveals.
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
    <HomeSection
      index={index}
      id="selected-work-title"
      title="Selected work"
      figure="plates"
      wide
      action={<SectionLink href="/en/projects">All projects</SectionLink>}
    >
      <ul className="plates">
        {projects.map((project, i) => {
          const caseStudy = caseStudyIds.has(project.id)
          return (
            <li key={project.id} className="plate" style={{ '--i': i } as CSSProperties}>
              <Link href={projectPath(project.id)} className="plate-link">
                <span className="plate-head">
                  <span className="plate-number">Plate {toRoman(i + 1)}</span>
                  <span className="plate-meta">
                    {caseStudy ? <span className="plate-tag">Case study</span> : null}
                    <span className="plate-status" data-tone={projectStatusTone(project.status)}>
                      <span className="status-dot" aria-hidden="true" />
                      {project.status}
                    </span>
                  </span>
                </span>
                <span className="plate-name">{project.nameEn}</span>
                <span className="plate-domain">
                  {project.category}
                  <span aria-hidden="true"> · </span>
                  {project.role}
                </span>
                <span className="plate-summary">{project.descriptionEn ?? project.description}</span>
                {project.flow.length ? (
                  <span
                    className="plate-trace"
                    role="img"
                    aria-label={`System flow: ${project.flow.join(', ')}`}
                  >
                    {project.flow.map((stage) => (
                      <span key={stage} className="plate-stage" aria-hidden="true">
                        {stage}
                      </span>
                    ))}
                  </span>
                ) : null}
                <span className="plate-cta">
                  {caseStudy ? 'Read the case study' : 'View the project'}
                  <span aria-hidden="true"> →</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </HomeSection>
  )
}
