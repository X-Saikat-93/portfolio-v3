/** @vitest-environment jsdom */

import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const viewTransitionHarness = vi.hoisted(() => ({
  defaultClass: undefined as string | undefined,
}))

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>()
  return {
    ...react,
    ViewTransition: ({
      children,
      default: defaultClass,
    }: {
      children: ReactNode
      default?: string
    }) => {
      viewTransitionHarness.defaultClass = defaultClass
      return <>{children}</>
    },
  }
})

import { RouteViewTransition } from './route-motion-controller'

afterEach(() => {
  cleanup()
  viewTransitionHarness.defaultClass = undefined
})

describe('RouteViewTransition', () => {
  it('isolates route content in the shared transition class', () => {
    render(
      <RouteViewTransition>
        <article>Destination page</article>
      </RouteViewTransition>,
    )

    expect(screen.getByText('Destination page')).toBeTruthy()
    expect(viewTransitionHarness.defaultClass).toBe('route-content')
  })
})
