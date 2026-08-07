import { APIError, createAuthMiddleware } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { betterAuth } from 'better-auth/minimal'

import { getDatabase } from '../db/runtime.ts'
import {
  authAccount,
  authSession,
  authUser,
  authVerification,
} from '../db/schema.ts'

export function getAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() || null
}

export function isBetterAuthConfigured() {
  const secret = process.env.BETTER_AUTH_SECRET?.trim() || ''
  return Boolean(
    secret.length >= 32 &&
      process.env.BETTER_AUTH_URL?.trim() &&
      process.env.DATABASE_URL?.trim() &&
      getAdminEmail(),
  )
}

function isBootstrapRequest(headers: Headers) {
  const configuredToken = process.env.BETTER_AUTH_BOOTSTRAP_TOKEN?.trim()
  return Boolean(
    process.env.BETTER_AUTH_BOOTSTRAP_MODE === '1' &&
      configuredToken &&
      headers.get('x-saikat-bootstrap-token') === configuredToken,
  )
}

export function createAuth() {
  const trustedOrigins = [
    process.env.BETTER_AUTH_URL?.trim(),
    process.env.PUBLIC_SITE_URL?.trim(),
  ].filter((origin): origin is string => Boolean(origin))

  return betterAuth({
    database: drizzleAdapter(getDatabase(), {
      provider: 'pg',
      schema: {
        user: authUser,
        session: authSession,
        account: authAccount,
        verification: authVerification,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // The running site has no public registration. The private bootstrap
      // command temporarily enables this endpoint in its own process.
      disableSignUp: process.env.BETTER_AUTH_BOOTSTRAP_MODE !== '1',
      minPasswordLength: 12,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
    },
    trustedOrigins,
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
    },
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== '/sign-up/email') return

        const body = ctx.body as { email?: unknown } | undefined
        const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
        if (
          !isBootstrapRequest(ctx.headers ?? new Headers()) ||
          !getAdminEmail() ||
          email !== getAdminEmail()
        ) {
          throw new APIError('BAD_REQUEST', { message: 'Sign up is disabled' })
        }
      }),
    },
    telemetry: { enabled: false },
  })
}
