import { BlogIndexPageView } from '../../../_views/blog-index-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { safeListPublishedBlogPosts } from '~/lib/blog/repository'
import { blogId, breadcrumbJsonLd, personId, seo, webPageJsonLd } from '~/lib/seo'

const copy = publicPageMetadata.blog.en

export const metadata = localeMetadata({
  locale: 'en',
  path: '/blog',
  ...copy,
})

export default async function EnglishBlogIndexPage() {
  const posts = await safeListPublishedBlogPosts()
  const url = new URL('/en/blog', seo.url).href
  return (
    <>
      <JsonLd
        data={[
          {
            ...webPageJsonLd('/en/blog', copy, 'CollectionPage'),
            mainEntity: {
              '@type': 'Blog',
              '@id': blogId,
              name: `${copy.heading} · Saikat Das`,
              description: copy.description,
              url,
              inLanguage: 'en',
              author: { '@id': personId },
              publisher: { '@id': personId },
              blogPost: posts.map((post) => {
                const postUrl = new URL(`/en/blog/${post.slug}`, seo.url).href
                return {
                  '@type': 'BlogPosting',
                  '@id': `${postUrl}#article`,
                  url: postUrl,
                  headline: post.title,
                  description: post.description,
                  datePublished: post.publishedAt.toISOString(),
                  dateModified: post.updatedAt.toISOString(),
                  articleSection: post.category,
                  author: { '@id': personId },
                }
              }),
            },
          },
          breadcrumbJsonLd([{ name: copy.heading, path: '/en/blog' }]),
        ]}
      />
      <BlogIndexPageView locale="en" posts={posts} />
    </>
  )
}
