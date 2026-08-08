// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDockVisibility } from '~/hooks/use-dock-visibility'

function Harness() {
  const { hidden } = useDockVisibility()

  return <output data-testid="dock-state">{hidden ? 'hidden' : 'visible'}</output>
}

let frameCallbacks: FrameRequestCallback[]

function scrollTo(value: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value,
  })
  window.dispatchEvent(new Event('scroll'))
  frameCallbacks.shift()?.(0)
}

beforeEach(() => {
  frameCallbacks = []
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frameCallbacks.push(callback)
    return frameCallbacks.length
  })
  vi.stubGlobal('cancelAnimationFrame', vi.fn())
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value: 0,
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useDockVisibility', () => {
  it('hides the dock on downward scroll and restores it on upward scroll', () => {
    render(<Harness />)

    act(() => scrollTo(160))
    expect(screen.getByTestId('dock-state').textContent).toBe('hidden')

    act(() => scrollTo(80))
    expect(screen.getByTestId('dock-state').textContent).toBe('visible')

    act(() => scrollTo(0))
    expect(screen.getByTestId('dock-state').textContent).toBe('visible')
  })
})
