import { createHomeOgImage, createSectionOgImage } from '~/lib/og-image'
import type { Locale } from '~/lib/locale-route'
import type { PublicSection } from '~/lib/public-page-metadata'

const sections = new Set<PublicSection>(['blog', 'photos', 'books', 'music', 'projects'])
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

  const section = path.split('/').filter(Boolean)[0] as PublicRouteSection | undefined
  if (section && sections.has(section) && path.split('/').filter(Boolean).length === 1) {
    return cached(await createSectionOgImage(section, 'en'))
  }

  return new Response('Not found', { status: 404 })
}
