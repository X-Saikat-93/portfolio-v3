import { attachDatabasePool } from '@vercel/functions'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

let database: ReturnType<typeof createDatabase> | undefined

function createDatabase() {
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) throw new Error('DATABASE_URL is not configured')
  const pool = new Pool({ connectionString })
  attachDatabasePool(pool)
  return drizzle({ client: pool })
}

export function getDatabase() {
  database ??= createDatabase()
  return database
}
