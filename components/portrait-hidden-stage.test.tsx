// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PortraitHiddenStage } from './portrait-hidden-stage'

function setMediaPreference(initialReducedMotion: boolean) {
  let reducedMotion = initialReducedMotion
  const listeners = new Set<() => void>()

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      get matches() {
        return query === '(prefers-reduced-motion: reduce)' && reducedMotion
      },
      media: query,
      onchange: null,
      addEventListener: vi.fn((_type: string, listener: () => void) => listeners.add(listener)),
      removeEventListener: vi.fn((_type: string, listener: () => void) =>
        listeners.delete(listener),
      ),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )

  return {
    setReducedMotion(value: boolean) {
      reducedMotion = value
      listeners.forEach((listener) => listener())
    },
  }
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('PortraitHiddenStage', () => {
  it('renders a lightweight topographic halo without a shader', () => {
    setMediaPreference(false)

    render(
      <PortraitHiddenStage label="Reveal circular field">
        <span>Portrait</span>
      </PortraitHiddenStage>,
    )

    const trigger = screen.getByRole('button', { name: 'Reveal circular field' })
    const contours = document.querySelector('[data-hidden-stage-contours]')

    expect(contours?.querySelectorAll('path')).toHaveLength(9)
    expect(contours?.querySelector('circle')).toBeNull()
    expect(document.querySelector('[data-shader-stage]')).toBeNull()
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-active')).toBe('false')
  })

  it('reveals on mouse hover and releases on pointer leave', () => {
    setMediaPreference(false)

    render(
      <PortraitHiddenStage label="Reveal circular field">
        <span>Portrait</span>
      </PortraitHiddenStage>,
    )

    const trigger = screen.getByRole('button', { name: 'Reveal circular field' })

    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })

    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-active')).toBe('true')
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-motion')).toBe('true')

    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' })
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-active')).toBe('false')
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-motion')).toBe('false')
  })

  it('keeps reduced-motion reveals static', () => {
    setMediaPreference(true)

    render(
      <PortraitHiddenStage label="Reveal circular field">
        <span>Portrait</span>
      </PortraitHiddenStage>,
    )

    const trigger = screen.getByRole('button', { name: 'Reveal circular field' })
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })

    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-active')).toBe('true')
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-motion')).toBe('false')
  })

  it('keeps the first touch reveal open when touch focus arrives before pointerup', () => {
    vi.useFakeTimers()
    setMediaPreference(false)

    render(
      <PortraitHiddenStage label="Reveal circular field">
        <span>Portrait</span>
      </PortraitHiddenStage>,
    )

    const trigger = screen.getByRole('button', { name: 'Reveal circular field' })
    fireEvent.pointerDown(trigger, { pointerType: 'touch' })
    fireEvent.focus(trigger)
    fireEvent.pointerUp(trigger, { pointerType: 'touch' })

    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-active')).toBe('true')
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-motion')).toBe('true')

    act(() => vi.advanceTimersByTime(2600))

    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-active')).toBe('false')
  })

  it('keeps keyboard focus composed with pointer hover', () => {
    setMediaPreference(false)

    render(
      <PortraitHiddenStage label="Reveal circular field">
        <span>Portrait</span>
      </PortraitHiddenStage>,
    )

    const trigger = screen.getByRole('button', { name: 'Reveal circular field' })
    fireEvent.focus(trigger)

    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-active')).toBe('true')
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-motion')).toBe('false')
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-motion')).toBe('true')

    fireEvent.pointerLeave(trigger, { pointerType: 'mouse' })
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-active')).toBe('true')
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-motion')).toBe('false')

    fireEvent.blur(trigger)
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-active')).toBe('false')
  })

  it('turns off motion when the reduced-motion preference changes', () => {
    const preference = setMediaPreference(false)

    render(
      <PortraitHiddenStage label="Reveal circular field">
        <span>Portrait</span>
      </PortraitHiddenStage>,
    )

    const trigger = screen.getByRole('button', { name: 'Reveal circular field' })
    fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-motion')).toBe('true')

    act(() => preference.setReducedMotion(true))

    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-active')).toBe('true')
    expect(trigger.closest('[data-portrait-stage]')?.getAttribute('data-motion')).toBe('false')
  })
})
