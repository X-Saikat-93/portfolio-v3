'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { OPEN_COMMAND_PALETTE_EVENT } from '~/components/command-palette'
import {
  EclipseIcon,
  PhotosIcon,
  ProjectsIcon,
  SearchIcon,
  WritingIcon,
} from '~/components/dock-icons'
import { Preferences } from '~/components/preferences'
import { Seal } from '~/components/washi-art'
import { useDockActiveIndicator } from '~/hooks/use-dock-active-indicator'
import { dockGoKeyFor, useDockGoShortcuts } from '~/hooks/use-dock-go-shortcuts'
import { useDockMagnify } from '~/hooks/use-dock-magnify'
import { useDockVisibility } from '~/hooks/use-dock-visibility'
import { T } from '~/lib/i18n'
import { localize, useLocale } from '~/lib/locale-client'
import {
  localePath,
  type Locale,
  unlocalizedPathname,
} from '~/lib/locale-route'
import { playDockSound } from '~/lib/sound'

const ITEMS = [
  { href: '/blog', zh: '写作', en: 'Writing', icon: WritingIcon },
  { href: '/photos', zh: '照片', en: 'Photos', icon: PhotosIcon },
  { href: '/projects', zh: '项目', en: 'Projects', icon: ProjectsIcon },
] as const

// The dock is frosted rice paper: paper held to the light, not glossy
// glass. The blur sits on the nav itself, because view-transition-name
// makes the nav a backdrop root and a child's blur would only see the
// sheet. The backdrop-filter must stay inline — never in the stylesheet —
// because LightningCSS strips raw backdrop-filter declarations.
export const SITE_DOCK_VIEW_TRANSITION_STYLE = {
  viewTransitionName: 'site-dock',
  backdropFilter: 'blur(18px) saturate(1.3)',
  WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
} as React.CSSProperties

// the paper fibre laid over the frosted pane
export function DockGlass() {
  return <span className="dock-glass" aria-hidden />
}

export function DockTip({
  zh,
  en,
  goKey,
  shortcut,
}: {
  zh: string
  en: string
  goKey?: string
  shortcut?: string
}) {
  return (
    <span className="dock-tip" aria-hidden>
      <span className="dock-tip-label">
        <T zh={zh} en={en} />
      </span>
      {goKey ? (
        <span className="dock-tip-keys">
          <kbd className="dock-tip-key">G</kbd>
          <kbd className="dock-tip-key">{goKey}</kbd>
        </span>
      ) : shortcut ? (
        <span className="dock-tip-keys">
          <kbd className="dock-tip-key">{shortcut}</kbd>
        </span>
      ) : null}
    </span>
  )
}

export function DockItem({
  href,
  locale,
  zh,
  en,
  goKey,
  active = false,
  itemRef,
  onNavigate,
  children,
}: {
  href: string
  locale: Locale
  zh: string
  en: string
  goKey?: string
  active?: boolean
  itemRef?: (element: HTMLAnchorElement | null) => void
  onNavigate?: (href: string, keyboardInitiated: boolean) => void
  children: React.ReactNode
}) {
  const label = localize(locale, zh, en)
  const ariaLabel = goKey
    ? localize(locale, `${zh}，G 然后 ${goKey}`, `${en}, G then ${goKey}`)
    : label

  return (
    <Link
      ref={itemRef}
      href={href}
      className="dock-item"
      data-active={active || undefined}
      aria-label={ariaLabel}
      aria-current={active ? 'page' : undefined}
      onClick={
        onNavigate
          ? (event) => {
              if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
                onNavigate(href, event.detail === 0)
                if (!active) playDockSound()
              }
            }
          : undefined
      }
    >
      {children}
      <DockTip zh={zh} en={en} goKey={goKey} />
    </Link>
  )
}

function DockSearch({ locale }: { locale: Locale }) {
  return (
    <button
      type="button"
      className="dock-item"
      aria-label={localize(locale, '搜索，/', 'Search, /')}
      aria-haspopup="dialog"
      aria-keyshortcuts="/"
      onClick={() => window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT))}
    >
      <SearchIcon />
      <DockTip zh="搜索" en="Search" shortcut="/" />
    </button>
  )
}

