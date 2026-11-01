import 'server-only'

import { desc, eq, lt } from 'drizzle-orm'

import { getDatabase } from '~/db'
import { contactSubmissions } from '~/db/schema'

export type ContactSubmission = typeof contactSubmissions.$inferSelect
export type ContactSubmissionStatus = 'new' | 'read'
export type ContactNotificationStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'not_configured'

// The privacy notice promises messages are kept 36 months. There is no
// scheduler, so expired rows go whenever the inbox is read or a message
// arrives.
export const CONTACT_RETENTION_MONTHS = 36

export function contactRetentionCutoff(now = new Date()) {
  const cutoff = new Date(now)
  cutoff.setUTCMonth(cutoff.getUTCMonth() - CONTACT_RETENTION_MONTHS)
  return cutoff
}

export function deleteExpiredContactSubmissions() {
  return getDatabase()
    .delete(contactSubmissions)
    .where(lt(contactSubmissions.createdAt, contactRetentionCutoff()))
}

export async function listContactSubmissions() {
  await deleteExpiredContactSubmissions()
  return getDatabase()
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(100)
}

export async function createContactSubmission(input: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const [submission] = await getDatabase()
    .insert(contactSubmissions)
    .values(input)
    .returning()
  // never fail a visitor's message over housekeeping; the inbox retries it
  await deleteExpiredContactSubmissions().catch((error: unknown) => {
    console.error('Expired contact submissions were not deleted', error)
  })
  return submission
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
