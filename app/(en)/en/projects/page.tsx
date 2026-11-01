import { ProjectsPageView } from '../../../_views/projects-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { safeListPublishedProjectCaseStudies } from '~/lib/project-case-studies/repository'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { projectPath, projects } from '~/lib/projects'
import { breadcrumbJsonLd, personId, seo, webPageJsonLd } from '~/lib/seo'

const copy = publicPageMetadata.projects.en

export const metadata = localeMetadata({
  locale: 'en',
  path: '/projects',
  ...copy,
})

export default async function EnglishProjectsPage() {
  const caseStudies = await safeListPublishedProjectCaseStudies()

  return (
    <>
      <JsonLd
        data={[
          {
            ...webPageJsonLd('/en/projects', copy, 'CollectionPage'),
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: projects.length,
              itemListElement: projects.map((project, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'CreativeWork',
                  name: project.nameEn,
                  description: project.descriptionEn || project.description || undefined,
                  url: new URL(projectPath(project.id), seo.url).href,
                  sameAs: project.links.map(({ url }) => url),
                  creator: { '@id': personId },
                },
              })),
            },
          },
          breadcrumbJsonLd([{ name: copy.heading, path: '/en/projects' }]),
        ]}
      />
      <ProjectsPageView caseStudyProjectIds={caseStudies.map(({ projectId }) => projectId)} />
    </>
  )
}
