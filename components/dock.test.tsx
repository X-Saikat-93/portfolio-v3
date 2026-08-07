// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DockFallback } from './dock'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} />
  ),
}))
afterEach(cleanup)

describe('DockFallback', () => {
  it('keeps the English dock shell useful while route state resolves', () => {
    const entry = {
      locale: 'en' as const,
      label: 'Main navigation',
      home: '/en',
      writing: '/en/blog',
    }
    render(<DockFallback locale={entry.locale} />)

    const navigation = screen.getByRole('navigation', { name: entry.label })
    expect(navigation.getAttribute('aria-busy')).toBe('true')
    expect(navigation.style.viewTransitionName).toBe('site-dock')
    expect(screen.getByRole('link', { name: /首页|Home/ }).getAttribute('href')).toBe(
      entry.home,
    )
    expect(
      screen.getByRole('link', { name: /写作|Writing/ }).getAttribute('href'),
    ).toBe(entry.writing)
    expect((screen.getByRole('button') as HTMLButtonElement).disabled).toBe(true)
  })
})
