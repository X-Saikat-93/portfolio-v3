'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { coverRadius, duration, easing, prefersReducedMotion } from '~/lib/motion'
import { isTheme, resolveTheme, syncThemeColor, type Theme } from '~/lib/theme'

type Origin = { x: number; y: number }

type ThemeContextValue = {
  theme: Theme | undefined
  /** `origin` is the control's centre; the eclipse grows from there. */
  setTheme(value: string, origin?: Origin): void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function storedTheme(): Theme {
  try {
    const value = localStorage.getItem('theme')
    return isTheme(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme, systemDark())
  // colours change in one frame; the eclipse (or nothing) carries the change
  const blocker = document.createElement('style')
  blocker.textContent = '*,*::before,*::after{transition:none!important}'
  document.head.appendChild(blocker)
  document.documentElement.dataset.theme = resolved
  syncThemeColor(resolved)
  window.getComputedStyle(document.body).color
  window.setTimeout(() => blocker.remove(), 1)
}

// The eclipse: the new palette is revealed inside a circle that grows from
// the control, over the old one. Reduced motion and browsers without View
// Transitions switch instantly.
function eclipse(theme: Theme, origin: Origin | undefined) {
  const root = document.documentElement
  const unchanged = resolveTheme(theme, systemDark()) === root.dataset.theme
  if (!origin || unchanged || !document.startViewTransition || prefersReducedMotion()) {
    applyTheme(theme)
    return
  }
  root.dataset.eclipse = ''
  const transition = document.startViewTransition(() => applyTheme(theme))
  const { x, y } = origin
  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${coverRadius(x, y, window.innerWidth, window.innerHeight)}px at ${x}px ${y}px)`,
          ],
        },
        { duration: duration.base, easing: easing.ink, pseudoElement: '::view-transition-new(root)' },
      )
    })
    .catch(() => {})
  transition.finished.finally(() => delete root.dataset.eclipse)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setCurrentTheme] = useState<Theme>()

  useEffect(() => {
    const initial = storedTheme()
    setCurrentTheme(initial)
    syncThemeColor(resolveTheme(initial, systemDark()))
  }, [])

  useEffect(() => {
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => applyTheme('system')
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [theme])

  const setTheme = useCallback((value: string, origin?: Origin) => {
    if (!isTheme(value)) return
    try {
      localStorage.setItem('theme', value)
    } catch {
      // Private browsing may prevent persistence; the in-memory choice remains.
    }
    setCurrentTheme(value)
    eclipse(value, origin)
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
