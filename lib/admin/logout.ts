import 'server-only'

import type { OwnerAccess } from './authorization'
import type { AdminSecurity } from './security'

type LogoutDependencies = {
  security: Pick<
    AdminSecurity,
    'protectOwnerAdminMutation' | 'recordPrivilegedAction'
  >
  getAccess(): Promise<OwnerAccess>
  signOut(): Promise<Response>
}

// Better Auth's default cookie names; expired directly when its sign-out
// cannot answer, so the browser never keeps a session the owner meant to end.
const authCookieNames = [
  'better-auth.session_token',
  'better-auth.session_data',
  'better-auth.dont_remember',
]

function expiredAuthCookies() {
  return authCookieNames.flatMap((name) => [
    `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
    `__Secure-${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
  ])
}

// Signing out only lowers privilege, so it is never rate limited or refused
// for a stale session: any same-origin POST ends at the public site with the
// session cookies cleared.
export function createAdminLogoutHandler({
  security,
  getAccess,
  signOut,
}: LogoutDependencies) {
  return async function POST(request: Request) {
    const blocked = await security.protectOwnerAdminMutation(request)
    if (blocked) return blocked

    const access = await getAccess().catch(() => null)

    let cookies = expiredAuthCookies()
    try {
      const signedOut = await signOut()
      const fromAuth = signedOut.ok ? signedOut.headers.getSetCookie() : []
      if (fromAuth.length) cookies = fromAuth
    } catch {
      // Fall through with the locally expired cookies.
    }

    if (access?.status === 'authorized') {
      security.recordPrivilegedAction(
        request,
        'admin_logout.succeeded',
        access.principal.actorId,
      )
    }

    const response = new Response(null, {
      status: 303,
      headers: {
        location: new URL('/en', request.url).toString(),
        'cache-control': 'no-store',
        'referrer-policy': 'no-referrer',
      },
    })
    for (const cookie of cookies) response.headers.append('set-cookie', cookie)

    return response
  }
}
