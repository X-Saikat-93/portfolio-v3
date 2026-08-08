// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AdminLoginForm } from './admin-login-form'

const signInEmail = vi.fn()

vi.mock('~/lib/auth-client', () => ({
  authClient: {
    signIn: {
      email: (...args: unknown[]) => signInEmail(...args),
    },
  },
}))

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: { assign: vi.fn() },
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const VALID_EMAIL = 'owner@example.com'
const VALID_PASSWORD = 'correct-horse-battery'

function fillCredentials() {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: VALID_EMAIL },
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: VALID_PASSWORD },
  })
}

describe('AdminLoginForm', () => {
  it('renders the owner sign-in sheet with labeled fields and a submit action', () => {
    render(<AdminLoginForm nextPath="/admin" />)

    expect(screen.getByLabelText('Email')).toBeTruthy()
    expect(screen.getByLabelText('Password')).toBeTruthy()
    expect(screen.getByText('Owner panel / sign-in')).toBeTruthy()
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeTruthy()
  })

  it('signs in with the entered credentials and redirects to the next path', async () => {
    signInEmail.mockResolvedValue({ error: null })
    render(<AdminLoginForm nextPath="/admin/media" />)

    fillCredentials()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(signInEmail).toHaveBeenCalledWith({
        email: VALID_EMAIL,
        password: VALID_PASSWORD,
        rememberMe: true,
      })
    })
    await waitFor(() => {
      expect(window.location.assign).toHaveBeenCalledWith('/admin/media')
    })
  })

  it('announces a rejection with an alert and stays on the page', async () => {
    signInEmail.mockResolvedValue({ error: { message: 'invalid' } })
    render(<AdminLoginForm nextPath="/admin" />)

    fillCredentials()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('The email or password is not valid.')
    expect(window.location.assign).not.toHaveBeenCalled()
  })

  it('clears a stale error as soon as the owner edits a field', async () => {
    signInEmail.mockResolvedValue({ error: { message: 'invalid' } })
    render(<AdminLoginForm nextPath="/admin" />)

    fillCredentials()
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByRole('alert')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'a-better-password' },
    })
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('disables the action while a sign-in is in flight', async () => {
    signInEmail.mockImplementation(
      () => new Promise(() => undefined),
    )
    render(<AdminLoginForm nextPath="/admin" />)

    fillCredentials()
    const button = screen.getByRole('button', {
      name: /sign in/i,
    }) as HTMLButtonElement

    fireEvent.click(button)
    await waitFor(() => expect(button.disabled).toBe(true))
    expect(button.textContent).toContain('Signing in')
  })
})
