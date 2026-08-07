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
    <form onSubmit={submit} className="flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Email</span>
        <input
          required
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10 rounded-md border border-border bg-background px-3 outline-none focus:border-foreground"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium">Password</span>
        <input
          required
          minLength={12}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-10 rounded-md border border-border bg-background px-3 outline-none focus:border-foreground"
        />
      </label>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-10 rounded-md bg-foreground px-4 text-sm text-background disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
