'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { localePath, type Locale } from '~/lib/locale-route'
import { isTypingTarget, shortcutsEnabled } from '~/lib/shortcuts'
import { playDockSound } from '~/lib/sound'

/** One key → unlocalized dock route. */
export const DOCK_SHORTCUTS: Record<string, string> = {
  h: '/',
  w: '/blog',
  p: '/photos',
  j: '/projects',
}

/**
 * D → the owner admin. Not part of DOCK_SHORTCUTS: the key is armed only
 * after the owner probe confirms the session, and /admin is an unlocalized
 * route (the admin restores its locale in place).
 */
export const ADMIN_SHORTCUT = { key: 'd', href: '/admin' } as const

/** One key inside the owner admin; S returns to the public site. */
export const ADMIN_SHORTCUTS: Record<string, string> = {
  o: '/admin',
  m: '/admin/media',
  c: '/admin/cms',
  p: '/admin/projects',
  n: '/admin/contact',
  s: '/',
}

/** Uppercase key for an unlocalized dock href, e.g. `/blog` → `"W"`. */
export function dockKeyFor(href: string): string | undefined {
  const entry = Object.entries(DOCK_SHORTCUTS).find(([, path]) => path === href)
  return entry?.[0]?.toUpperCase()
}

/** Uppercase key for an owner-admin dock href, e.g. `/admin/media` → `"M"`. */
export function adminKeyFor(href: string): string | undefined {
  const entry = Object.entries(ADMIN_SHORTCUTS).find(([, path]) => path === href)
  return entry?.[0]?.toUpperCase()
}

type Target = { href: string; localize: boolean }

/**
 * The key handler both docks share: a bare letter that `resolve` maps to a
 * destination navigates there. Typing contexts, modified keys, auto-repeat
 * and a switched-off preference never navigate.
 */
function useKeyShortcuts({
  locale,
  activeHref,
  onNavigate,
  resolve,
}: {
  locale: Locale
  activeHref: string | undefined
  onNavigate?: (href: string, keyboardInitiated: boolean) => void
  resolve: (key: string) => Target | undefined
}) {
  const router = useRouter()
  const localeRef = useRef(locale)
  const activeHrefRef = useRef(activeHref)
  const onNavigateRef = useRef(onNavigate)
  const resolveRef = useRef(resolve)

  localeRef.current = locale
  activeHrefRef.current = activeHref
  onNavigateRef.current = onNavigate
  resolveRef.current = resolve

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return
      if (event.key.length !== 1 || isTypingTarget(event.target)) return
      if (!shortcutsEnabled()) return

      const target = resolveRef.current(event.key.toLowerCase())
      if (!target) return

      event.preventDefault()
      const destination = target.localize ? localePath(localeRef.current, target.href) : target.href
      onNavigateRef.current?.(target.href, true)
      if (activeHrefRef.current !== target.href) playDockSound()
      router.push(destination)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [router])
}

/**
 * Single-key shortcuts for the public dock: H / W / P / J jump to Home /
 * Writing / Photos / Projects, plus D to the admin once the owner probe
 * confirms.
 */
export function useDockShortcuts({
  locale,
  activeHref,
  onNavigate,
  ownerAdmin = false,
}: {
  locale: Locale
  activeHref: string | undefined
  onNavigate?: (href: string, keyboardInitiated: boolean) => void
  /** Arms D → /admin once the owner probe has confirmed the session. */
  ownerAdmin?: boolean
}) {
  const ownerAdminRef = useRef(ownerAdmin)
  ownerAdminRef.current = ownerAdmin

  useKeyShortcuts({
    locale,
    activeHref,
    onNavigate,
    resolve(key) {
      if (ownerAdminRef.current && key === ADMIN_SHORTCUT.key) {
        return { href: ADMIN_SHORTCUT.href, localize: false }
      }
      const href = DOCK_SHORTCUTS[key]
      return href ? { href, localize: true } : undefined
    },
  })
}

/**
 * Single-key shortcuts for the owner dock: O / M / C / P / N for the admin
 * surfaces, S back to the public site.
 */
export function useAdminShortcuts({
  locale,
  activeHref,
  onNavigate,
}: {
  locale: Locale
  activeHref: string | undefined
  onNavigate?: (href: string, keyboardInitiated: boolean) => void
}) {
  useKeyShortcuts({
    locale,
    activeHref,
    onNavigate,
    resolve(key) {
      const href = ADMIN_SHORTCUTS[key]
      return href ? { href, localize: href === '/' } : undefined
    },
  })
}
