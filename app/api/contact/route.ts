import { z } from 'zod'

import {
  createContactSubmission,
  setContactNotificationStatus,
} from '~/lib/contact/repository'
import {
  isContactSmtpConfigured,
  sendContactNotification,
} from '~/lib/contact/email'
import { limitContactSubmission } from '~/lib/contact/rate-limit'

const submissionSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  subject: z.string().trim().min(1).max(180),
  message: z.string().trim().min(10).max(5_000),
  website: z.string().max(200).optional(),
})

async function recordNotificationStatus(
  id: string,
  status: 'sent' | 'failed' | 'not_configured',
) {
  try {
    await setContactNotificationStatus(id, status)
  } catch (error) {
    console.error(
      'Contact notification status update failed',
      error instanceof Error ? error.message : 'unknown error',
    )
  }
}

export async function POST(request: Request) {
  const limited = await limitContactSubmission(request)
  if (limited) return limited

  let input: z.infer<typeof submissionSchema>
  try {
    input = submissionSchema.parse(await request.json())
  } catch {
    return Response.json({ error: 'invalid_request' }, { status: 400 })
  }

  // Honeypot: silently accept automated submissions without storing or emailing them.
  if (input.website?.trim()) return Response.json({ ok: true })

  try {
    const submission = await createContactSubmission({
      name: input.name,
      email: input.email.toLowerCase(),
      subject: input.subject,
      message: input.message,
    })

    if (!isContactSmtpConfigured()) {
      await recordNotificationStatus(submission.id, 'not_configured')
    } else {
      try {
        await sendContactNotification(submission)
        await recordNotificationStatus(submission.id, 'sent')
      } catch (error) {
        console.error(
          'Contact SMTP delivery failed',
          error instanceof Error ? error.message : 'unknown error',
        )
        await recordNotificationStatus(submission.id, 'failed')
      }
    }

    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json({ error: 'database_unavailable' }, { status: 503 })
  }
}
