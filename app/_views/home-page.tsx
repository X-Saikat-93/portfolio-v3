import Link from 'next/link'

import { ExperienceLedger } from '~/components/experience-ledger'
import { ExternalLabel } from '~/components/external-mark'
import { GitHubActivity } from '~/components/github-activity'
import { HalftonePortrait } from '~/components/halftone-portrait'
import { HeroProof } from '~/components/hero-proof'
import { HireMeSection } from '~/components/hire-me-section'
import { HomeSection, SectionLink } from '~/components/home-section'
import { HomeShelf } from '~/components/home-shelf'
import { PortraitHiddenStage } from '~/components/portrait-hidden-stage'
import { RevealScope } from '~/components/reveal-scope'
import { SelectedWork } from '~/components/selected-work'
import { EmailCard, GitHubCard, LinkedInCard, type GitHubSnapshot } from '~/components/social-cards'
import { TechStackRegister } from '~/components/tech-stack-register'
import { Seal } from '~/components/washi-art'
import { WritingSheets } from '~/components/writing-sheets'
import { cloudinaryAvatarPublicId, cloudinaryImageUrl } from '~/lib/cloudinary/image-url'
import { safeListPublishedBlogPosts } from '~/lib/blog/repository'
import { safeListPublishedCollectionItems } from '~/lib/collections/repository'
import type { Locale } from '~/lib/locale-route'
import { resumeProfile } from '~/lib/personal'
import { safeListPublishedProjectCaseStudies } from '~/lib/project-case-studies/repository'
import { selectFeaturedProjects } from '~/lib/projects'
import { getGitHub } from '~/lib/social-live'

const POSITIONING =
  'I build software that stays calm on a bad network, honest about money, fast as the data grows, and safe to ship on a Friday.'

function Hero({ portraitUrl, github }: { portraitUrl: string; github: GitHubSnapshot }) {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      {/* an artist's proof: the halftone portrait printed inside a plate
          mark on thick stock, the status pressed beneath it, the chop mark
          at the corner */}
      <div className="home-hero-proof">
        <HeroProof>
          <div className="proof-plate">
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
          <div className="proof-caption">
            <span className="proof-title">
              <span className="status-dot" aria-hidden="true" />
              Open to remote work
            </span>
            <span className="proof-role">India, UTC+5:30</span>
            <Seal className="proof-chop" />
          </div>
          <span className="proof-light" aria-hidden="true" />
        </HeroProof>
      </div>
      <div className="home-hero-copy">
        <h1 id="home-title" className="home-hero-title">
          <span className="home-hero-name">Saikat Das</span>
          <span className="sr-only"> — </span>
          <span className="home-hero-role">Full-Stack Software Engineer</span>
        </h1>
        <p className="home-hero-line">{POSITIONING}</p>
        <p className="home-hero-body">
          Working across the full stack, from the interface people touch to the systems
          that keep it correct. Currently building marketplace and hiring platforms at Human
          Before Resource.
        </p>
        <p className="home-hero-contact">
          Code on <GitHubCard data={github} triggerClassName="ink-link" />, background
          on <LinkedInCard triggerClassName="ink-link" />, or write to{' '}
          <EmailCard
            address={resumeProfile.email}
            trigger={resumeProfile.email}
            triggerClassName="ink-link"
          />
          .
        </p>
        <nav className="home-hero-paths" aria-label="Start here">
          <a href="#selected-work-title">
            <span className="ink-link">Selected work</span>
            <span aria-hidden> ↓</span>
          </a>
          <Link href="/en/blog">
            <span className="ink-link">Writing</span>
            <span aria-hidden> →</span>
          </Link>
          <Link href="/en/resume">
            <span className="ink-link">Resume</span>
            <span aria-hidden> →</span>
          </Link>
        </nav>
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
      <Hero portraitUrl={portraitUrl} github={github} />

      <HomeSection index={next()} id="experience-title" title="Experience">
        <ExperienceLedger />
      </HomeSection>

      <SelectedWork index={next()} projects={featured} caseStudyIds={new Set(caseStudyIds)} />

      <HomeSection
        index={next()}
        id="writing-title"
        title="Writing"
        action={<SectionLink href="/en/blog">All writing</SectionLink>}
      >
        <WritingSheets posts={posts.slice(0, 3)} />
      </HomeSection>

      {hasCollections ? (
        <HomeSection index={next()} id="collections-title" title="Collections">
          <HomeShelf books={books} music={music} photos={photos} />
        </HomeSection>
      ) : null}

      <HomeSection index={next()} id="tech-stack-title" title="Stack">
        <TechStackRegister />
      </HomeSection>

      <HomeSection
        index={next()}
        id="activity-title"
        title="Activity"
        action={
          <a href={`https://github.com/${github.user}`} target="_blank" rel="noreferrer" className="section-link">
            <span className="ink-link">
              <ExternalLabel>@{github.user} on GitHub</ExternalLabel>
            </span>
          </a>
        }
      >
        <GitHubActivity github={github} />
      </HomeSection>

      <HireMeSection index={next()} />
    </RevealScope>
  )
}
