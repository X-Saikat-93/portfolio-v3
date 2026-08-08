'use client'

import { FormEvent, useState } from 'react'

import { authClient } from '~/lib/auth-client'

export function AdminLoginForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)

    const result = await authClient.signIn.email({
      email,
      password,
      rememberMe: true,
    })

    if (result.error) {
      setError('The email or password is not valid.')
      setPending(false)
      return
    }

    window.location.assign(nextPath)
  }

  return (
    <form onSubmit={submit} className="sign-in-sheet enter-swing">
      <div className="sign-in-topline">
        <span>Owner panel / sign-in</span>
        <span>Saikat Das</span>
      </div>

      <div className="sign-in-fields">
        <label className="sign-in-field">
          <span className="sign-in-field-label">Email</span>
          <input
            className="sign-in-input"
            required
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={email}
            autoFocus
            onChange={(event) => {
              setEmail(event.target.value)
              if (error) setError('')
            }}
            placeholder="owner@example.com"
          />
        </label>

        <label className="sign-in-field">
          <span className="sign-in-field-label">Password</span>
          <input
            className="sign-in-input"
            required
            minLength={12}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              if (error) setError('')
            }}
            placeholder="••••••••••••"
          />
        </label>
      </div>

      <div className="sign-in-bottomline">
        <span className="sign-in-note">
          Owner workspace. Sign-in attempts are rate-limited.
        </span>
        <button type="submit" disabled={pending} className="sign-in-submit">
          {pending ? 'Signing in' : 'Sign in'}
          <span aria-hidden>{pending ? '…' : '→'}</span>
        </button>
      </div>

      {error ? (
        <p role="alert" data-state="error" className="sign-in-status">
          {error}
        </p>
      ) : null}
    </form>
  )
}
