import 'server-only'

import { headers } from 'next/headers'
import { forbidden, redirect } from 'next/navigation'
import { cache } from 'react'

import { getAuth, getAdminEmail, isBetterAuthConfigured } from '~/lib/auth'

import {
  createOwnerAuthorizer,
  type OwnerPrincipal,
} from './authorization'
import { getAdminSecurity } from './security'

const authorizeOwner = createOwnerAuthorizer({
  getOwnerEmail() {
    return getAdminEmail()
  },
  async getSession() {
    if (!isBetterAuthConfigured()) return null
    return getAuth().api.getSession({ headers: await headers() })
  },
})

export const getOwnerAccess = cache(authorizeOwner)

export async function requireOwnerPage(
  returnBackUrl: string,
): Promise<OwnerPrincipal> {
  const access = await getOwnerAccess()
  if (access.status === 'authorized') return access.principal
  if (access.status === 'forbidden') forbidden()

  redirect(`/admin/login?next=${encodeURIComponent(returnBackUrl)}`)
}

export function getOwnerAdminSecurity() {
  return getAdminSecurity()
}
