// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { setShortcutsEnabled } from '~/lib/shortcuts'

import { useDockShortcuts } from './use-dock-shortcuts'

const push = vi.fn()
const playDockSound = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('~/lib/sound', () => ({
  playDockSound: () => playDockSound(),
}))

function Harness({
  activeHref = '/' as string | undefined,
  onNavigate,
  ownerAdmin,
}: {
  activeHref?: string | undefined
  onNavigate?: (href: string, keyboardInitiated: boolean) => void
  ownerAdmin?: boolean
}) {
  useDockShortcuts({ locale: 'en', activeHref, onNavigate, ownerAdmin })
  return null
}

function keydown(key: string, target: HTMLElement = document.body, init: KeyboardEventInit = {}) {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init }))
}

afterEach(() => {
  cleanup()
  push.mockClear()
  playDockSound.mockClear()
  setShortcutsEnabled(true)
  localStorage.clear()
})

describe('useDockShortcuts', () => {
  it('navigates on a single letter', () => {
    const onNavigate = vi.fn()
    render(<Harness activeHref="/blog" onNavigate={onNavigate} />)

    keydown('h')

    expect(onNavigate).toHaveBeenCalledWith('/', true)
    expect(playDockSound).toHaveBeenCalledOnce()
    expect(push).toHaveBeenCalledWith('/en')
  })

  it.each([
    { key: 'w', href: '/en/blog' },
    { key: 'p', href: '/en/photos' },
    { key: 'j', href: '/en/projects' },
    { key: 'P', href: '/en/photos' },
  ] as const)('maps $key to $href', ({ key, href }) => {
    render(<Harness />)

    keydown(key)

    expect(push).toHaveBeenCalledWith(href)
  })

  it('ignores letters typed into fields', () => {
    render(<Harness />)
    const input = document.createElement('input')
    document.body.append(input)

    keydown('p', input)

    expect(push).not.toHaveBeenCalled()
    input.remove()
  })

  it('ignores modified and repeated keys', () => {
    render(<Harness />)

    keydown('p', document.body, { shiftKey: true })
    keydown('p', document.body, { ctrlKey: true })
    keydown('p', document.body, { repeat: true })

    expect(push).not.toHaveBeenCalled()
  })

  it('does nothing once shortcuts are switched off', () => {
    setShortcutsEnabled(false)
    render(<Harness />)

    keydown('p')

    expect(push).not.toHaveBeenCalled()
  })

  it('skips the dock sound when already on the target route', () => {
    render(<Harness activeHref="/projects" />)

    keydown('j')

    expect(push).toHaveBeenCalledWith('/en/projects')
    expect(playDockSound).not.toHaveBeenCalled()
  })

  it('keeps D inert until the owner probe confirms', () => {
    render(<Harness />)

    keydown('d')

    expect(push).not.toHaveBeenCalled()
  })

  it('sends the confirmed owner to /admin with D, unlocalized', () => {
    const onNavigate = vi.fn()
    render(<Harness onNavigate={onNavigate} ownerAdmin />)

    keydown('d')

    expect(onNavigate).toHaveBeenCalledWith('/admin', true)
    expect(push).toHaveBeenCalledWith('/admin')
  })
})
