import { describe, expect, it, vi } from 'vitest'

vi.mock('~/db/runtime', () => ({ getDatabase: vi.fn() }))

import { createPublishedSlugCheck } from './published-slugs'

function clock(start = 0) {
  let time = start
  return { now: () => time, advance: (ms: number) => void (time += ms) }
}

describe('published blog slug check', () => {
  it('answers from one load until a miss outlives the refresh window', async () => {
    const time = clock()
    const load = vi.fn().mockResolvedValue(['a-post'])
    const isPublished = createPublishedSlugCheck(load, 30_000, time.now)

    expect(await isPublished('a-post')).toBe(true)
    expect(await isPublished('missing')).toBe(false)
    expect(load).toHaveBeenCalledOnce()

    load.mockResolvedValue(['a-post', 'new-post'])
    time.advance(30_000)
    expect(await isPublished('new-post')).toBe(true)
    expect(load).toHaveBeenCalledTimes(2)
  })

  it('shares one load between concurrent requests', async () => {
    const load = vi.fn().mockResolvedValue(['a-post'])
    const isPublished = createPublishedSlugCheck(load)

    await Promise.all([isPublished('a-post'), isPublished('b-post'), isPublished('c-post')])
    expect(load).toHaveBeenCalledOnce()
  })

  it('fails open without a database answer and waits before retrying', async () => {
    const time = clock()
    const load = vi.fn().mockRejectedValue(new Error('down'))
    const isPublished = createPublishedSlugCheck(load, 30_000, time.now)

    expect(await isPublished('any-post')).toBe(true)
    expect(await isPublished('other-post')).toBe(true)
    expect(load).toHaveBeenCalledOnce()
  })

  it('keeps the last good set when a refresh fails', async () => {
    const time = clock()
    const load = vi.fn().mockResolvedValueOnce(['a-post']).mockRejectedValue(new Error('down'))
    const isPublished = createPublishedSlugCheck(load, 30_000, time.now)

    expect(await isPublished('a-post')).toBe(true)
    time.advance(30_000)
    expect(await isPublished('missing')).toBe(false)
    expect(await isPublished('a-post')).toBe(true)
  })
})
