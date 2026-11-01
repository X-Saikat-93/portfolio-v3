import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fontVariablesForLocale } = vi.hoisted(() => ({
  fontVariablesForLocale: vi.fn((locale: 'zh' | 'en') =>
    locale === 'zh' ? 'latin-font cjk-font' : 'latin-font',
  ),
}))

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>()

  return {
    ...react,
    ViewTransition: ({ children }: { children: React.ReactNode }) => children,
  }
})

vi.mock('~/components/ambient-background', () => ({
  AmbientBackground: () => null,
}))
vi.mock('~/components/command-palette', () => ({
  CommandPalette: () => <span data-command-palette="" />,
}))
vi.mock('~/components/dock', () => ({
  Dock: () => <span data-public-dock="" />,
  DockFallback: () => <span data-public-dock-fallback="" />,
}))
vi.mock('~/components/locale-restorer', () => ({
  LocaleRestorer: () => null,
}))
vi.mock('~/components/preview-card-timing', () => ({
  PreviewCardTimingProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-public-preview-cards="">{children}</div>
  ),
}))
vi.mock('~/components/site-footer', () => ({
  SiteFooter: () => <span data-public-footer="" />,
}))
vi.mock('~/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))
vi.mock('~/lib/security/inline-scripts', () => ({
  PREPAINT_SCRIPT: '',
}))
vi.mock('~/lib/blog/repository', () => ({
  safeListPublishedBlogPosts: vi.fn().mockResolvedValue([]),
}))
vi.mock('~/lib/social-live', () => ({
  getGitHub: vi.fn().mockResolvedValue({}),
}))
vi.mock('~/components/route-motion-controller', () => ({
  RouteViewTransition: ({ children }: { children: React.ReactNode }) => (
    <div data-route-transition="">{children}</div>
  ),
}))
vi.mock('./fonts', () => ({
  fontVariablesForLocale,
}))

import { SiteDocument } from './_components/site-document'
import { getGitHub } from '~/lib/social-live'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SiteDocument analytics', () => {
  it('uses the English font for every public document', async () => {
    const english = renderToStaticMarkup(
      await SiteDocument({ children: <p>English page</p>, locale: 'en' }),
    )

    expect(english).not.toContain('cjk-font')
    expect(fontVariablesForLocale).toHaveBeenCalledWith('en')
  })

  it('collects page views across the public route families', async () => {
    for (const locale of ['en'] as const) {
      const html = renderToStaticMarkup(
        await SiteDocument({
          children: <p>Public page</p>,
          locale,
        }),
      )

      expect(html).toContain('data-public-dock')
      expect(html).toContain('data-public-footer')
      expect(html).toContain('data-route-transition')
      expect(html).toContain('data-public-preview-cards')
      expect(html).toContain('data-command-palette')
    }
  })

  it('keeps owner-admin routes outside public chrome and social reads', async () => {
    const html = renderToStaticMarkup(
      await SiteDocument({
        children: <p>Owner admin</p>,
        isAdmin: true,
        locale: 'en',
      }),
    )

    expect(html).not.toContain('data-public-dock')
    expect(html).not.toContain('data-public-footer')
    expect(html).toContain('data-route-transition')
    expect(html).not.toContain('data-public-preview-cards')
    expect(html).toContain('Owner admin')
    // The admin shares the warm working-paper palette (July 2026 decision)
    // while staying outside analytics and social reads.
    expect(html).toContain('public-site')
    expect(getGitHub).not.toHaveBeenCalled()
  })
})
