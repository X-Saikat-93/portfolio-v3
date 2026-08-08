// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GitHubCardBody, LinkedInCardBody } from './social-cards'

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

describe('LinkedIn hover card', () => {
  it('renders the profile head, role register, and open-to-remote badge', () => {
    const { container } = render(<LinkedInCardBody />)

    expect(container.textContent).toContain('Saikat Das')
    expect(container.textContent).toContain('Product Engineer · India')
    expect(container.textContent).toContain('Software Developer')
    expect(container.textContent).toContain('Human Before Resource')
    expect(container.textContent).toContain('Open to Remote')
  })
})
