import { getSessionCookie } from 'better-auth/cookies'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { isPublishedBlogSlug } from './lib/blog/published-slugs'
import { getProjectById } from './lib/projects'
import { isBlogPostSlug } from './lib/public-content-routes'

function postSlug(pathname: string) {
  const slug = pathname.match(/^\/(?:en\/)?blog\/([^/]+)\/?$/)?.[1]
  return slug && !/^(?:opengraph-image|twitter-image)-/.test(slug) ? slug : null
}

function missingPublicContent(pathname: string) {
  const slug = postSlug(pathname)
  if (slug) return !isBlogPostSlug(slug)

  // Projects are a code registry, so an unknown id is known to be missing
  // here; the page alone would stream a 200 before notFound() lands.
  const projectMatch = pathname.match(/^\/en\/projects\/([^/]+)\/?$/)
  if (projectMatch) return !getProjectById(projectMatch[1])

  return false
}

function isAdminPage(pathname: string) {
  return (
    (pathname === '/admin' || pathname.startsWith('/admin/')) &&
    pathname !== '/admin/login'
  )
}

function usesBetterAuth(pathname: string) {
  return (
    isAdminPage(pathname) ||
    pathname === '/api/admin' ||
    pathname.startsWith('/api/admin/')
  )
}

function missingLegacyAsset(pathname: string) {
  return (
    pathname.startsWith('/images/') &&
    pathname !== '/images/saikat-avatar-preview.webp'
  )
}

// Admin pages use the static site CSP from next.config (July 2026): the
// former per-request nonce policy forced dynamic rendering, which is
// incompatible with the admin's prerendered instant-navigation shells.
export function siteProxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/') {
    const destination = request.nextUrl.clone()
    destination.pathname = '/en'
    // permanent, so search engines consolidate the root onto /en
    return NextResponse.redirect(destination, 308)
  }

  if (missingPublicContent(pathname) || missingLegacyAsset(pathname)) return notFound(request)

  return NextResponse.next()
}

function notFound(request: NextRequest) {
  const notFoundUrl = request.nextUrl.clone()
  notFoundUrl.pathname = '/_not-found'
  return NextResponse.rewrite(notFoundUrl, { status: 404 })
}

export async function proxy(request: NextRequest, _event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname
  if (!usesBetterAuth(pathname)) {
    // a well-formed slug still needs the database to know it is published
    const slug = postSlug(pathname)
    if (slug && isBlogPostSlug(slug) && !(await isPublishedBlogSlug(slug))) {
      return notFound(request)
    }
    return siteProxy(request)
  }

  // Optimistic redirect only. Pages and mutation handlers validate the
  // session against Neon again; a cookie's presence is not authorization.
  if (isAdminPage(pathname) && !getSessionCookie(request)) {
    const destination = request.nextUrl.clone()
    destination.pathname = '/admin/login'
    destination.search = `?next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(destination)
  }

  return siteProxy(request)
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/api/admin/:path*',
    '/blog/:slug',
    '/en/blog/:slug',
    '/en/projects/:id',
    '/images/:path*',
  ],
}
