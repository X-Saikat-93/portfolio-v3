import type { CSSProperties } from 'react'
import Link from 'next/link'

import { PostTitleTransition } from '~/components/post-title-transition'
import type { BlogPost } from '~/lib/blog/repository'
import { formatDateEn } from '~/lib/date'

// The latest posts as manuscript sheets on ruled paper; a sheet lifts and
// its dog-eared corner turns when the pointer reaches it.
export function WritingSheets({ posts }: { posts: readonly BlogPost[] }) {
  if (posts.length === 0) {
    return (
      <p className="empty-state" role="status">
        No posts yet. New writing will appear here.
      </p>
    )
  }

  return (
    <ul className="sheets">
      {posts.map((post, i) => (
        <li key={post.slug} className="sheet" style={{ '--i': i } as CSSProperties}>
          <Link href={`/en/blog/${post.slug}`} className="sheet-paper">
            <span className="sheet-head">
              <time dateTime={post.publishedAt.toISOString()}>{formatDateEn(post.publishedAt)}</time>
              <span>{post.category}</span>
            </span>
            <PostTitleTransition slug={post.slug}>
              <span className="sheet-title">
                <span>{post.title}</span>
              </span>
            </PostTitleTransition>
            <span className="sheet-summary">{post.description}</span>
            <span className="sheet-foot">{post.readingMinutes} min read</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
