import Link from 'next/link'

import { CollectionPrints } from '~/components/collection-prints'
import { ExternalLabel } from '~/components/external-mark'
import { GitHubActivity } from '~/components/github-activity'
import { HalftonePortrait } from '~/components/halftone-portrait'
import { HireMeSection } from '~/components/hire-me-section'
import { HomeSection, SectionLink } from '~/components/home-section'
import { PortraitHiddenStage } from '~/components/portrait-hidden-stage'
import { PostTitleTransition } from '~/components/post-title-transition'
import { RevealScope } from '~/components/reveal-scope'
import { SelectedWork } from '~/components/selected-work'
import { TechStackRegister } from '~/components/tech-stack-register'
import { RegistrationMark, Sun } from '~/components/washi-art'
import { cloudinaryAvatarPublicId, cloudinaryImageUrl } from '~/lib/cloudinary/image-url'
import { safeListPublishedBlogPosts } from '~/lib/blog/repository'
import { safeListPublishedCollectionItems } from '~/lib/collections/repository'
import { formatMonthDay } from '~/lib/date'
import type { Locale } from '~/lib/locale-route'
import { experience, resumeProfile } from '~/lib/personal'
import { safeListPublishedProjectCaseStudies } from '~/lib/project-case-studies/repository'
import { selectFeaturedProjects } from '~/lib/projects'
import { getGitHub } from '~/lib/social-live'

const POSITIONING =
  'I build software that stays calm on a bad network, honest about money, fast as the data grows, and safe to ship on a Friday.'

function Hero({ portraitUrl }: { portraitUrl: string }) {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <span className="home-hero-ticks" aria-hidden="true" />
      <div className="home-hero-copy">
        <h1 id="home-title" className="home-hero-title">
          <span className="home-hero-name">Saikat Das</span>
          <span className="sr-only"> — </span>
          <span className="home-hero-role">Full-Stack Product Engineer</span>
        </h1>
        <p className="home-hero-line">{POSITIONING}</p>
        <p className="home-hero-body">
          Product engineer across the full stack, from the interface people touch to the systems
          that keep it correct. Currently building marketplace and hiring platforms at Human
          Before Resource.
        </p>
        <p className="home-hero-contact">
          Code on{' '}
          <a href="https://github.com/X-Saikat-93" target="_blank" rel="noreferrer" className="ink-link">
            <ExternalLabel>GitHub</ExternalLabel>
          </a>
          , background on{' '}
          <a href="https://www.linkedin.com/in/saikat933/" target="_blank" rel="noreferrer" className="ink-link">
            <ExternalLabel>LinkedIn</ExternalLabel>
          </a>
          , or write to{' '}
          <a href={`mailto:${resumeProfile.email}`} className="ink-link">
            {resumeProfile.email}
          </a>
          .
        </p>
        <nav className="home-hero-paths" aria-label="Start here">
          <a href="#selected-work-title" className="ink-link">Selected work</a>
          <Link href="/en/blog" className="ink-link">Writing</Link>
          <Link href="/en/resume" className="ink-link">Resume</Link>
        </nav>
      </div>
      <div className="home-hero-print">
        <span className="contour-field home-hero-contours" aria-hidden="true" />
        <Sun className="home-hero-sun" />
        <RegistrationMark className="home-hero-register" />
        <div className="home-hero-portrait">
          <PortraitHiddenStage label="Saikat's halftone portrait. Reveal the hidden topographic halo">
            <HalftonePortrait
              srcLight={portraitUrl}
              srcDark={portraitUrl}
              fallbackSrc="/images/saikat-avatar-preview.webp"
              alt="Saikat's halftone portrait"
              altEn="Saikat's halftone portrait"
            />
          </PortraitHiddenStage>
        </div>
      </div>
    </section>
  )
}

