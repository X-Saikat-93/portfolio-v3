// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CloudinaryAvatar } from './cloudinary-image'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} />
  ),
}))

afterEach(cleanup)

describe('Cloudinary avatar', () => {
  it('keeps the avatar visible when Cloudinary delivery is unavailable', () => {
    const { container } = render(<CloudinaryAvatar alt="Saikat Das" />)

    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      '/images/saikat-avatar-preview.webp',
    )
  })
})
