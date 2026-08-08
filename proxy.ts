import { getSessionCookie } from 'better-auth/cookies'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { isBlogPostSlug } from './lib/public-content-routes'

function missingPublicContent(pathname: string) {
  const postMatch = pathname.match(/^\/(?:en\/)?blog\/([^/]+)\/?$/)
  if (postMatch) {
    const slug = postMatch[1]
    if (/^(?:opengraph-image|twitter-image)-/.test(slug)) return false
    return !isBlogPostSlug(slug)
  }

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
    return NextResponse.redirect(destination)
  }

  if (missingPublicContent(pathname) || missingLegacyAsset(pathname)) {
    const notFoundUrl = request.nextUrl.clone()
    notFoundUrl.pathname = '/_not-found'
    return NextResponse.rewrite(notFoundUrl, { status: 404 })
  }

  return NextResponse.next()
}

export function proxy(request: NextRequest, _event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname
  if (!usesBetterAuth(pathname)) return siteProxy(request)

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
    '/images/:path*',
  ],
}