export async function HomePageView({ locale: _locale }: { locale: Locale }) {
  const [github, photos, books, music, posts, caseStudies] = await Promise.all([
    getGitHub(),
    safeListPublishedCollectionItems('photo'),
    safeListPublishedCollectionItems('book'),
    safeListPublishedCollectionItems('music'),
    safeListPublishedBlogPosts(),
    safeListPublishedProjectCaseStudies(),
  ])
  const caseStudyIds = caseStudies.map(({ projectId }) => projectId)
  const featured = selectFeaturedProjects(caseStudyIds)
  const hasCollections = books.length + music.length + photos.length > 0
  const portraitUrl =
    cloudinaryImageUrl(cloudinaryAvatarPublicId, {
      width: 1000,
      height: 1000,
      crop: 'fit',
      gravity: 'center',
    }) ?? '/images/saikat-avatar-preview.webp'
  // Sections number in render order, so an empty one never leaves a gap.
  let section = 0
  const next = () => ++section

  return (
    <RevealScope className="home">
      <Hero portraitUrl={portraitUrl} />

      <HomeSection index={next()} id="experience-title" title="Experience" figure="ledger">
        <ol className="ledger">
          {experience.map((job) => (
            <li key={job.company} className="ledger-row" data-current={job.to ? undefined : ''}>
              <span className="ledger-dates">
                {job.from}
                <span aria-hidden> – </span>
                <span className="sr-only"> to </span>
                {job.to ?? 'now'}
              </span>
              <span className="ledger-entry">
                <span className="ledger-role">{job.roleEn ?? job.role}</span>
                {job.url ? (
                  <a href={job.url} target="_blank" rel="noreferrer" className="ledger-company ink-link">
                    <ExternalLabel>{job.companyEn}</ExternalLabel>
                  </a>
                ) : (
                  <span className="ledger-company">{job.companyEn}</span>
                )}
              </span>
              {job.to ? null : (
                <span className="ledger-now">
                  <span className="status-dot" aria-hidden="true" />
                  Current
                </span>
              )}
            </li>
          ))}
        </ol>
      </HomeSection>

      <SelectedWork index={next()} projects={featured} caseStudyIds={new Set(caseStudyIds)} />

      <HomeSection
        index={next()}
        id="writing-title"
        title="Writing"
        figure="manuscript"
        action={<SectionLink href="/en/blog">All writing</SectionLink>}
      >
        {posts.length === 0 ? (
          <p className="empty-state" role="status">
            No posts yet. New writing will appear here.
          </p>
        ) : (
          <ul className="index">
            {posts.slice(0, 3).map((post) => (
              <li key={post.slug} className="index-row">
                <Link href={`/en/blog/${post.slug}`} className="index-link">
                  <time className="index-date" dateTime={post.publishedAt.toISOString()}>
                    {formatMonthDay(post.publishedAt)}
                  </time>
                  <span className="index-main">
                    <PostTitleTransition slug={post.slug}>
                      <span className="index-title">
                        <span>{post.title}</span>
                      </span>
                    </PostTitleTransition>
                    <span className="index-summary">{post.description}</span>
                  </span>
                  <span className="index-meta">
                    <span className="index-category">{post.category}</span>
                    <span className="index-time">{post.readingMinutes} min read</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </HomeSection>

      {hasCollections ? (
        <HomeSection index={next()} id="collections-title" title="Collections" figure="mats">
          <CollectionPrints books={books} music={music} photos={photos} />
        </HomeSection>
      ) : null}

      <HomeSection index={next()} id="tech-stack-title" title="Stack" figure="type-case">
        <TechStackRegister />
      </HomeSection>

      <HomeSection
        index={next()}
        id="activity-title"
        title="Activity"
        figure="density"
        action={
          <a href={`https://github.com/${github.user}`} target="_blank" rel="noreferrer" className="section-link ink-link">
            <ExternalLabel>@{github.user} on GitHub</ExternalLabel>
          </a>
        }
      >
        <GitHubActivity github={github} />
      </HomeSection>

      <HireMeSection index={next()} />
    </RevealScope>
  )
}
