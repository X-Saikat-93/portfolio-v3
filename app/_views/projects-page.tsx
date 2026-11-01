import { ProjectsBlueprintStage } from '~/components/hidden-list-stage'
import { WorkPrint } from '~/components/work-print'
import { projects } from '~/lib/projects'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const copy = publicPageMetadata.projects.en

// Every project as a print on the drafting table: the blueprint grid shows
// through around the print under the pointer, with a registration mark at
// its corner.
export function ProjectsPageView({ caseStudyProjectIds = [] }: { caseStudyProjectIds?: readonly string[] }) {
  const caseStudies = new Set(caseStudyProjectIds)

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="page-title">{copy.heading}</h1>
        <p className="page-lede">{copy.lede}</p>
        <p className="page-meta">
          <span>
            {projects.length} {projects.length === 1 ? 'project' : 'projects'}
          </span>
          {caseStudies.size > 0 ? (
            <span>
              {caseStudies.size} {caseStudies.size === 1 ? 'case study' : 'case studies'}
            </span>
          ) : null}
        </p>
      </header>

      <ProjectsBlueprintStage className="page-body projects-table">
        <ul className="prints-grid">
          {projects.map((project, index) => (
            <WorkPrint
              key={project.id}
              project={project}
              index={index}
              caseStudy={caseStudies.has(project.id)}
              stageRow
            />
          ))}
        </ul>
      </ProjectsBlueprintStage>
    </div>
  )
}
