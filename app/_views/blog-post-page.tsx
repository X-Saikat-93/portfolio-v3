import Link from 'next/link'

import { CloudinaryImage } from '~/components/cloudinary-image'
import { PixelCluster } from '~/components/pixel-cluster'
import { PostTitleTransition } from '~/components/post-title-transition'
import { RevealScope } from '~/components/reveal-scope'
import { formatDate } from '~/lib/date'
import type { BlogPost } from '~/lib/blog/repository'

export function BlogPostPageView({
  post,
  relatedPosts,
  content,
}: {
  post: BlogPost
  relatedPosts: BlogPost[]
  content: React.ReactNode
}) {
  return (
    <>
      {/* reading progress, driven by the page scroll in CSS alone */}
      <div className="post-progress" aria-hidden />
      <article>
        <header className="post-title-card">
          <div className="enter flex items-center justify-between gap-4">
            <Link href="/en/blog" className="post-back-link">
              <span className="post-back-arrow" aria-hidden>
                ←
              </span>
              Writing
            </Link>
            <PixelCluster variant={1} />
          </div>
          <p
            className="page-eyebrow enter mt-10"
            style={{ '--enter-delay': '45ms' } as React.CSSProperties}
          >
            {post.category}
          </p>
          <h1 className="mt-3">
            <PostTitleTransition slug={post.slug}>
              <span className="block">{post.title}</span>
            </PostTitleTransition>
          </h1>
          <p className="post-title-meta mt-4 text-sm leading-relaxed">{post.description}</p>
          <dl
            className="spec-plate enter"
            style={{ '--enter-delay': '390ms' } as React.CSSProperties}
          >
            <div>
              <dt>Published</dt>
              <dd>
                <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
              </dd>
            </div>
            <div>
              <dt>Reading time</dt>
              <dd>{post.readingMinutes} min</dd>
            </div>
          </dl>
        </header>
        {post.coverImagePublicId ? (
          <figure className="post-cover enter">
            <CloudinaryImage
              publicId={post.coverImagePublicId}
              alt={post.coverImageAlt || `${post.title} cover artwork`}
              width={1200}
              height={800}
              sizes="(max-width: 640px) calc(100vw - 3rem), 600px"
              priority
              className="post-cover-image"
            />
          </figure>
        ) : null}
        {/* the body enters as one register; blocks below the fold develop
            in as they're reached */}
        <RevealScope className="post-body-stage prose enter mt-10">{content}</RevealScope>
      </article>
      {relatedPosts.length > 0 ? (
        <RevealScope as="aside" className="post-related hairline-top">
          <h2 className="page-eyebrow">Continue reading</h2>
          <ul>
            {relatedPosts.map((relatedPost) => (
              <li key={relatedPost.slug}>
                <Link href={`/en/blog/${relatedPost.slug}`} className="post-related-link">
                  {relatedPost.coverImagePublicId ? (
                    <CloudinaryImage
                      publicId={relatedPost.coverImagePublicId}
                      alt=""
                      width={160}
                      height={96}
                      sizes="80px"
                      className="post-related-cover"
                    />
                  ) : (
                    <span className="post-related-cover" aria-hidden />
                  )}
                  <span>
                    <span className="post-related-category">{relatedPost.category}</span>
                    <span className="post-related-title">{relatedPost.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </RevealScope>
      ) : null}
    </>
  )
}
