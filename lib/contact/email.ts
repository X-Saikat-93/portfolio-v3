import 'server-only'

import nodemailer from 'nodemailer'

import type { ContactSubmission } from './repository'

function positivePort() {
  const port = Number.parseInt(process.env.SMTP_PORT ?? '', 10)
  return Number.isFinite(port) && port > 0 ? port : 587
}

export function isContactSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST?.trim() &&
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASSWORD?.trim() &&
      process.env.CONTACT_NOTIFICATION_EMAIL?.trim(),
  )
}

function headerSafe(value: string) {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined

function getTransporter() {
  if (transporter) return transporter
  if (!isContactSmtpConfigured()) throw new Error('Contact SMTP is not configured')

  const port = positivePort()
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim(),
    port,
    secure: process.env.SMTP_SECURE?.trim() === 'true' || port === 465,
    auth: {
      user: process.env.SMTP_USER?.trim(),
      pass: process.env.SMTP_PASSWORD?.trim(),
    },
    disableFileAccess: true,
    disableUrlAccess: true,
    // nodemailer's defaults wait minutes on an unreachable host; fail fast
    // so a bad SMTP host is recorded as 'failed' within the route's budget
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  })
  return transporter
}

export async function sendContactNotification(submission: ContactSubmission) {
  const from = process.env.SMTP_FROM_EMAIL?.trim() || process.env.SMTP_USER?.trim()
  const recipient = process.env.CONTACT_NOTIFICATION_EMAIL?.trim()
  if (!from || !recipient) throw new Error('Contact SMTP sender or recipient is not configured')

  await getTransporter().sendMail({
    from,
    to: recipient,
    replyTo: submission.email,
    subject: `[Saikat portfolio] ${headerSafe(submission.subject)}`,
    text: [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      `Subject: ${submission.subject}`,
      '',
      submission.message,
    ].join('\n'),
  })
}
