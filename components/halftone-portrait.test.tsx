// @vitest-environment jsdom

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { getHalftoneTone, HalftonePortrait } from './halftone-portrait'

const navigation = vi.hoisted(() => ({ pathname: '/' }))

vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
}))

describe('HalftonePortrait', () => {
  it('keeps dark hair visible while retaining highlight contrast', () => {
    const hair = getHalftoneTone('dark', 0.04, 0.2, 1, 0)
    const face = getHalftoneTone('dark', 0.72, 0, 1, 0)

    expect(hair).toBeGreaterThan(0.1)
    expect(face).toBeGreaterThan(hair)
  })

  it('keeps the server-rendered portrait visually empty', () => {
    navigation.pathname = '/en'
    const container = document.createElement('div')
    container.innerHTML = renderToStaticMarkup(
      <HalftonePortrait
        srcLight="/light.jpg"
        srcDark="/dark.jpg"
        alt="Saikat portrait"
        altEn="Saikat portrait"
      />,
    )

    const shell = container.querySelector('[data-halftone]')
    const sources = container.querySelectorAll('img')

    expect(shell?.hasAttribute('data-ready')).toBe(false)
    expect(sources).toHaveLength(2)
    expect(Array.from(sources).every((source) => source.hidden)).toBe(true)
    expect(container.querySelector('canvas')?.getAttribute('aria-label')).toBe('Saikat portrait')
  })
})
