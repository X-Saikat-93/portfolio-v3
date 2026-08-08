/** @vitest-environment jsdom */

import type { ReactNode } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const viewTransitionHarness = vi.hoisted(() => ({
  name: undefined as string | undefined,
  share: undefined as string | undefined,
  defaultClass: undefined as string | undefined,
}))

vi.mock('react', async (importOriginal) => {
  const react = await importOriginal<typeof import('react')>()
  return {
    ...react,
    ViewTransition: ({
      children,
      name,
      share,
      default: defaultClass,
    }: {
      children: ReactNode
      name?: string
      share?: string
      default?: string
    }) => {
      Object.assign(viewTransitionHarness, { name, share, defaultClass })
      return <>{children}</>
    },
  }
})

import { PostTitleTransition } from './post-title-transition'

afterEach(() => {
  cleanup()
  Object.assign(viewTransitionHarness, {
    name: undefined,
    share: undefined,
    defaultClass: undefined,
  })
})

describe('PostTitleTransition', () => {
  it('gives a post title a stable shared identity without unrelated crossfades', () => {
    render(
      <PostTitleTransition slug="building-a-product">
        <span>Building a product</span>
      </PostTitleTransition>,
    )

    expect(screen.getByText('Building a product')).toBeTruthy()
    expect(viewTransitionHarness).toEqual({
      name: 'post-title-building-a-product',
      share: 'post-title-morph',
      defaultClass: 'none',
    })
  })
})
