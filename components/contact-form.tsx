'use client'

import { useState } from 'react'

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

export function ContactForm() {
  const [form, setForm] = useState(initialForm)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    if (state !== 'idle') {
      setState('idle')
      setMessage('')
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('sending')
    setMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
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

  return (
    <form onSubmit={submit} className="contact-form-shell enter-swing">
      <div className="contact-form-topline">
        <span>INBOX / 01</span>
        <span>SAIKAT DAS</span>
      </div>

      <div className="contact-form-fields">
        <label className="contact-field">
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
        </label>

        <label className="contact-field">
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
        </label>

        <label className="contact-field contact-field-wide">
          <span className="contact-field-label">Subject</span>
          <input
            required
            name="subject"
            maxLength={180}
            value={form.subject}
            onChange={(event) => setField('subject', event.target.value)}
            placeholder="What would you like to talk about?"
          />
        </label>

        <label className="contact-field contact-field-wide">
          <span className="contact-field-label">Message</span>
          <textarea
            required
            name="message"
            minLength={10}
            maxLength={5_000}
            rows={7}
            value={form.message}
            onChange={(event) => setField('message', event.target.value)}
            placeholder="Write a few lines…"
          />
        </label>

        <label className="contact-honeypot" aria-hidden="true">
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            name="website"
            value={form.website}
            onChange={(event) => setField('website', event.target.value)}
          />
        </label>
      </div>

      <div className="contact-form-bottomline">
        <span className="contact-form-note">Replies go to the address you leave above.</span>
        <button
          type="submit"
          disabled={state === 'sending'}
          className="contact-submit"
        >
          {state === 'sending' ? 'Sending…' : 'Send message'}
          <span aria-hidden>{state === 'sending' ? '·' : '↗'}</span>
        </button>
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
