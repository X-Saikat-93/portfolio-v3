import Link from 'next/link'
import { CloudinaryImage } from '~/components/cloudinary-image'
import { cloudinaryAvatarPublicId, cloudinaryImageUrl } from '~/lib/cloudinary/image-url'
import { ExternalLabel } from '~/components/external-mark'
import { HalftonePortrait } from '~/components/halftone-portrait'
import { HomeIntroduction } from '~/components/home-introduction'
import { HomeBookshelf } from '~/components/home-bookshelf'
import { MusicRecordArtwork } from '~/components/music-record-artwork'
import { NavCards, PhotoNavCard } from '~/components/nav-cards'
import { PixelCluster } from '~/components/pixel-cluster'
import { PortraitHiddenStage } from '~/components/portrait-hidden-stage'
import { PostTitleTransition } from '~/components/post-title-transition'
import { RevealScope } from '~/components/reveal-scope'
import { CodeSection } from '~/components/code-section'
import { HireMeSection } from '~/components/hire-me-section'
import { SelectedWork } from '~/components/selected-work'
import { T } from '~/lib/i18n'
import { formatMonthDay } from '~/lib/date'
import { localePath, type Locale } from '~/lib/locale-route'
import { safeListPublishedBlogPosts } from '~/lib/blog/repository'
import { safeListPublishedCollectionItems } from '~/lib/collections/repository'
import { experience } from '~/lib/personal'
import { safeListPublishedProjectCaseStudies } from '~/lib/project-case-studies/repository'
import { projects, selectFeaturedProjects } from '~/lib/projects'
import { getGitHub } from '~/lib/social-live'

