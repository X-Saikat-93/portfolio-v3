import { headers } from 'next/headers'

import { createAdminLogoutHandler } from '~/lib/admin/logout'
import { getAuth } from '~/lib/auth'
import {
  getOwnerAccess,
  getOwnerAdminSecurity,
} from '~/lib/admin/server'

export async function POST(request: Request) {
  return createAdminLogoutHandler({
    security: getOwnerAdminSecurity(),
    getAccess: getOwnerAccess,
    async signOut() {
      return getAuth().api.signOut({
        headers: await headers(),
        asResponse: true,
      })
    },
  })(request)
}
