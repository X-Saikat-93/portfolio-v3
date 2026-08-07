import 'server-only'

import {
  getOwnerAccess,
  getOwnerAdminSecurity,
} from './server'
import { securityDenialHeaders } from './security'

export async function ownerRequest(
  request: Request,
  { mutation = false }: { mutation?: boolean } = {},
) {
  const security = getOwnerAdminSecurity()

  if (mutation) {
    const blocked = await security.protectOwnerAdminMutation(request)
    if (blocked) return { response: blocked } as const
  }

  let access: Awaited<ReturnType<typeof getOwnerAccess>>
  try {
    access = await getOwnerAccess()
  } catch {
    return {
      response: new Response(null, { status: 503, headers: securityDenialHeaders() }),
    } as const
  }

  if (access.status !== 'authorized') {
    security.recordAuthenticationDenial(request)
    return {
      response: new Response(null, {
        status: access.status === 'forbidden' ? 403 : 401,
        headers: securityDenialHeaders(),
      }),
    } as const
  }

  if (mutation) {
    const limited = await security.limitAdminMutation(request, access.principal.actorId)
    if (limited) return { response: limited } as const
  }

  return { principal: access.principal, security } as const
}
