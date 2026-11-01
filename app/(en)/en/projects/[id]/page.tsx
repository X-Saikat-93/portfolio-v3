import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProjectDetailPage } from '~/app/_views/project-detail-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { safeGetPublishedProjectCaseStudy } from '~/lib/project-case-studies/repository'
import { getProjectById, projectPath, projectTitle, projects } from '~/lib/projects'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { breadcrumbJsonLd, personId, seo } from '~/lib/seo'

type ProjectPageProps = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return projects.map(({ id }) => ({ id }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { id } = await params
  const project = getProjectById(id)

  if (!project) {
    return {
      title: 'Project not found',
      robots: { index: false, follow: false },
    }
  }

  return localeMetadata({
    locale: 'en',
    path: `/projects/${project.id}`,
    title: projectTitle(project),
    description: project.descriptionEn ?? project.description,
  })
}

export default async function EnglishProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const index = projects.findIndex((project) => project.id === id)
  const project = index >= 0 ? projects[index] : undefined

  if (!project) notFound()

  const caseStudy = await safeGetPublishedProjectCaseStudy(project.id)
  const projectWithCaseStudy = caseStudy ? { ...project, caseStudy } : project

  const canonical = new URL(projectPath(project.id), seo.url).href

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            '@id': `${canonical}#project`,
            name: project.nameEn,
            description: project.descriptionEn ?? project.description,
            url: canonical,
            sameAs: project.links.map(({ url }) => url),
            genre: project.category,
            keywords: project.stack,
            inLanguage: 'en',
            creator: { '@id': personId },
          },
          breadcrumbJsonLd([
            { name: publicPageMetadata.projects.en.heading, path: '/en/projects' },
            { name: project.nameEn, path: projectPath(project.id) },
          ]),
        ]}
      />
      <ProjectDetailPage
        project={projectWithCaseStudy}
        position={index + 1}
        total={projects.length}
        previous={projects[index - 1]}
        next={projects[index + 1]}
      />
    </>
  )
}