export function DockFallback({ locale }: { locale: Locale }) {
  return (
    <nav
      className="dock"
      style={SITE_DOCK_VIEW_TRANSITION_STYLE}
      aria-label={localize(locale, '主导航', 'Main navigation')}
      aria-busy="true"
    >
      <DockGlass />
      <DockItem
        href={localePath(locale, '/')}
        locale={locale}
        zh="首页"
        en="Home"
        goKey={dockGoKeyFor('/')}
      >
        <Seal className="dock-seal" />
      </DockItem>
      <span className="dock-rule" aria-hidden />
      {ITEMS.map(({ href, zh, en, icon: Icon }) => (
        <DockItem
          key={href}
          href={localePath(locale, href)}
          locale={locale}
          zh={zh}
          en={en}
          goKey={dockGoKeyFor(href)}
        >
          <Icon />
        </DockItem>
      ))}
      <span className="dock-rule" aria-hidden />
      <DockSearch locale={locale} />
      <button
        type="button"
        className="dock-item"
        aria-label={localize(locale, '偏好设置加载中', 'Loading preferences')}
        disabled
      >
        <EclipseIcon />
        <DockTip zh="外观" en="Theme" />
      </button>
    </nav>
  )
}

// The global dock, bottom centre — the seal is home, everything else an
// ink icon; the active route carries the seal at dot scale. Escape hides
// the tooltips until the pointer leaves.
export function Dock() {
  const locale = useLocale()
  const pathname = usePathname()
  const routePathname = unlocalizedPathname(pathname)
  const activeHref = routePathname === '/' ? '/' : ITEMS.find(({ href }) => routePathname.startsWith(href))?.href
  const { hidden, show } = useDockVisibility()
  // Owner chrome is invisible until known: the hint remembers a confirmed
  // probe so the Admin row and its chord are armed instantly on later
  // visits; the probe itself runs when the Preferences panel opens.
  const [ownerAdmin, setOwnerAdmin] = useState(false)
  const { dockRef, indicatorRef, registerItem, handleNavigate } =
    useDockActiveIndicator(activeHref)
  const [tipsHidden, setTipsHidden] = useState(false)
  useDockMagnify(dockRef)

  useDockGoShortcuts({
    locale,
    activeHref,
    onNavigate: handleNavigate,
    ownerAdmin,
  })

  useEffect(() => {
    try {
      if (localStorage.owner === '1') setOwnerAdmin(true)
    } catch {
      /* private mode */
    }
  }, [])

  return (
    <nav
      ref={dockRef}
      className="dock"
      data-hidden={hidden || undefined}
      data-tips-hidden={tipsHidden || undefined}
      onFocusCapture={show}
      onPointerEnter={show}
      onPointerLeave={() => setTipsHidden(false)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setTipsHidden(true)
      }}
      style={SITE_DOCK_VIEW_TRANSITION_STYLE}
      aria-label={localize(locale, '主导航', 'Main navigation')}
    >
      <DockGlass />
      <span ref={indicatorRef} className="dock-active-indicator" aria-hidden />
      <DockItem
        href={localePath(locale, '/')}
        locale={locale}
        zh="首页"
        en="Home"
        goKey={dockGoKeyFor('/')}
        active={routePathname === '/'}
        itemRef={(element) => registerItem('/', element)}
        onNavigate={handleNavigate}
      >
        <Seal className="dock-seal" />
      </DockItem>
      <span className="dock-rule" aria-hidden />
      {ITEMS.map(({ href, zh, en, icon: Icon }) => (
        <DockItem
          key={href}
          href={localePath(locale, href)}
          locale={locale}
          zh={zh}
          en={en}
          goKey={dockGoKeyFor(href)}
          active={routePathname.startsWith(href)}
          itemRef={(element) => registerItem(href, element)}
          onNavigate={handleNavigate}
        >
          <Icon />
        </DockItem>
      ))}
      <span className="dock-rule" aria-hidden />
      <DockSearch locale={locale} />
      <Preferences ownerAdmin={ownerAdmin} onOwnerAdminChange={setOwnerAdmin} />
    </nav>
  )
}
