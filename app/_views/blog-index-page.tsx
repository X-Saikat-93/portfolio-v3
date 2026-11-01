import Link from 'next/link'

import { CloudinaryImage } from '~/components/cloudinary-image'
import { WritingInkStage } from '~/components/hidden-list-stage'
import { PostTitleTransition } from '~/components/post-title-transition'
import { RevealScope } from '~/components/reveal-scope'
import { formatDateEn, formatMonthDay } from '~/lib/date'
import { localePath, type Locale } from '~/lib/locale-route'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import type { BlogPost } from '~/lib/blog/repository'

const copy = publicPageMetadata.blog.en

function groupPostsByYear(posts: BlogPost[]) {
  const groups = new Map<number, BlogPost[]>()
  for (const post of posts) {
    const year = post.publishedAt.getFullYear()
    groups.set(year, [...(groups.get(year) ?? []), post])
  }
  return [...groups.entries()].sort(([a], [b]) => b - a)
}

// Writing as a print run: the newest post pulled as a large proof, the rest
// entered on one archive sheet by year. Each title is the only link in its
// entry; a stretched hit area makes the whole entry clickable.
export function BlogIndexPageView({ locale, posts }: { locale: Locale; posts: BlogPost[] }) {
  const [latest, ...archive] = posts
  const postHref = (post: BlogPost) => localePath(locale, `/blog/${post.slug}`)

  return (
    <div className="page writing">
      <header className="page-head">
        <h1 className="page-title">{copy.heading}</h1>
        <p className="page-lede">{copy.lede}</p>
        {posts.length > 0 ? (
          <p className="page-meta">
            <span>
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
            <a href="/en/feed.xml" className="ink-link">
              RSS feed
            </a>
          </p>
        ) : null}
      </header>

      {latest ? (
        <article className="writing-lead paper paper-grain paper-edge">
          <div className="writing-lead-print">
            {latest.coverImagePublicId ? (
              <CloudinaryImage
                publicId={latest.coverImagePublicId}
                alt=""
                width={1280}
                height={720}
                preserveAspectRatio
                sizes="(min-width: 56rem) 34rem, calc(100vw - 2rem)"
                loading="eager"
                fetchPriority="high"
                className="writing-lead-image"
              />
            ) : null}
          </div>
          <div className="writing-lead-text">
            <p className="writing-kicker page-label">
              <span className="writing-kicker-mark">Latest</span>
              {latest.category}
            </p>
            <h2 className="writing-lead-title">
              <Link href={postHref(latest)} className="writing-hit">
                <PostTitleTransition slug={latest.slug}>
                  <span>{latest.title}</span>
                </PostTitleTransition>
              </Link>
            </h2>
            <p className="writing-lead-summary">{latest.description}</p>
            <p className="writing-lead-foot">
              <time dateTime={latest.publishedAt.toISOString()}>{formatDateEn(latest.publishedAt)}</time>
              <span>{latest.readingMinutes} min read</span>
              <span className="writing-lead-cta" aria-hidden="true">
                Read <span className="writing-lead-arrow">→</span>
              </span>
            </p>
          </div>
        </article>
      ) : (
        <p className="empty-state writing-empty" role="status">
          Writing will appear here when it is ready.
        </p>
      )}

      {archive.length > 0 ? (
        <WritingInkStage className="writing-archive paper paper-grain">
          {groupPostsByYear(archive).map(([year, yearPosts]) => (
            <section key={year} className="archive-year" aria-labelledby={`archive-${year}`}>
              <h2 id={`archive-${year}`} className="archive-year-label page-label">
                {year}
              </h2>
              {/* rows below the fold develop in as they are reached */}
              <RevealScope as="ol" className="archive-list">
                {yearPosts.map((post) => (
                  <li
                    key={post.slug}
                    className="archive-entry"
                    data-list-stage-row
                    data-list-stage-id={post.slug}
                  >
                    <time dateTime={post.publishedAt.toISOString()} className="archive-date">
                      {formatMonthDay(post.publishedAt)}
                    </time>
                    <div data-list-stage-target className="archive-main">
                      <h3 className="archive-title">
                        <Link href={postHref(post)} className="writing-hit">
                          <PostTitleTransition slug={post.slug}>
                            <span>{post.title}</span>
                          </PostTitleTransition>
                        </Link>
                      </h3>
                      <p className="archive-summary">{post.description}</p>
                    </div>
                    <p className="archive-meta">
                      <span>{post.category}</span>
                      <span>{post.readingMinutes} min</span>
                    </p>
                    <span className="archive-print" aria-hidden="true">
                      {post.coverImagePublicId ? (
                        <CloudinaryImage
                          publicId={post.coverImagePublicId}
                          alt=""
                          width={256}
                          height={144}
                          preserveAspectRatio
                          sizes="(min-width: 64rem) 7rem, 6.5rem"
                          loading="lazy"
                          className="archive-print-image"
                        />
                      ) : null}
                    </span>
                  </li>
                ))}
              </RevealScope>
            </section>
          ))}
        </WritingInkStage>
      ) : null}
    </div>
  )
}
