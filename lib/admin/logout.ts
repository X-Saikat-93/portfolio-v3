import 'server-only'

import type { OwnerAccess } from './authorization'
import type { AdminSecurity } from './security'
import { securityDenialHeaders } from './security'

type LogoutDependencies = {
  security: Pick<
    AdminSecurity,
    | 'limitAdminMutation'
    | 'protectOwnerAdminMutation'
    | 'recordAuthenticationDenial'
    | 'recordPrivilegedAction'
  >
  getAccess(): Promise<OwnerAccess>
  signOut(): Promise<Response>
}

function denied(status: 401 | 403 | 503) {
  return new Response(null, {
    status,
    headers: securityDenialHeaders(),
  })
}

export function createAdminLogoutHandler({
  security,
  getAccess,
  signOut,
}: LogoutDependencies) {
  return async function POST(request: Request) {
    const blocked = await security.protectOwnerAdminMutation(request)
    if (blocked) return blocked

    let access: OwnerAccess
    try {
      access = await getAccess()
    } catch {
      return denied(503)
    }
    if (access.status !== 'authorized') {
      security.recordAuthenticationDenial(request)
      return denied(access.status === 'forbidden' ? 403 : 401)
    }

    const limited = await security.limitAdminMutation(
      request,
      access.principal.actorId,
    )
    if (limited) return limited

    let signedOut: Response
    try {
      signedOut = await signOut()
    } catch {
      return denied(503)
    }
    if (!signedOut.ok) {
      security.recordAuthenticationDenial(request)
      return denied(503)
    }

    security.recordPrivilegedAction(
      request,
      'admin_logout.succeeded',
      access.principal.actorId,
    )

    const response = new Response(null, {
      status: 303,
      headers: {
        location: new URL('/en', request.url).toString(),
        'cache-control': 'no-store',
        'referrer-policy': 'no-referrer',
      },
    })

    const headersWithCookies = signedOut.headers as Headers & {
      getSetCookie?: () => string[]
    }
    for (const cookie of headersWithCookies.getSetCookie?.() ?? []) {
      response.headers.append('set-cookie', cookie)
    }

    return response
  }
}
