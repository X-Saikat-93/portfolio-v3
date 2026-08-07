import { afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const sendMail = vi.fn()
  const createTransport = vi.fn(() => ({ sendMail }))
  return { createTransport, sendMail }
})

vi.mock('server-only', () => ({}))
vi.mock('nodemailer', () => ({
  default: { createTransport: mocks.createTransport },
}))

afterEach(() => {
  vi.resetModules()
  vi.resetAllMocks()
  vi.unstubAllEnvs()
})

const submission = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Ada Example',
  email: 'ada@example.com',
  subject: 'A question\nwith a safe header',
  message: 'I would like to discuss a product idea.',
  status: 'new' as const,
  notificationStatus: 'pending' as const,
  notifiedAt: null,
  createdAt: new Date('2026-08-07T12:00:00.000Z'),
}

async function loadEmail() {
  return import('./email')
}

function configureSmtp() {
  vi.stubEnv('SMTP_HOST', 'smtp.example.com')
  vi.stubEnv('SMTP_PORT', '587')
  vi.stubEnv('SMTP_SECURE', 'false')
  vi.stubEnv('SMTP_USER', 'sender@example.com')
  vi.stubEnv('SMTP_PASSWORD', 'secret')
  vi.stubEnv('SMTP_FROM_EMAIL', 'portfolio@example.com')
  vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', 'inbox@example.com')
}

describe('contact SMTP delivery', () => {
  it('reports incomplete SMTP configuration without constructing a transport', async () => {
    const { isContactSmtpConfigured } = await loadEmail()

    expect(isContactSmtpConfigured()).toBe(false)
    expect(mocks.createTransport).not.toHaveBeenCalled()
  })

  it('uses one reusable SMTP transport and safe reply headers', async () => {
    configureSmtp()
    mocks.sendMail.mockResolvedValueOnce({ messageId: 'message-1' })

    const { sendContactNotification } = await loadEmail()
    await sendContactNotification(submission)

    expect(mocks.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: { user: 'sender@example.com', pass: 'secret' },
        disableFileAccess: true,
        disableUrlAccess: true,
      }),
    )
    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'portfolio@example.com',
        to: 'inbox@example.com',
        replyTo: 'ada@example.com',
        subject: '[Saikat portfolio] A question with a safe header',
        text: expect.stringContaining('I would like to discuss a product idea.'),
      }),
    )
  })
})
