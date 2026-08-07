import { afterAll, beforeAll, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const pool = { end: vi.fn() }
  const transaction = vi.fn(
    async (callback: (transaction: { driver: string }) => Promise<unknown>) =>
      callback({ driver: 'transaction-capable' }),
  )
  return {
    attachDatabasePool: vi.fn(),
    pool,
    transaction,
  }
})

vi.mock('server-only', () => ({}))

vi.mock('@vercel/functions', () => ({
  attachDatabasePool: mocks.attachDatabasePool,
}))

vi.mock('pg', () => ({
  Pool: class Pool {
    constructor() {
      return mocks.pool
    }
  },
}))

vi.mock('drizzle-orm/node-postgres', () => ({
  drizzle: () => ({ transaction: mocks.transaction }),
}))

import { getDatabase } from './index'

const previousDatabaseUrl = process.env.DATABASE_URL

beforeAll(() => {
  process.env.DATABASE_URL = 'postgresql://runtime:runtime@localhost:5432/saikat'
})

afterAll(() => {
  if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL
  else process.env.DATABASE_URL = previousDatabaseUrl
})

it('provides interactive transactions through the shared database client', async () => {
  const result = await getDatabase().transaction(
    async (transaction) => transaction,
  )

  expect(result).toEqual({ driver: 'transaction-capable' })
  expect(mocks.attachDatabasePool).toHaveBeenCalledWith(mocks.pool)
})
