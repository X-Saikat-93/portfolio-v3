import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  after: vi.fn(),
  createContactSubmission: vi.fn(),
  setContactNotificationStatus: vi.fn(),
  isContactSmtpConfigured: vi.fn(),
  sendContactNotification: vi.fn(),
  limitContactSubmission: vi.fn(),
}))

vi.mock('next/server', () => ({ after: mocks.after }))
vi.mock('~/lib/contact/repository', () => ({
  createContactSubmission: mocks.createContactSubmission,
  setContactNotificationStatus: mocks.setContactNotificationStatus,
}))
vi.mock('~/lib/contact/email', () => ({
  isContactSmtpConfigured: mocks.isContactSmtpConfigured,
  sendContactNotification: mocks.sendContactNotification,
}))
vi.mock('~/lib/contact/rate-limit', () => ({
  limitContactSubmission: mocks.limitContactSubmission,
}))

import { POST } from './route'

const valid = {
  name: 'Ada Example',
  email: 'Ada@Example.com',
  subject: 'A product question',
  message: 'I would like to discuss a product idea.',
  website: '',
}

function post(body: unknown) {
  return POST(
    new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }),
  )
}

// run whatever the route scheduled with after()
async function flushAfter() {
  for (const [callback] of mocks.after.mock.calls) await callback()
}

afterEach(() => {
  vi.resetAllMocks()
})

describe('POST /api/contact', () => {
  it('stores the message and responds before the email notification runs', async () => {
    mocks.createContactSubmission.mockResolvedValue({ id: 'sub-1', ...valid })
    mocks.isContactSmtpConfigured.mockReturnValue(true)
    mocks.sendContactNotification.mockResolvedValue(undefined)

    const response = await post(valid)

    expect(response.status).toBe(201)
    expect(mocks.createContactSubmission).toHaveBeenCalledWith({
      name: 'Ada Example',
      email: 'ada@example.com',
      subject: 'A product question',
      message: 'I would like to discuss a product idea.',
    })
    // the email has not been attempted when the visitor gets the reply
    expect(mocks.sendContactNotification).not.toHaveBeenCalled()

    await flushAfter()
    expect(mocks.sendContactNotification).toHaveBeenCalledTimes(1)
    expect(mocks.setContactNotificationStatus).toHaveBeenCalledWith('sub-1', 'sent')
  })

  it('keeps the 201 and records a failed notification when SMTP is unreachable', async () => {
    mocks.createContactSubmission.mockResolvedValue({ id: 'sub-2', ...valid })
    mocks.isContactSmtpConfigured.mockReturnValue(true)
    mocks.sendContactNotification.mockRejectedValue(new Error('connect ETIMEDOUT'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect((await post(valid)).status).toBe(201)
    await flushAfter()
    expect(mocks.setContactNotificationStatus).toHaveBeenCalledWith('sub-2', 'failed')
  })

  it('records not_configured without sending when SMTP is absent', async () => {
    mocks.createContactSubmission.mockResolvedValue({ id: 'sub-3', ...valid })
    mocks.isContactSmtpConfigured.mockReturnValue(false)

    await post(valid)
    await flushAfter()
    expect(mocks.sendContactNotification).not.toHaveBeenCalled()
    expect(mocks.setContactNotificationStatus).toHaveBeenCalledWith('sub-3', 'not_configured')
  })

  it('accepts honeypot submissions without storing them', async () => {
    const response = await post({ ...valid, website: 'https://spam.example' })

    expect(response.status).toBe(200)
    expect(mocks.createContactSubmission).not.toHaveBeenCalled()
    expect(mocks.after).not.toHaveBeenCalled()
  })

  it('rejects invalid input', async () => {
    const response = await post({ ...valid, email: 'not-an-email', message: 'short' })

    expect(response.status).toBe(400)
    expect(mocks.createContactSubmission).not.toHaveBeenCalled()
  })

  it('returns the rate limiter response when limited', async () => {
    mocks.limitContactSubmission.mockResolvedValue(new Response(null, { status: 429 }))

    expect((await post(valid)).status).toBe(429)
    expect(mocks.createContactSubmission).not.toHaveBeenCalled()
  })

  it('reports 503 when the database is unavailable', async () => {
    mocks.createContactSubmission.mockRejectedValue(new Error('db down'))

    expect((await post(valid)).status).toBe(503)
    expect(mocks.after).not.toHaveBeenCalled()
  })
})
