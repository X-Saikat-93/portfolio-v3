import { BlogIndexPageView } from '../../../_views/blog-index-page'
import { JsonLd } from '~/components/json-ld'
import { localeMetadata } from '~/lib/locale-metadata'
import { publicPageMetadata } from '~/lib/public-page-metadata'
import { safeListPublishedBlogPosts } from '~/lib/blog/repository'
import { seo } from '~/lib/seo'

const copy = publicPageMetadata.blog.en

export const metadata = localeMetadata({
  locale: 'en',
  path: '/blog',
  ...copy,
})

export default async function EnglishBlogIndexPage() {
  const posts = await safeListPublishedBlogPosts()
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: copy.title,
          description: copy.description,
          url: new URL('/en/blog', seo.url).href,
          inLanguage: 'en',
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: posts.length,
            itemListElement: posts.map((post, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: post.title,
              url: new URL(`/en/blog/${post.slug}`, seo.url).href,
            })),
          },
        }}
      />
      <BlogIndexPageView locale="en" posts={posts} />
    </>
  )
}
