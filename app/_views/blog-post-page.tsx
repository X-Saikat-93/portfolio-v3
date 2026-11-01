import Link from 'next/link'

import { CloudinaryImage } from '~/components/cloudinary-image'
import { PostTitleTransition } from '~/components/post-title-transition'
import { RevealScope } from '~/components/reveal-scope'
import { Seal } from '~/components/washi-art'
import { formatDate } from '~/lib/date'
import type { BlogPost } from '~/lib/blog/repository'

export type PostSection = { id: string; title: string }

// One list, shown two ways: folded under the cover on small screens, and as
// a rail beside the text on wide ones. CSS shows exactly one, so assistive
// tech meets a single contents list.
function PostContents({ sections }: { sections: readonly PostSection[] }) {
  const list = (
    <ol className="post-contents-list">
      {sections.map((section) => (
        <li key={section.id}>
          <a href={`#${section.id}`}>{section.title}</a>
        </li>
      ))}
    </ol>
  )

  return (
    <nav className="post-contents" aria-label="On this page">
      <details className="post-contents-fold">
        <summary className="page-label">
          <span>On this page</span>
          <span className="post-contents-count">{sections.length} sections</span>
        </summary>
        {list}
      </details>
      <div className="post-contents-rail">
        <p className="post-contents-label page-label">On this page</p>
        {list}
      </div>
    </nav>
  )
}

export function BlogPostPageView({
  post,
  relatedPosts,
  content,
  sections = [],
}: {
  post: BlogPost
  relatedPosts: BlogPost[]
  content: React.ReactNode
  sections?: readonly PostSection[]
}) {
  const published = post.publishedAt.toISOString()
  const hasContents = sections.length > 2

  return (
    <>
      {/* reading progress, driven by the page scroll in CSS alone */}
      <div className="post-progress" aria-hidden />
      <article className="post">
        <Link href="/en/blog" className="post-back">
          <span className="post-back-arrow" aria-hidden>
            ←
          </span>
          Writing
        </Link>
        <header className="post-head">
          <p className="post-kicker page-label">{post.category}</p>
          <h1 className="post-title">
            <PostTitleTransition slug={post.slug}>
              <span className="block">{post.title}</span>
            </PostTitleTransition>
          </h1>
          <p className="post-lede">{post.description}</p>
          <dl className="post-terms">
            <div>
              <dt>Written by</dt>
              <dd>Saikat Das</dd>
            </div>
            <div>
              <dt>Published</dt>
              <dd>
                <time dateTime={published}>{formatDate(post.publishedAt)}</time>
              </dd>
            </div>
            <div>
              <dt>Reading time</dt>
              <dd>{post.readingMinutes} min</dd>
            </div>
          </dl>
        </header>

        {post.coverImagePublicId ? (
          <figure className="post-cover paper">
            <CloudinaryImage
              publicId={post.coverImagePublicId}
              alt={post.coverImageAlt || `${post.title} cover artwork`}
              width={1200}
              height={800}
              preserveAspectRatio
              sizes="(min-width: 52rem) 48rem, calc(100vw - 2rem)"
              loading="eager"
              fetchPriority="high"
              className="post-cover-image"
            />
          </figure>
        ) : null}

        <div className="post-layout" data-contents={hasContents ? '' : undefined}>
          {hasContents ? <PostContents sections={sections} /> : null}
          {/* blocks below the fold develop in as they're reached */}
          <RevealScope className="post-body prose">{content}</RevealScope>
        </div>

        <footer className="post-signoff">
          <Seal className="post-signoff-seal" />
          <p>
            Written by <Link href="/en">Saikat Das</Link>. Filed under {post.category},{' '}
            <time dateTime={published}>{formatDate(post.publishedAt)}</time>.
          </p>
          <a href="#top" className="post-signoff-top">
            Back to top <span aria-hidden>↑</span>
          </a>
        </footer>
      </article>

      {relatedPosts.length > 0 ? (
        <RevealScope as="aside" className="post-related" aria-labelledby="post-related-title">
          <h2 id="post-related-title" className="post-related-heading page-label">
            Continue reading
          </h2>
          <ul className="post-related-list">
            {relatedPosts.map((relatedPost) => (
              <li key={relatedPost.slug} className="post-related-entry paper">
                <span className="post-related-print" aria-hidden="true">
                  {relatedPost.coverImagePublicId ? (
                    <CloudinaryImage
                      publicId={relatedPost.coverImagePublicId}
                      alt=""
                      width={480}
                      height={270}
                      preserveAspectRatio
                      sizes="(min-width: 48rem) 20rem, 6rem"
                      loading="lazy"
                      className="post-related-image"
                    />
                  ) : null}
                </span>
                <span className="post-related-text">
                  <span className="post-related-category">{relatedPost.category}</span>
                  <Link href={`/en/blog/${relatedPost.slug}`} className="post-related-title writing-hit">
                    {relatedPost.title}
                  </Link>
                </span>
              </li>
            ))}
          </ul>
        </RevealScope>
      ) : null}
    </>
  )
}
