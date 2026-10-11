'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { useIndiaTime } from '~/hooks/use-india-time'

type FormState = {
  name: string
  email: string
  subject: string
  message: string
  website: string
}

const initialForm: FormState = {
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '',
}

const MESSAGE_MAX = 5_000
const SEND_TIMEOUT_MS = 20_000

export function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const time = useIndiaTime()
  const [modKey, setModKey] = useState('Ctrl')
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.userAgent)) setModKey('⌘')
  }, [])

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (state !== 'idle' && state !== 'sending') {
      setState('idle')
      setMessage('')
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      })

      if (!response.ok) {
        setState('error')
        setMessage(
          response.status === 429
            ? 'Please give the form a little time before sending again.'
            : 'The message could not be sent. Please try again.',
        )
        return
      }

      setForm(initialForm)
      setState('sent')
      setMessage('Message received. Thank you for reaching out.')
    } catch {
      setState('error')
      setMessage('The message could not be sent. Please try again.')
    }
  }

  // Cmd/Ctrl+Enter sends from the message field, as in a mail client
  function sendShortcut(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  const remaining = MESSAGE_MAX - form.message.length

  return (
    <form onSubmit={submit} className="contact-form-shell enter-swing" data-state={state}>
      <div className="contact-form-topline">
        <span>To: Saikat Das</span>
        <span className="contact-form-clock" suppressHydrationWarning>
          {time ? `${time} in India` : 'India, UTC+5:30'}
        </span>
      </div>

      <div className="contact-form-fields">
        <label className="contact-field" style={{ '--i': 0 } as React.CSSProperties}>
          <span className="contact-field-label">Your name</span>
          <input
            required
            name="name"
            autoComplete="name"
            maxLength={120}
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            placeholder="Name"
          />
          <span className="contact-field-rule" aria-hidden="true" />
        </label>

        <label className="contact-field" style={{ '--i': 1 } as React.CSSProperties}>
          <span className="contact-field-label">Email address</span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            maxLength={320}
            value={form.email}
            onChange={(event) => setField('email', event.target.value)}
            placeholder="you@example.com"
          />
          <span className="contact-field-rule" aria-hidden="true" />
        </label>

        <label className="contact-field contact-field-wide" style={{ '--i': 2 } as React.CSSProperties}>
          <span className="contact-field-label">Subject</span>
          <input
            required
            name="subject"
            maxLength={180}
            value={form.subject}
            onChange={(event) => setField('subject', event.target.value)}
            placeholder="What would you like to talk about?"
          />
          <span className="contact-field-rule" aria-hidden="true" />
        </label>

        <label className="contact-field contact-field-wide" style={{ '--i': 3 } as React.CSSProperties}>
          <span className="contact-field-label">
            Message
            {/* only speaks up once the limit is in sight */}
            {remaining <= 500 ? (
              <span className="contact-field-count" aria-live="polite">
                {remaining} characters left
              </span>
            ) : null}
          </span>
          <textarea
            required
            name="message"
            minLength={10}
            maxLength={MESSAGE_MAX}
            rows={7}
            value={form.message}
            onChange={(event) => setField('message', event.target.value)}
            onKeyDown={sendShortcut}
            aria-keyshortcuts="Control+Enter Meta+Enter"
            placeholder="Write a few lines…"
          />
          <span className="contact-field-rule" aria-hidden="true" />
        </label>

        {/* bot trap: no autofill-friendly name or label, or a browser could
            fill it and the server would silently drop a real message */}
        <label className="contact-honeypot" aria-hidden="true">
          Leave this field empty
          <input
            tabIndex={-1}
            autoComplete="off"
            name="contact_hp"
            value={form.website}
            onChange={(event) => setField('website', event.target.value)}
          />
        </label>
      </div>

      <div className="contact-form-bottomline">
        <span className="contact-form-note">
          Replies go to the address you leave above. <Link href="/en/privacy">Privacy policy</Link>.
        </span>
        <span className="contact-submit-group">
          <kbd className="contact-submit-hint" aria-hidden="true">
            {modKey} ↵
          </kbd>
          <button
            type="submit"
            disabled={state === 'sending'}
            aria-busy={state === 'sending'}
            className="contact-submit"
          >
            <span className="contact-submit-label">
              {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent' : 'Send message'}
            </span>
            <span className="contact-submit-mark" aria-hidden>
              {state === 'sent' ? '✓' : '↗'}
            </span>
          </button>
        </span>
      </div>

      {message ? (
        <p
          className="contact-form-status"
          data-state={state}
          role={state === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </form>
  )
}
