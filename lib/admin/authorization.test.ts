import { describe, expect, it } from 'vitest'

import { createOwnerAuthorizer } from './authorization'

function session(email = 'owner@example.com', id = 'user_owner') {
  return { user: { id, email } }
}

describe('owner authorization', () => {
  it('requires an active Better Auth session', async () => {
    const authorize = createOwnerAuthorizer({
      getOwnerEmail: () => 'owner@example.com',
      async getSession() {
        return null
      },
    })

    await expect(authorize()).resolves.toEqual({ status: 'unauthenticated' })
  })

  it('fails closed when the owner email is not configured', async () => {
    const authorize = createOwnerAuthorizer({
      getOwnerEmail: () => null,
      async getSession() {
        return session()
      },
    })

    await expect(authorize()).resolves.toEqual({ status: 'forbidden' })
  })

  it('denies an authenticated non-owner', async () => {
    const authorize = createOwnerAuthorizer({
      getOwnerEmail: () => 'owner@example.com',
      async getSession() {
        return session('visitor@example.com', 'user_visitor')
      },
    })

    await expect(authorize()).resolves.toEqual({ status: 'forbidden' })
  })

  it('authorizes the exact owner email case-insensitively', async () => {
    const authorize = createOwnerAuthorizer({
      getOwnerEmail: () => 'OWNER@example.com',
      async getSession() {
        return session('owner@EXAMPLE.com')
      },
    })

    await expect(authorize()).resolves.toEqual({
      status: 'authorized',
      principal: { id: 'owner@example.com', actorId: 'user_owner' },
    })
  })
})
