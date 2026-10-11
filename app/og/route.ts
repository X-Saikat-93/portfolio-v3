import { createHomeOgImage, createSectionOgImage } from '~/lib/og-image'
import type { Locale } from '~/lib/locale-route'
import type { PublicSection } from '~/lib/public-page-metadata'
import { isBlogPostSlug } from '~/lib/public-content-routes'

const sections = new Set<PublicSection>([
  'blog',
  'photos',
  'books',
  'music',
  'projects',
  'now',
  'resume',
  'contact',
  'uses',
  'privacy',
])
type PublicRouteSection = PublicSection

function isEnglish(value: string | null): value is Locale {
  return value === 'en'
}

function cached(response: Response) {
  response.headers.set(
    'cache-control',
    'public, max-age=0, s-maxage=31536000, stale-while-revalidate=86400',
  )
  return response
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  if (!isEnglish(searchParams.get('locale'))) return new Response('Not found', { status: 404 })
  const path = searchParams.get('path')
  if (!path || !path.startsWith('/')) return new Response('Not found', { status: 404 })

  if (path === '/' || path === '/en') return cached(await createHomeOgImage('en'))

  const segments = path.split('/').filter(Boolean)
  const section = segments[0] as PublicRouteSection | undefined
  if (section === 'blog' && segments.length === 2 && isBlogPostSlug(segments[1])) {
    return cached(await createSectionOgImage('blog', 'en'))
  }
  if (section && sections.has(section) && segments.length === 1) {
    return cached(await createSectionOgImage(section, 'en'))
  }

  return new Response('Not found', { status: 404 })
}
