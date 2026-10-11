/** @vitest-environment jsdom */

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { HomeBookshelf, type HomeBookshelfBook } from './home-bookshelf'

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} />
  ),
}))

const books: HomeBookshelfBook[] = [
  {
    id: 'one',
    title: 'First Book',
    creator: 'First Author',
    url: 'https://example.com/first',
    imagePublicId: 'portfolio/book-covers/first',
  },
  {
    id: 'two',
    title: 'Second Book',
    creator: 'Second Author',
    url: 'https://example.com/second',
    imagePublicId: 'portfolio/book-covers/second',
  },
  {
    id: 'three',
    title: 'Third Book',
    creator: 'Third Author',
    url: 'https://example.com/third',
    imagePublicId: 'portfolio/book-covers/third',
  },
]

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('HomeBookshelf', () => {
  it('renders actual cover images and opens a selected volume', () => {
    render(<HomeBookshelf books={books} allBooksHref="/en/books" />)

    expect(screen.getByRole('img', { name: 'First Book cover artwork' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Second Book cover artwork' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Show Second Book' }))

    expect(screen.getByRole('button', { name: 'Show Second Book' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Second Author')).toBeTruthy()
  })

  it('renders every book as an individually selectable mobile entry', () => {
    const { container } = render(<HomeBookshelf books={books} allBooksHref="/en/books" />)
    const mobileBooks = container.querySelectorAll<HTMLButtonElement>(
      '.home-bookshelf-mobile-book',
    )

    expect(mobileBooks).toHaveLength(books.length)
    expect(mobileBooks[1].getAttribute('aria-label')).toBe('Select Second Book')

    fireEvent.click(mobileBooks[1])

    expect(mobileBooks[1].getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByText('Second Author')).toBeTruthy()
  })

  it('moves through the shelf with arrow keys', () => {
    render(<HomeBookshelf books={books} allBooksHref="/en/books" />)

    const first = screen.getByRole('button', { name: 'Show First Book' })
    first.focus()
    fireEvent.keyDown(first, { key: 'ArrowRight' })

    const second = screen.getByRole('button', { name: 'Show Second Book' })
    expect(second.getAttribute('aria-pressed')).toBe('true')
    expect(document.activeElement).toBe(second)
  })

  it('waits for deliberate pointer movement instead of reacting to incidental hover', () => {
    vi.useFakeTimers()
    render(<HomeBookshelf books={books} allBooksHref="/en/books" />)

    const first = screen.getByRole('button', { name: 'Show First Book' })
    const second = screen.getByRole('button', { name: 'Show Second Book' })

    fireEvent.mouseEnter(second)
    expect(first.getAttribute('aria-pressed')).toBe('true')

    fireEvent.pointerMove(second)
    expect(first.getAttribute('aria-pressed')).toBe('true')

    act(() => vi.advanceTimersByTime(179))
    expect(first.getAttribute('aria-pressed')).toBe('true')

    act(() => vi.advanceTimersByTime(1))
    expect(second.getAttribute('aria-pressed')).toBe('true')
  })

  it('cancels a pending selection when the pointer leaves the book', () => {
    vi.useFakeTimers()
    render(<HomeBookshelf books={books} allBooksHref="/en/books" />)

    const first = screen.getByRole('button', { name: 'Show First Book' })
    const second = screen.getByRole('button', { name: 'Show Second Book' })
    const third = screen.getByRole('button', { name: 'Show Third Book' })

    fireEvent.pointerMove(second)
    fireEvent.pointerLeave(second)
    fireEvent.pointerMove(third)

    act(() => vi.advanceTimersByTime(180))
    expect(first.getAttribute('aria-pressed')).toBe('false')
    expect(second.getAttribute('aria-pressed')).toBe('false')
    expect(third.getAttribute('aria-pressed')).toBe('true')
  })
})
