// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ContactForm } from './contact-form'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function fill(message = 'I would like to discuss a product idea.') {
  fireEvent.change(screen.getByLabelText('Your name'), { target: { value: 'Ada Example' } })
  fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'ada@example.com' } })
  fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'A product question' } })
  fireEvent.change(screen.getByLabelText(/^Message/), { target: { value: message } })
}

function form() {
  return screen.getByRole('button', { name: /Send message|Sending|Sent/ }).closest('form')!
}

describe('ContactForm', () => {
  it('sends with Ctrl+Enter, shows sending, then sent and clears the fields', async () => {
    let resolve!: (response: Response) => void
    const fetchMock = vi.fn(() => new Promise<Response>((r) => (resolve = r)))
    vi.stubGlobal('fetch', fetchMock)
    // jsdom has no requestSubmit; submit the form the way the browser would
    HTMLFormElement.prototype.requestSubmit ??= function (this: HTMLFormElement) {
      this.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    }

    render(<ContactForm />)
    fill()
    fireEvent.keyDown(screen.getByLabelText(/^Message/), { key: 'Enter', ctrlKey: true })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toMatchObject({ name: 'Ada Example', website: '' })
    expect(form().dataset.state).toBe('sending')
    expect(screen.getByRole('button', { name: /Sending/ })).toHaveProperty('disabled', true)

    // a second submit while sending is ignored
    fireEvent.submit(form())
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await act(async () => resolve(new Response(null, { status: 201 })))

    expect(form().dataset.state).toBe('sent')
    expect(screen.getByRole('status').textContent).toMatch(/Message received/)
    expect((screen.getByLabelText('Your name') as HTMLInputElement).value).toBe('')
  })

  it('explains a rate limit and returns to idle once the visitor edits', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 429 })))

    render(<ContactForm />)
    fill()
    await act(async () => {
      fireEvent.submit(form())
    })

    expect(screen.getByRole('alert').textContent).toMatch(/a little time/)
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Edited' } })
    expect(form().dataset.state).toBe('idle')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('reports a network failure', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))))

    render(<ContactForm />)
    fill()
    await act(async () => {
      fireEvent.submit(form())
    })

    expect(screen.getByRole('alert').textContent).toMatch(/could not be sent/)
  })

  it('counts down only when the message nears its limit', () => {
    render(<ContactForm />)
    fill('short note here')
    expect(screen.queryByText(/characters left/)).toBeNull()

    fill('x'.repeat(4_600))
    expect(screen.getByText('400 characters left')).toBeTruthy()
  })
})
