import Link from 'next/link'

import { CloudinaryImage } from '~/components/cloudinary-image'
import { WritingInkStage } from '~/components/hidden-list-stage'
import { PixelCluster } from '~/components/pixel-cluster'
import { PostTitleTransition } from '~/components/post-title-transition'
import { T } from '~/lib/i18n'
import { formatMonthDay } from '~/lib/date'
import { localePath, type Locale } from '~/lib/locale-route'
import type { BlogPost } from '~/lib/blog/repository'

function groupPostsByYear(posts: BlogPost[]) {
  const groups = new Map<number, BlogPost[]>()
  for (const post of posts) {
    const year = post.publishedAt.getFullYear()
    groups.set(year, [...(groups.get(year) ?? []), post])
  }
  return [...groups.entries()].sort(([a], [b]) => b - a)
}

export function BlogIndexPageView({ locale, posts }: { locale: Locale; posts: BlogPost[] }) {
  const firstPostSlug = posts[0]?.slug
  return (
    <div className="mx-auto w-full max-w-[37.5rem] px-6">
      <header className="enter flex items-center justify-between">
        <h1 className="page-eyebrow">
          <T zh="写作" en="Writing" />
        </h1>
        <PixelCluster variant={1} />
      </header>
      <WritingInkStage className="mt-6" contentClassName="flex flex-col gap-8">
        {posts.length === 0 ? (
          <p className="empty-state text-sm" role="status">
            <T zh="Writing will appear here when it is ready." en="Writing will appear here when it is ready." />
          </p>
        ) : (
          groupPostsByYear(posts).map(([year, yearPosts]) => (
            <section key={year} className="blog-year">
              <h2 className="blog-year-label page-eyebrow">{year}</h2>
              <ul className="motion-list mt-3 flex flex-col">
                {yearPosts.map((post) => (
                  <li
                    key={post.slug}
                    data-list-stage-row
                    data-list-stage-id={post.slug}
                    className="hairline-top"
                  >
                    <Link href={localePath(locale, `/blog/${post.slug}`)} className="blog-row">
                      <span className="print-pile" aria-hidden="true">
                        <span className="print-pile-sheet" />
                        <span className="print-pile-sheet" />
                        {post.coverImagePublicId ? (
                          <CloudinaryImage
                            publicId={post.coverImagePublicId}
                            alt=""
                            width={240}
                            height={144}
                            sizes="64px"
                            loading={post.slug === firstPostSlug ? 'eager' : 'lazy'}
                            className="print-thumb print-thumb-img"
                          />
                        ) : (
                          <span className="print-thumb print-thumb-empty" />
                        )}
                      </span>
                      <span data-list-stage-target className="min-w-0 flex-1">
                        <PostTitleTransition slug={post.slug}>
                          <span className="blog-row-title block">{post.title}</span>
                        </PostTitleTransition>
                        <span className="blog-row-meta">{post.category} · {post.readingMinutes} min read</span>
                        <span className="blog-row-summary">{post.description}</span>
                      </span>
                      <span className="blog-row-leader" aria-hidden="true" />
                      <time dateTime={post.publishedAt.toISOString()} className="blog-row-date text-muted-foreground">
                        {formatMonthDay(post.publishedAt)}
                      </time>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </WritingInkStage>
    </div>
  )
}
