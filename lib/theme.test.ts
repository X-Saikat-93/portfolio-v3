// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { isTheme, resolveTheme, syncThemeColor, THEME_GROUND } from './theme'

const tokens = readFileSync(join(process.cwd(), 'app/styles/base/tokens.css'), 'utf8')

function groundIn(block: string) {
  return block.match(/--ground:\s*(#[0-9a-f]{6})/i)?.[1]
}

describe('theme', () => {
  it('keeps browser chrome colours in step with the --ground tokens', () => {
    const [light, dark] = tokens.split(':root[data-theme="dark"]')
    expect(groundIn(light)).toBe(THEME_GROUND.light)
    expect(groundIn(dark)).toBe(THEME_GROUND.dark)
  })

  it('resolves system against the media query and keeps explicit choices', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })

  it('accepts only the three stored values', () => {
    expect(isTheme('system')).toBe(true)
    expect(isTheme('sepia')).toBe(false)
    expect(isTheme(null)).toBe(false)
  })

  it('points every theme-color meta at the active ground', () => {
    document.head.innerHTML =
      '<meta name="theme-color" media="(prefers-color-scheme: light)" content="#000">' +
      '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000">'
    syncThemeColor('dark')
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      expect(meta.content).toBe(THEME_GROUND.dark)
    }
  })
})
