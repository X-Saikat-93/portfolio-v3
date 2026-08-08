import { describe, expect, it } from 'vitest'

import { normalizeDatabaseUrl } from './connection-string'

describe('normalizeDatabaseUrl', () => {
  it('makes legacy verified SSL modes explicit', () => {
    expect(
      normalizeDatabaseUrl('postgresql://user:pass@db.example/app?sslmode=require'),
    ).toBe('postgresql://user:pass@db.example/app?sslmode=verify-full')
  })

  it('keeps explicit and unrelated connection parameters intact', () => {
    const normalized = normalizeDatabaseUrl(
      'postgresql://user:pass@db.example/app?sslmode=verify-full&channel_binding=require',
    )

    expect(normalized).toContain('sslmode=verify-full')
    expect(normalized).toContain('channel_binding=require')
  })
})
