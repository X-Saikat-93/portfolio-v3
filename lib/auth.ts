import 'server-only'

import { createAuth, getAdminEmail, isBetterAuthConfigured } from './auth-core'

let authInstance: ReturnType<typeof createAuth> | undefined

export function getAuth() {
  if (!isBetterAuthConfigured()) {
    throw new Error('Better Auth is not configured')
  }

  authInstance ??= createAuth()
  return authInstance
}

export { getAdminEmail, isBetterAuthConfigured }
