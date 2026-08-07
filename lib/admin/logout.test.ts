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
  limited?: Response | null
  signOut?: () => Promise<Response>
}) {
  const recordAuthenticationDenial = vi.fn()
  const recordPrivilegedAction = vi.fn()
  const limitAdminMutation = vi.fn(async () => input?.limited ?? null)
  const protectOwnerAdminMutation = vi.fn(async () => input?.blocked ?? null)
  const signOut = vi.fn(
    input?.signOut ?? (async () => new Response(null, { status: 200 })),
  )
  const handler = createAdminLogoutHandler({
    security: {
      limitAdminMutation,
      protectOwnerAdminMutation,
      recordAuthenticationDenial,
      recordPrivilegedAction,
    } as Pick<
      AdminSecurity,
      | 'limitAdminMutation'
      | 'protectOwnerAdminMutation'
      | 'recordAuthenticationDenial'
      | 'recordPrivilegedAction'
    >,
    async getAccess() {
      if (input?.getAccess) return input.getAccess()
      return input?.access ?? {
        status: 'authorized',
        principal: { id: 'owner@example.com', actorId: 'user_owner' },
      }
    },
    signOut,
  })
  return {
    handler,
    limitAdminMutation,
    protectOwnerAdminMutation,
    recordAuthenticationDenial,
    recordPrivilegedAction,
    signOut,
  }
}

describe('owner admin logout', () => {
  it('rejects cross-origin requests before authentication', async () => {
    const blocked = new Response(null, { status: 403 })
    const { handler, limitAdminMutation, signOut } = fixture({ blocked })

    expect((await handler(request('https://attacker.example'))).status).toBe(403)
    expect(limitAdminMutation).not.toHaveBeenCalled()
    expect(signOut).not.toHaveBeenCalled()
  })

  it.each([
    [{ status: 'unauthenticated' as const }, 401],
    [{ status: 'forbidden' as const }, 403],
  ])('returns the correct denial for %o', async (access, status) => {
    const { handler, recordAuthenticationDenial, signOut } = fixture({ access })

    expect((await handler(request())).status).toBe(status)
    expect(recordAuthenticationDenial).toHaveBeenCalledOnce()
    expect(signOut).not.toHaveBeenCalled()
  })

  it('returns the limiter response without signing out', async () => {
    const limited = new Response(null, { status: 429 })
    const { handler, limitAdminMutation, signOut } = fixture({ limited })

    expect((await handler(request())).status).toBe(429)
    expect(limitAdminMutation).toHaveBeenCalledWith(
      expect.any(Request),
      'user_owner',
    )
    expect(signOut).not.toHaveBeenCalled()
  })

  it('fails closed when Better Auth sign-out fails', async () => {
    const { handler, recordPrivilegedAction } = fixture({
      signOut: async () => new Response(null, { status: 503 }),
    })

    const response = await handler(request())

    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(recordPrivilegedAction).not.toHaveBeenCalled()
  })

  it('redirects to the English site after signing out', async () => {
    const { handler, signOut, recordPrivilegedAction } = fixture()

    const response = await handler(request())

    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('https://xsaikat.vercel.app/en')
    expect(signOut).toHaveBeenCalledOnce()
    expect(recordPrivilegedAction).toHaveBeenCalledWith(
      expect.any(Request),
      'admin_logout.succeeded',
      'user_owner',
    )
  })

  it('fails closed when the Better Auth lookup fails', async () => {
    const { handler, recordPrivilegedAction, signOut } = fixture({
      getAccess: async () => {
        throw new Error('private auth error')
      },
    })

    const response = await handler(request())

    expect(response.status).toBe(503)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(recordPrivilegedAction).not.toHaveBeenCalled()
    expect(signOut).not.toHaveBeenCalled()
  })
})
