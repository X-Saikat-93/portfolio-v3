export type Theme = 'light' | 'system' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

// Browser chrome follows the page ground. Mirrors --ground in
// app/styles/base/tokens.css (checked by lib/theme.test.ts).
export const THEME_GROUND: Record<ResolvedTheme, string> = {
  light: '#ebe2cf',
  dark: '#141619',
}

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'system' || value === 'dark'
}

export function resolveTheme(theme: Theme, systemDark: boolean): ResolvedTheme {
  if (theme !== 'system') return theme
  return systemDark ? 'dark' : 'light'
}

/** Points every theme-color meta at the active ground. */
export function syncThemeColor(resolved: ResolvedTheme) {
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = THEME_GROUND[resolved]
  }
}
