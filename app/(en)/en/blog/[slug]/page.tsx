import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import { Suspense } from 'react'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'

import { CloudinaryImage } from '~/components/cloudinary-image'
import { JsonLd } from '~/components/json-ld'
import { PixelCluster } from '~/components/pixel-cluster'
import { PostTitleTransition } from '~/components/post-title-transition'
import { formatDate } from '~/lib/date'
import {
  safeGetPublishedBlogPost,
  safeListPublishedBlogPosts,
} from '~/lib/blog/repository'
import { localeMetadata } from '~/lib/locale-metadata'
import { cloudinaryImageUrl } from '~/lib/cloudinary/image-url'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { seo } from '~/lib/seo'

export async function generateStaticParams() {
  const posts = await safeListPublishedBlogPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await safeGetPublishedBlogPost(slug)
  if (!post) return localeMetadata({ locale: 'en', path: '/blog', ...publicPageMetadata.blog.en })

  const path = `/blog/${post.slug}`
  const canonical = new URL(`/en${path}`, seo.url)
  const authorUrl = new URL('/en', seo.url).href
  const coverUrl = post.coverImagePublicId
    ? cloudinaryImageUrl(post.coverImagePublicId, {
        width: 1200,
        height: 630,
        crop: 'fill',
        gravity: 'center',
      })
    : null
  const image = {
    url: coverUrl ?? new URL(`/og?locale=en&path=${encodeURIComponent(path)}`, seo.url),
    width: 1200,
    height: 630,
    alt: post.coverImageAlt || `${post.title} cover artwork`,
  }

  return {
    ...localeMetadata({
      locale: 'en',
      path,
      title: post.title,
      description: post.description,
      type: 'article',
    }),
    keywords: post.keywords.length ? post.keywords : undefined,
    authors: [{ name: 'Saikat Das', url: authorUrl }],
    creator: 'Saikat Das',
    publisher: 'Saikat Das',
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      locale: 'en_US',
      siteName: 'Saikat Das',
      url: canonical,
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [authorUrl],
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [image],
    },
  }
}

function BlogPostLoading() {
  return (
    <main className="mx-auto w-full max-w-[37.5rem] px-6" aria-busy="true">
      <p className="page-eyebrow">Writing</p>
      <p className="mt-3 text-sm text-muted-foreground">Loading article…</p>
    </main>
  )
}

export default function EnglishBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  return (
    <Suspense fallback={<BlogPostLoading />}>
      <EnglishBlogPostContent params={params} />
    </Suspense>
  )
}

async function EnglishBlogPostContent({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post, posts] = await Promise.all([
    safeGetPublishedBlogPost(slug),
    safeListPublishedBlogPosts(),
  ])
  if (!post) notFound()

  const relatedPosts = posts.filter((candidate) => candidate.slug !== post.slug).slice(0, 3)
  const canonical = new URL(`/en/blog/${post.slug}`, seo.url).href
  const coverUrl = post.coverImagePublicId
    ? cloudinaryImageUrl(post.coverImagePublicId, {
        width: 1200,
        height: 800,
        crop: 'fill',
        gravity: 'center',
      })
    : null

  const { content } = await compileMDX({
    source: post.body,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
  })

  return (
    <main className="mx-auto w-full max-w-[37.5rem] px-6">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            keywords: post.keywords.length ? post.keywords.join(', ') : undefined,
            image: coverUrl ? [coverUrl] : undefined,
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: {
              '@type': 'Person',
              name: 'Saikat Das',
              url: new URL('/en', seo.url).href,
            },
            publisher: {
              '@type': 'Person',
              name: 'Saikat Das',
              url: new URL('/en', seo.url).href,
            },
            mainEntityOfPage: canonical,
            articleSection: post.category,
            inLanguage: 'en',
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: new URL('/en', seo.url).href,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Writing',
                item: new URL('/en/blog', seo.url).href,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: canonical,
              },
            ],
          },
        ]}
      />
      <article>
        <header className="post-title-card">
          <div className="enter flex items-center justify-between gap-4">
            <Link
              href="/en/blog"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Writing
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
        <div className="post-body-stage prose enter mt-10">{content}</div>
      </article>
      {relatedPosts.length > 0 ? (
        <aside className="post-related hairline-top">
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
                  ) : null}
                  <span>
                    <span className="post-related-category">{relatedPost.category}</span>
                    <span className="post-related-title">{relatedPost.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
    </main>
  )
}
