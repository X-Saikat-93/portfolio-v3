import { HomeSection, SectionLink } from '~/components/home-section'
import { WorkPrint } from '~/components/work-print'
import type { Project } from '~/lib/projects'

// Proof of work as prints laid loosely on the desk: they straighten into a
// row when the pointer arrives, and the one under it lifts off the stack.
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
      action={<SectionLink href="/en/projects">All projects</SectionLink>}
    >
      <ul className="prints-stack">
        {projects.map((project, i) => (
          <WorkPrint key={project.id} project={project} index={i} caseStudy={caseStudyIds.has(project.id)} />
        ))}
      </ul>
    </HomeSection>
  )
}
