// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { AmbientBackground } from './ambient-background'

afterEach(cleanup)

describe('AmbientBackground', () => {
  it('renders a single inert fibre layer', () => {
    const { container } = render(<AmbientBackground />)

    expect(container.children).toHaveLength(1)
    expect(container.firstElementChild?.className).toBe('paper-fibre')
    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe('true')
  })
})
