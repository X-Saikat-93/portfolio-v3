import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { createAdminLogoutHandler } from './logout'
import type { AdminSecurity } from './security'

function request(origin = 'https://xsaikat.vercel.app') {
  return new Request('https://xsaikat.vercel.app/api/admin/auth/logout', {
    method: 'POST',
    headers: {
      origin,
      'sec-fetch-site':
        origin === 'https://xsaikat.vercel.app' ? 'same-origin' : 'cross-site',
    },
  })
}

function fixture(input?: {
  access?:
    | { status: 'authorized'; principal: { id: string; actorId: string } }
    | { status: 'forbidden' }
    | { status: 'unauthenticated' }
  blocked?: Response | null
  getAccess?: () => Promise<never>
  signOut?: () => Promise<Response>
}) {
  const recordPrivilegedAction = vi.fn()
  const protectOwnerAdminMutation = vi.fn(async () => input?.blocked ?? null)
  const signOut = vi.fn(
    input?.signOut ?? (async () => new Response(null, { status: 200 })),
  )
  const handler = createAdminLogoutHandler({
    security: {
      protectOwnerAdminMutation,
      recordPrivilegedAction,
    } as Pick<AdminSecurity, 'protectOwnerAdminMutation' | 'recordPrivilegedAction'>,
    async getAccess() {
      if (input?.getAccess) return input.getAccess()
      return input?.access ?? {
        status: 'authorized',
        principal: { id: 'owner@example.com', actorId: 'user_owner' },
      }
    },
    signOut,
  })
  return { handler, protectOwnerAdminMutation, recordPrivilegedAction, signOut }
}

describe('owner admin logout', () => {
  it('rejects cross-origin requests before signing out', async () => {
    const blocked = new Response(null, { status: 403 })
    const { handler, signOut } = fixture({ blocked })

    expect((await handler(request('https://attacker.example'))).status).toBe(403)
    expect(signOut).not.toHaveBeenCalled()
  })

  it('redirects to the English site with Better Auth cookies', async () => {
    const { handler, signOut, recordPrivilegedAction } = fixture({
      signOut: async () =>
        new Response(null, {
          status: 200,
          headers: { 'set-cookie': 'better-auth.session_token=; Max-Age=0' },
        }),
    })

    const response = await handler(request())

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('https://xsaikat.vercel.app/en')
    expect(response.headers.getSetCookie()).toEqual([
      'better-auth.session_token=; Max-Age=0',
    ])
    expect(signOut).toHaveBeenCalledOnce()
    expect(recordPrivilegedAction).toHaveBeenCalledWith(
      expect.any(Request),
      'admin_logout.succeeded',
      'user_owner',
    )
  })

  it.each([
    ['sign-out errors', { signOut: async () => new Response(null, { status: 503 }) }],
    ['sign-out throws', { signOut: async () => Promise.reject(new Error('db down')) }],
    ['session lookup throws', { getAccess: async () => Promise.reject(new Error('db down')) }],
    ['session already ended', { access: { status: 'unauthenticated' as const } }],
  ])('still signs the browser out when %s', async (_case, input) => {
    const response = await fixture(input).handler(request())

    expect(response.status).toBe(303)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.getSetCookie()).toContain(
      '__Secure-better-auth.session_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
    )
  })
})
