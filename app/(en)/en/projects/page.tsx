import { ProjectsPageView } from '../../../_views/projects-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { projectPath, projects } from '~/lib/projects'
import { seo } from '~/lib/seo'

const copy = publicPageMetadata.projects.en

export const metadata = localeMetadata({
  locale: 'en',
  path: '/projects',
  ...copy,
})

export default function EnglishProjectsPage() {
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: copy.title,
          description: copy.description,
          url: new URL('/en/projects', seo.url).href,
          inLanguage: 'en',
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
                creator: { '@id': new URL('/en#person', seo.url).href },
              },
            })),
          },
        }}
      />
      <ProjectsPageView />
    </>
  )
}
