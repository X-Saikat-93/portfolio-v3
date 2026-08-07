import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Suspense } from 'react'

import { AmbientBackground } from '~/components/ambient-background'
import { Dock, DockFallback } from '~/components/dock'
import { PreviewCardTimingProvider } from '~/components/preview-card-timing'
import {
  RouteMotionController,
  RouteViewTransition,
} from '~/components/route-motion-controller'
import { SiteFooter } from '~/components/site-footer'
import { ThemeProvider } from '~/components/theme-provider'
import { getGitHub } from '~/lib/social-live'
import { PREPAINT_SCRIPT } from '~/lib/security/inline-scripts'
import { seo } from '~/lib/seo'
import type { Locale } from '~/lib/locale-route'
import { cn } from '~/lib/utils'

import { fontVariablesForLocale } from '../fonts'

export const rootMetadata: Metadata = {
  metadataBase: seo.url,
  title: {
    default: 'Saikat Das',
    template: '%s | Saikat Das',
  },
}

export async function SiteDocument({
  children,
  isAdmin = false,
  locale,
}: Readonly<{
  children: React.ReactNode
  isAdmin?: boolean
  locale: Locale
}>) {
  const fontVariables = fontVariablesForLocale('en')

  if (isAdmin) {
    // The owner admin shares the public warm paper, ambient layer, and
    // column geometry, but stays outside public analytics, social reads,
    // and route view transitions — its chrome is the owner dock rendered
    // by the protected admin layout.
    return (
      <html
        lang="en"
        data-locale="en"
        suppressHydrationWarning
        className={cn('font-sans', fontVariables, 'public-site')}
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }} />
        </head>
        <body className="antialiased">
          <ThemeProvider>
            <AmbientBackground />
            <div className="flex min-h-screen flex-col pb-20">
              <main className="flex-1 pt-14">{children}</main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    )
  }

  // The profile card is cached, while the rest of the public chrome stays
  // request-independent.
  const github = await getGitHub()

  return (
    <html
      lang="en"
      data-locale="en"
      data-route-motion="none"
      suppressHydrationWarning
      className={cn('font-sans', fontVariables, 'public-site')}
    >
      <head>
        {/* Pre-paint handles the visited flag and theme. Locale restoration
            is intentionally limited to /admin; public URLs are explicit. */}
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <PreviewCardTimingProvider>
            <RouteMotionController />
            <AmbientBackground />
            <div className="flex min-h-screen flex-col pb-20">
              <main className="flex-1 pt-14">
                {/* The non-none default isolates route content while keeping the
                    CSS-named list → loading shell → article groups active. */}
                <RouteViewTransition>{children}</RouteViewTransition>
              </main>
              <SiteFooter github={github} locale="en" />
            </div>
            <Suspense fallback={<DockFallback locale={locale} />}>
              <Dock />
            </Suspense>
          </PreviewCardTimingProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
