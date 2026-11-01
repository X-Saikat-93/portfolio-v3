import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { compileMDX } from 'next-mdx-remote/rsc'
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
import { washiCodeTheme } from '~/lib/code-theme'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import remarkMermaid from '~/lib/remark-mermaid'
import { blogId, breadcrumbJsonLd, personId, seo } from '~/lib/seo'

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
  // unknown slugs stream a 200 shell, so the not-found page must not claim
  // an indexable canonical of its own
  if (!post) return { title: 'Post not found', robots: { index: false, follow: false } }

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
            theme: washiCodeTheme,
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

// Awaited outside any Suspense boundary: generateStaticParams lists every
// published slug, so the article itself is the static shell. A streamed
// fallback here painted first and shifted the footer when the post landed.
export default async function EnglishBlogPostPage({
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
  // Google picks from 16:9, 4:3 and 1:1 crops of the cover; without one, the
  // generated social card stands in at its real size.
  const coverId = post.coverImagePublicId
  const coverImages = coverId
    ? ([[1200, 675], [1200, 900], [1200, 1200]] as const).flatMap(([width, height]) => {
        const url = cloudinaryImageUrl(coverId, { width, height, crop: 'fill' })
        return url ? [{ url, width, height }] : []
      })
    : []
  const articleImages = coverImages.length
    ? coverImages
    : [{ url: socialImageUrl('en', '/blog/' + post.slug).href, width: 1200, height: 630 }]

  const { content, sections } = await compileBlogBody(post.body)
  const wordCount = post.body.split(/\s+/).filter(Boolean).length
  const author = { '@type': 'Person', '@id': personId, name: 'Saikat Das', url: new URL('/en', seo.url).href }

  return (
    <div className="page post-page">
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': `${canonical}#article`,
            url: canonical,
            headline: post.title,
            description: post.description,
            keywords: post.keywords.length ? post.keywords : undefined,
            image: articleImages.map((image) => ({
              '@type': 'ImageObject',
              ...image,
              caption: post.coverImageAlt || undefined,
            })),
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author,
            publisher: author,
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
            isPartOf: {
              '@type': 'Blog',
              '@id': blogId,
              name: `${publicPageMetadata.blog.en.heading} · Saikat Das`,
              url: new URL('/en/blog', seo.url).href,
            },
            articleSection: post.category,
            wordCount,
            timeRequired: `PT${post.readingMinutes}M`,
            inLanguage: 'en',
          },
          breadcrumbJsonLd([
            { name: publicPageMetadata.blog.en.heading, path: '/en/blog' },
            { name: post.title, path: `/en/blog/${post.slug}` },
          ]),
        ]}
      />
      <BlogPostPageView post={post} relatedPosts={relatedPosts} content={content} sections={sections} />
    </div>
  )
}
