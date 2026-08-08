import { defineConfig } from 'drizzle-kit'

import { normalizeDatabaseUrl } from './db/connection-string'

const databaseUrl =
  process.env.MIGRATION_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim() || ''

export default defineConfig({
  dialect: 'postgresql',
  schema: './db/schema.ts',
  out: './db/migrations',
  dbCredentials: {
    url: databaseUrl ? normalizeDatabaseUrl(databaseUrl) : '',
  },
})
