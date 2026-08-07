// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GitHubCardBody } from './social-cards'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} />
  ),
}))

afterEach(cleanup)

describe('GitHub hover card', () => {
  it('renders live profile counts when available', () => {
    const { container } = render(
      <GitHubCardBody data={{ user: 'X-Saikat-93', followers: 12, publicRepos: 8 }} />,
    )

    expect(container.textContent).toContain('12')
    expect(container.textContent).toContain('8')
    expect(container.textContent).toContain('followers')
    expect(container.textContent).toContain('public repositories')
  })
})
