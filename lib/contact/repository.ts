import 'server-only'

import { desc, eq } from 'drizzle-orm'

import { getDatabase } from '~/db'
import { contactSubmissions } from '~/db/schema'

export type ContactSubmission = typeof contactSubmissions.$inferSelect
export type ContactSubmissionStatus = 'new' | 'read'
export type ContactNotificationStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'not_configured'

export function listContactSubmissions() {
  return getDatabase()
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(100)
}

export function createContactSubmission(input: {
  name: string
  email: string
  subject: string
  message: string
}) {
  return getDatabase()
    .insert(contactSubmissions)
    .values(input)
    .returning()
    .then(([submission]) => submission)
}

export function markContactSubmissionRead(id: string) {
  return getDatabase()
    .update(contactSubmissions)
    .set({ status: 'read' })
    .where(eq(contactSubmissions.id, id))
    .returning()
    .then(([submission]) => submission)
}

export function setContactNotificationStatus(
  id: string,
  status: ContactNotificationStatus,
) {
  return getDatabase()
    .update(contactSubmissions)
    .set({
      notificationStatus: status,
      notifiedAt: status === 'sent' ? new Date() : null,
    })
    .where(eq(contactSubmissions.id, id))
    .returning()
    .then(([submission]) => submission)
}