function SectionTitle({
  index,
  children,
  delay,
}: {
  index: string
  children: React.ReactNode
  delay: number
}) {
  return (
    <h2
      className="section-tag enter"
      style={{ '--enter-delay': `${delay}ms` } as React.CSSProperties}
    >
      <span className="section-tag-index" aria-hidden>
        {index}
      </span>
      <span className="section-tag-hatch" aria-hidden />
      <span className="section-tag-label">{children}</span>
    </h2>
  )
}
export async function HomePageView({ locale }: { locale: Locale }) {
  const [github, photos, books, music, posts, caseStudies] = await Promise.all([
    getGitHub(),
    safeListPublishedCollectionItems('photo'),
    safeListPublishedCollectionItems('book'),
    safeListPublishedCollectionItems('music'),
    safeListPublishedBlogPosts(),
    safeListPublishedProjectCaseStudies(),
  ])
  const caseStudyIds = caseStudies.map(({ projectId }) => projectId)
  const portraitUrl = cloudinaryImageUrl(cloudinaryAvatarPublicId, {
    width: 1000,
    height: 1000,
    crop: 'fit',
    gravity: 'center',
  }) ?? '/images/saikat-avatar-preview.webp'
  // Section tags number in render order.
  let sectionCount = 0
  const nextSectionIndex = () => String(++sectionCount).padStart(2, '0')

  return (
    <RevealScope className="home-reveal mx-auto w-full max-w-[37.5rem] px-6">
      <div className="home-hero flex flex-col-reverse justify-between gap-6 sm:flex-row sm:items-start sm:gap-10">
        <div className="home-hero-copy enter max-w-[19rem]">
          <div className="flex items-start gap-2">
            <h1 className="home-hero-title text-base font-semibold tracking-tight text-foreground">
              <span className="home-hero-name"><span>Saikat Das</span></span>
              <span className="sr-only"> — </span>
              <span className="home-hero-role block text-sm font-normal tracking-normal text-muted-foreground">
                Full-Stack Product Engineer
              </span>
            </h1>
            <PixelCluster variant={2} className="shrink-0" />
          </div>
          <div className="mt-4">
            <HomeIntroduction github={github} />
          </div>
        </div>
        <div className="home-hero-portrait shrink-0 sm:w-60 sm:self-auto">
          {/* phones: a full-bleed cover portrait; desktop keeps the halftone */}
          <div className="home-profile-portrait-static">
            <CloudinaryImage
              publicId={cloudinaryAvatarPublicId}
              width={800}
              height={1000}
              crop="fill"
              gravity="face"
              preserveAspectRatio
              fallbackSrc="/images/saikat-avatar-preview.webp"
              alt="Saikat Das"
              sizes="100vw"
              loading="eager"
              fetchPriority="high"
              className="home-profile-portrait-static-image"
            />
          </div>
          <div className="home-profile-portrait-interactive">
            <PortraitHiddenStage
              label="Saikat's halftone portrait. Reveal the hidden topographic halo"
            >
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
      </div>

      <NavCards
        postCount={posts.length}
        projectCount={projects.length}
        locale={locale}
        photoCard={<PhotoNavCard photoCount={photos.length} locale={locale} />}
      />

      <section className="mt-16">
        <SectionTitle index={nextSectionIndex()} delay={120}>
          <T zh="经历" en="Experience" />
        </SectionTitle>
        {/* a timeline rail: each role's node lands, then the rail draws on to the next */}
        <ol className="experience-timeline mt-4">
          {experience.map((job, i) => (
            <li
              key={job.company}
              className="experience-item"
              data-current={job.to ? undefined : ''}
              style={{ '--i': i } as React.CSSProperties}
            >
              <span className="experience-node" aria-hidden />
              <div className="experience-row text-sm">
                <div className="experience-details">
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="experience-company font-medium transition-colors duration-150 ease-[ease] hover:text-foreground"
                    >
                      <ExternalLabel>
                        <T zh={job.company} en={job.companyEn} />
                      </ExternalLabel>
                    </a>
                  ) : (
                    <span className="experience-company font-medium">
                      <T zh={job.company} en={job.companyEn} />
                    </span>
                  )}
                  <span className="experience-role text-muted-foreground">
                    <T zh={job.role} en={job.roleEn ?? job.role} />
                  </span>
                </div>
                <span className="experience-date text-muted-foreground tabular-nums">
                  {job.from}
                  <span className="experience-date-dash" aria-hidden> – </span>
                  <span className="sr-only"> to </span>
                  <span className="experience-date-to">{job.to ?? <T zh="现在" en="now" />}</span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <SelectedWork
        index={Number(nextSectionIndex())}
        projects={selectFeaturedProjects(caseStudyIds)}
        caseStudyIds={new Set(caseStudyIds)}
      />

      <section className="mt-16">
        <div className="flex items-center justify-between gap-4">
          <SectionTitle index={nextSectionIndex()} delay={200}>
            <T zh="写作" en="Writing" />
          </SectionTitle>
          <Link
            href={localePath(locale, '/blog')}
            className="enter relative shrink-0 text-sm text-muted-foreground transition-colors duration-150 ease-[ease] after:absolute after:-inset-x-2 after:-inset-y-3 after:content-[''] hover:text-foreground focus-visible:rounded-sm focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4"
            style={{ '--enter-delay': '200ms' } as React.CSSProperties}
          >
            <T zh="查看全部" en="View all" />
          </Link>
        </div>
        <ul className="home-writing-list motion-list mt-4 flex flex-col">
          {posts.length === 0 ? (
            <li className="empty-state text-sm" role="status">
              <T zh="Writing will appear here when it is ready." en="Writing will appear here when it is ready." />
            </li>
          ) : (
            posts.slice(0, 3).map((post, index) => (
              <li key={post.slug} className="hairline-top">
                <Link
                  href={localePath(locale, `/blog/${post.slug}`)}
                  className="home-writing-row"
                  data-lead={index === 0 ? '' : undefined}
                >
                  <span className="home-writing-cover" aria-hidden={!post.coverImageAlt}>
                    {post.coverImagePublicId ? (
                      <CloudinaryImage
                        publicId={post.coverImagePublicId}
                        alt={post.coverImageAlt}
                        width={index === 0 ? 720 : 240}
                        height={index === 0 ? 432 : 144}
                        sizes={index === 0 ? '(min-width: 40rem) 208px, 100vw' : '96px'}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className="home-writing-cover-image"
                      />
                    ) : (
                      <span className="home-writing-cover-empty" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="home-writing-meta">
                      <span>{post.category}</span>
                      <time dateTime={post.publishedAt.toISOString()}>
                        {formatMonthDay(post.publishedAt)}
                      </time>
                    </span>
                    <PostTitleTransition slug={post.slug}>
                      <span className="home-writing-title"><span>{post.title}</span></span>
                    </PostTitleTransition>
                    <span className="home-writing-summary">{post.description}</span>
                    <span className="home-writing-time">{post.readingMinutes} min read</span>
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>

      <CodeSection github={github} index={Number(nextSectionIndex())} />

      {books.length > 0 || music.length > 0 ? (
        <section className="mt-16">
          <SectionTitle index={nextSectionIndex()} delay={240}>
            <T zh="收藏" en="Collections" />
          </SectionTitle>
          {books.length > 0 ? (
            <HomeBookshelf
              books={books.map((book) => ({
                id: book.id,
                title: book.title,
                creator: book.creator,
                url: book.url,
                imagePublicId: book.imagePublicId,
              }))}
              allBooksHref={localePath(locale, '/books')}
            />
          ) : null}
          <ul className="focus-list motion-list flex flex-col">
            {music.length > 0 ? (
              <li className="music-home-item">
                <Link href={localePath(locale, '/music')} className="music-home-link">
                  <span className="music-home-art">
                    <MusicRecordArtwork item={music[0]} size="home" />
                  </span>
                  <span className="music-home-copy">
                    <span className="music-home-label">Music</span>
                    <span className="music-home-title">{music[0].title}</span>
                    {music[0].creator ? <span className="music-home-artist">{music[0].creator}</span> : null}
                  </span>
                  <span className="music-home-count" aria-label={`${music.length} records`}>
                    {String(music.length).padStart(2, '0')}
                  </span>
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {/* the closing call, once the evidence is in */}
      <HireMeSection index={Number(nextSectionIndex())} />
    </RevealScope>
  )
}
