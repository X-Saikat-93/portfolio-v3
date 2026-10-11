'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { OPEN_COMMAND_PALETTE_EVENT } from '~/components/command-palette'
import {
  PhotosIcon,
  PreferencesIcon,
  ProjectsIcon,
  SearchIcon,
  WritingIcon,
} from '~/components/dock-icons'
import { CloudinaryAvatar } from '~/components/cloudinary-image'
import { Preferences } from '~/components/preferences'
import { useDockActiveIndicator } from '~/hooks/use-dock-active-indicator'
import { dockGoKeyFor, useDockGoShortcuts } from '~/hooks/use-dock-go-shortcuts'
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

// The dock is frosted glass: iOS-style blur and vibrancy over the pill's
// thin tint. The blur sits on the nav itself, because view-transition-name
// makes the nav a backdrop root and a child's blur would only see the pill.
// The backdrop-filter must stay inline — never in the stylesheet — because
// LightningCSS strips raw backdrop-filter declarations.
export const SITE_DOCK_VIEW_TRANSITION_STYLE = {
  viewTransitionName: 'site-dock',
  backdropFilter: 'blur(20px) saturate(1.8)',
  WebkitBackdropFilter: 'blur(20px) saturate(1.8)',
} as React.CSSProperties

// the sheen and specular rim over the glass
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
        <span className="dock-avatar">
          <CloudinaryAvatar alt="" width={26} height={26} />
        </span>
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
        <PreferencesIcon />
        <DockTip zh="偏好" en="Preferences" />
      </button>
    </nav>
  )
}

// The global pill dock, bottom center — the avatar is home, everything
// else an icon. Circles inside a pill keep the radii concentric by
// construction.
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
      onFocusCapture={show}
      onPointerEnter={show}
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
        <span className="dock-avatar">
          <CloudinaryAvatar alt="" width={26} height={26} />
        </span>
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
