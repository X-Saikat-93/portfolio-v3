'use client'

import { useEffect, useMemo, useState } from 'react'

type ContactSubmission = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'new' | 'read'
  notificationStatus: 'pending' | 'sent' | 'failed' | 'not_configured'
  createdAt: string
}

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function ContactInbox() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [message, setMessage] = useState('')

  async function refresh() {
    const response = await fetch('/api/admin/contact', { cache: 'no-store' })
    if (!response.ok) throw new Error('Could not load messages')
    setSubmissions((await response.json()) as ContactSubmission[])
  }

  useEffect(() => {
    void refresh().catch((error) => {
      setMessage(error instanceof Error ? error.message : 'Could not load messages')
    })
  }, [])

  async function markRead(id: string) {
    const response = await fetch('/api/admin/contact', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id, status: 'read' }),
    })
    if (!response.ok) {
      setMessage('Message could not be updated')
      return
    }
    setSubmissions((current) =>
      current.map((submission) =>
        submission.id === id ? { ...submission, status: 'read' } : submission,
      ),
    )
  }

  const unreadCount = useMemo(
    () => submissions.filter((submission) => submission.status === 'new').length,
    [submissions],
  )

  return (
    <div className="pb-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="page-eyebrow">Contact inbox</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Private messages submitted through the public contact page.
          </p>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">
          {unreadCount} unread
        </span>
      </div>

      {message ? <p className="enter mt-4 text-sm text-destructive">{message}</p> : null}

      <ul className="contact-inbox-list motion-list mt-8">
        {submissions.map((submission) => (
          <li key={submission.id} className="contact-inbox-item" data-status={submission.status}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{submission.subject}</p>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {submission.name} ·{' '}
                  <a className="hover:text-foreground" href={`mailto:${submission.email}`}>
                    {submission.email}
                  </a>
                </p>
              </div>
              <span className="shrink-0 text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
                {submission.status}
              </span>
            </div>
            <p className="contact-inbox-message">{submission.message}</p>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{dateFormatter.format(new Date(submission.createdAt))}</span>
              <span>
                SMTP: {submission.notificationStatus === 'not_configured' ? 'not configured' : submission.notificationStatus}
              </span>
              {submission.status === 'new' ? (
                <button
                  type="button"
                  className="text-foreground underline decoration-dotted underline-offset-4 hover:no-underline"
                  onClick={() => void markRead(submission.id)}
                >
                  Mark read
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {submissions.length === 0 && !message ? (
        <p className="hairline-top mt-8 pt-4 text-sm text-muted-foreground">
          No messages yet.
        </p>
      ) : null}
    </div>
  )
}
