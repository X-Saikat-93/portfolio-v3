import Link from 'next/link'
import { CloudinaryImage } from '~/components/cloudinary-image'
import { cloudinaryAvatarPublicId, cloudinaryImageUrl } from '~/lib/cloudinary/image-url'
import { ExternalLabel } from '~/components/external-mark'
import { HalftonePortrait } from '~/components/halftone-portrait'
import { HomeIntroduction } from '~/components/home-introduction'
import { HomeBookshelf } from '~/components/home-bookshelf'
import { NavCards, PhotoNavCard } from '~/components/nav-cards'
import { PixelCluster } from '~/components/pixel-cluster'
import { PortraitHiddenStage } from '~/components/portrait-hidden-stage'
import { PostTitleTransition } from '~/components/post-title-transition'
import { GitHubCommitsSection } from '~/components/github-commits-section'
import { TechStackSection } from '~/components/tech-stack-section'
import { T } from '~/lib/i18n'
import { formatMonthDay } from '~/lib/date'
import { localePath, type Locale } from '~/lib/locale-route'
import { safeListPublishedBlogPosts } from '~/lib/blog/repository'
import { safeListPublishedCollectionItems } from '~/lib/collections/repository'
import { experience } from '~/lib/personal'
import { projects } from '~/lib/projects'
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
  const [github, photos, books, music, posts] = await Promise.all([
    getGitHub(),
    safeListPublishedCollectionItems('photo'),
    safeListPublishedCollectionItems('book'),
    safeListPublishedCollectionItems('music'),
    safeListPublishedBlogPosts(),
  ])
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
    <div className="mx-auto w-full max-w-[37.5rem] px-6">
      <div className="flex flex-col-reverse justify-between gap-10 sm:flex-row sm:items-start">
        <div className="enter max-w-[19rem]">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              Saikat Das — Full-Stack Product Engineer
            </h1>
            <PixelCluster variant={2} className="shrink-0" />
          </div>
          <div className="mt-4">
            <HomeIntroduction github={github} />
          </div>
        </div>
        <div className="w-[9.35rem] shrink-0 sm:w-60">
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
        <ul className="mt-4 flex flex-col">
          {experience.map((job, i) => (
            <li
              key={job.company}
              className="enter-swing hairline-top"
              style={{ '--enter-delay': `${150 + i * 40}ms` } as React.CSSProperties}
            >
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
                  {job.from}—{job.to ?? <T zh="现在" en="now" />}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <TechStackSection index={Number(nextSectionIndex())} />

      <GitHubCommitsSection github={github} index={Number(nextSectionIndex())} />

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
                >
                  <span className="home-writing-cover" aria-hidden={!post.coverImageAlt}>
                    {post.coverImagePublicId ? (
                      <CloudinaryImage
                        publicId={post.coverImagePublicId}
                        alt={post.coverImageAlt}
                        width={240}
                        height={144}
                        sizes="96px"
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
                      <span className="home-writing-title">{post.title}</span>
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
              <li className="hairline-top py-3 text-sm">
                <Link href={localePath(locale, '/music')} className="list-row-link flex items-center justify-between gap-4">
                  <span>Music</span>
                  <span className="text-muted-foreground">{music.length}</span>
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
