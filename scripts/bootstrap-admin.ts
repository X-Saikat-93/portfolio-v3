import { randomBytes } from 'node:crypto'

import { createAuth } from '../lib/auth-core.ts'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD?.trim()

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running auth:bootstrap.')
  process.exitCode = 1
} else {
  const token = randomBytes(32).toString('hex')
  process.env.BETTER_AUTH_BOOTSTRAP_MODE = '1'
  process.env.BETTER_AUTH_BOOTSTRAP_TOKEN = token

  try {
    const auth = createAuth()
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: process.env.ADMIN_NAME?.trim() || 'Saikat Das',
      },
      headers: { 'x-saikat-bootstrap-token': token },
    })

    console.log(`Better Auth owner created: ${result.user.email}`)
    console.log('The bootstrap gate existed only inside this process and is now gone.')
  } catch (error) {
    console.error(
      error instanceof Error ? error.message : 'Unable to create the Better Auth owner.',
    )
    process.exitCode = 1
  }
}
