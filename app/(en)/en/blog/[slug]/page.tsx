import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
import { Suspense } from 'react'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'
import remarkGfm from 'remark-gfm'
import { cacheLife, cacheTag } from 'next/cache'

import { BlogPostPageView, type PostSection } from '../../../../_views/blog-post-page'
import { JsonLd } from '~/components/json-ld'
import { MdxCodeBlock } from '~/components/mdx/code-block'
import { MermaidDiagram } from '~/components/mdx/mermaid-diagram'
import {
  safeGetPublishedBlogPost,
  safeListPublishedBlogPosts,
} from '~/lib/blog/repository'
import { localeMetadata, socialImageUrl } from '~/lib/locale-metadata'
import { cloudinaryImageUrl } from '~/lib/cloudinary/image-url'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import remarkMermaid from '~/lib/remark-mermaid'
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
        format: 'jpg',
      })
    : null
  const image = {
    url: coverUrl ?? socialImageUrl('en', path),
    width: 1200,
    height: 630,
    type: 'image/jpeg',
    alt: post.coverImageAlt || `${post.title} cover artwork`,
  }
  const base = localeMetadata({
    locale: 'en',
    path,
    title: post.title,
    description: post.description,
    type: 'article',
  })

  return {
    ...base,
    alternates: {
      ...base.alternates,
      types: { 'application/rss+xml': new URL('/en/feed.xml', seo.url).href },
    },
    category: post.category,
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
      section: post.category,
      tags: post.keywords.length ? post.keywords : undefined,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      site: seo.twitter,
      creator: seo.twitter,
      title: post.title,
      description: post.description,
      images: [image],
    },
    other: {
      'twitter:label1': 'Reading time',
      'twitter:data1': `${post.readingMinutes} min`,
      'twitter:label2': 'Filed under',
      'twitter:data2': post.category,
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

type HastNode = {
  type: string
  tagName?: string
  value?: string
  properties?: { id?: unknown }
  children?: HastNode[]
}

function hastText(node: HastNode): string {
  return node.type === 'text' ? node.value ?? '' : (node.children ?? []).map(hastText).join('')
}

// Runs after rehype-slug, so the contents list links to the exact ids the
// rendered headings carry.
function rehypeCollectSections(sections: PostSection[]) {
  return () => (tree: HastNode) => {
    for (const node of tree.children ?? []) {
      if (node.type === 'element' && node.tagName === 'h2' && typeof node.properties?.id === 'string') {
        sections.push({ id: node.properties.id, title: hastText(node).trim() })
      }
    }
  }
}

async function compileBlogBody(source: string) {
  'use cache'
  cacheLife({ stale: 300, revalidate: 300, expire: 86_400 })
  cacheTag('blog-mdx')

  const sections: PostSection[] = []
  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMermaid],
        rehypePlugins: [
          rehypeSlug,
          rehypeCollectSections(sections),
          [rehypePrettyCode, {
            keepBackground: false,
            theme: { light: 'github-light', dark: 'github-dark' },
          }],
        ],
      },
    },
    components: {
      MermaidDiagram,
      pre: MdxCodeBlock,
    },
  })

  return { content, sections }
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

  const articleImageUrl =
    coverUrl ?? socialImageUrl('en', '/blog/' + post.slug).href

  const { content, sections } = await compileBlogBody(post.body)
  const authorUrl = new URL('/en', seo.url).href
  const wordCount = post.body.split(/\s+/).filter(Boolean).length

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
            image: [
              {
                '@type': 'ImageObject',
                url: articleImageUrl,
                ...(coverUrl ? { width: 1200, height: 800 } : {}),
                caption: post.coverImageAlt || undefined,
              },
            ],
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: {
              '@type': 'Person',
              '@id': new URL('/en#person', seo.url).href,
              name: 'Saikat Das',
              url: authorUrl,
            },
            publisher: {
              '@type': 'Person',
              '@id': new URL('/en#person', seo.url).href,
              name: 'Saikat Das',
              url: authorUrl,
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
            isPartOf: {
              '@type': 'Blog',
              name: 'Writing · Saikat Das',
              url: new URL('/en/blog', seo.url).href,
            },
            articleSection: post.category,
            wordCount,
            timeRequired: `PT${post.readingMinutes}M`,
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
      <BlogPostPageView post={post} relatedPosts={relatedPosts} content={content} sections={sections} />
    </main>
  )
}
