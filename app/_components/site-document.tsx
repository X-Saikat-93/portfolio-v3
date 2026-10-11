import type { Metadata } from 'next'
import { Suspense } from 'react'

import { AmbientBackground } from '~/components/ambient-background'
import { CommandPalette, type CommandPaletteItem } from '~/components/command-palette'
import { Dock, DockFallback } from '~/components/dock'
import { JsonLd } from '~/components/json-ld'
import { PreviewCardTimingProvider } from '~/components/preview-card-timing'
import { RouteViewTransition } from '~/components/route-motion-controller'
import { SiteFooter } from '~/components/site-footer'
import { ThemeProvider } from '~/components/theme-provider'
import { safeListPublishedBlogPosts, type BlogPost } from '~/lib/blog/repository'
import { projects } from '~/lib/projects'
import { getGitHub } from '~/lib/social-live'
import { PREPAINT_SCRIPT } from '~/lib/security/inline-scripts'
import { seo } from '~/lib/seo'
import type { Locale } from '~/lib/locale-route'
import { cn } from '~/lib/utils'

import { fontVariablesForLocale } from '../fonts'

const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim()

export const rootMetadata: Metadata = {
  metadataBase: seo.url,
  description: seo.description,
  keywords: [
    'Saikat Das',
    'full-stack product engineer',
    'software engineer',
    'web products',
    'APIs',
    'Node.js',
    'React',
    'Next.js',
    'PostgreSQL',
  ],
  applicationName: 'Saikat Das',
  authors: [{ name: 'Saikat Das', url: new URL('/en', seo.url) }],
  creator: 'Saikat Das',
  publisher: 'Saikat Das',
  verification: googleSiteVerification
    ? { google: googleSiteVerification }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    email: false,
    telephone: false,
  },
  title: {
    default: seo.title,
    template: '%s | Saikat Das',
  },
}

const commandNavigationItems: CommandPaletteItem[] = [
  {
    id: 'home',
    label: 'Home',
    description: 'Profile, experience, selected work, and the current toolkit.',
    href: '/en',
    group: 'Navigate',
  },
  {
    id: 'tech-stack',
    label: 'Tech stack',
    description: 'Languages, frontend, backend, data, and delivery tools.',
    href: '/en#tech-stack-title',
    group: 'Navigate',
  },
  {
    id: 'projects',
    label: 'Projects',
    description: 'Production software and public builds.',
    href: '/en/projects',
    group: 'Navigate',
  },
  {
    id: 'writing',
    label: 'Writing',
    description: 'Notes, essays, and technical field notes.',
    href: '/en/blog',
    group: 'Navigate',
  },
  {
    id: 'photos',
    label: 'Photos',
    description: 'A small visual archive.',
    href: '/en/photos',
    group: 'Navigate',
  },
  {
    id: 'books',
    label: 'Books',
    description: 'The reading shelf.',
    href: '/en/books',
    group: 'Navigate',
  },
  {
    id: 'music',
    label: 'Music',
    description: 'Records and listening notes.',
    href: '/en/music',
    group: 'Navigate',
  },
  {
    id: 'now',
    label: 'Now',
    description: 'What is being built, learned, read, and welcomed right now.',
    href: '/en/now',
    group: 'Navigate',
  },
  {
    id: 'resume',
    label: 'Resume',
    description: 'Searchable HTML resume with the original PDF available.',
    href: '/en/resume',
    group: 'Navigate',
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Send a private message.',
    href: '/en/contact',
    group: 'Navigate',
  },
]

function commandItemsFor(posts: readonly BlogPost[]): CommandPaletteItem[] {
  return [
    ...commandNavigationItems,
    ...projects.map((project) => ({
      id: `project-${project.id}`,
      label: project.nameEn,
      description: project.descriptionEn ?? project.description,
      href: `/en/projects/${project.id}`,
      group: 'Projects',
    })),
    ...posts.map((post) => ({
      id: `writing-${post.slug}`,
      label: post.title,
      description: post.description,
      href: `/en/blog/${post.slug}`,
      group: 'Writing',
    })),
  ]
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
    // column geometry, but stays outside public analytics and social reads.
    // Its route content shares the same quiet transition language while the
    // owner dock remains a named, stationary layer.
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
              <a className="skip-link" href="#main-content">
                Skip to content
              </a>
              <main id="main-content" tabIndex={-1} className="flex-1 pt-14">
                <RouteViewTransition>{children}</RouteViewTransition>
              </main>
            </div>
          </ThemeProvider>
        </body>
      </html>
    )
  }

  // The profile card is cached, while the rest of the public chrome stays
  // request-independent.
  const [github, posts] = await Promise.all([getGitHub(), safeListPublishedBlogPosts()])
  const commandItems = commandItemsFor(posts)

  return (
    <html
      lang="en"
      data-locale="en"
      suppressHydrationWarning
      className={cn('font-sans', fontVariables, 'public-site')}
    >
      <head>
        {/* Pre-paint handles the visited flag and theme. Locale restoration
            is intentionally limited to /admin; public URLs are explicit. */}
        <script dangerouslySetInnerHTML={{ __html: PREPAINT_SCRIPT }} />
        <link rel="describedby" href="/llms.txt" />
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Person',
              '@id': new URL('/en#person', seo.url).href,
              name: 'Saikat Das',
              url: new URL('/en', seo.url).href,
              jobTitle: 'Full-Stack Software Engineer',
              description: seo.description,
              knowsAbout: [
                'Web product engineering',
                'API design',
                'Real-time systems',
                'Data systems',
                'Automation',
              ],
              sameAs: [
                'https://github.com/X-Saikat-93',
                'https://www.linkedin.com/in/saikat933/',
              ],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': new URL('/en#website', seo.url).href,
              name: 'Saikat Das',
              url: new URL('/en', seo.url).href,
              description: seo.description,
              inLanguage: 'en',
              author: { '@id': new URL('/en#person', seo.url).href },
            },
          ]}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <PreviewCardTimingProvider>
            <AmbientBackground />
            <div className="flex min-h-screen flex-col">
              <a className="skip-link" href="#main-content">
                Skip to content
              </a>
              <main id="main-content" tabIndex={-1} className="flex-1 pt-14">
                {/* Route content transitions independently of the persistent
                    footer and dock. */}
                <RouteViewTransition>{children}</RouteViewTransition>
              </main>
              <SiteFooter github={github} locale="en" />
            </div>
            <Suspense fallback={<DockFallback locale={locale} />}>
              <Dock />
            </Suspense>
            <CommandPalette items={commandItems} />
          </PreviewCardTimingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
