import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))
vi.mock('~/db', () => ({ getDatabase: vi.fn() }))

const { contactRetentionCutoff } = await import('./repository')

describe('contactRetentionCutoff', () => {
  it('keeps contact messages for 36 months', () => {
    expect(contactRetentionCutoff(new Date('2026-11-01T10:00:00.000Z')).toISOString()).toBe(
      '2023-11-01T10:00:00.000Z',
    )
  })
})
