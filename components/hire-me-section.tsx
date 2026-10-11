'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { SectionTag } from '~/components/section-tag'
import { useIndiaTime } from '~/hooks/use-india-time'

const EMAIL = 'ibx.saikat37@gmail.com'

function ArrowMark() {
  return (
    <svg aria-hidden="true" className="hire-slip-arrow" viewBox="0 0 16 16" width="16" height="16" fill="none">
      <path
        d="M3.5 8h9m0 0L8.75 4.25M12.5 8l-3.75 3.75"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CopyEmail() {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const id = window.setTimeout(() => setState('idle'), 1800)
    return () => window.clearTimeout(id)
  }, [state])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setState('copied')
    } catch {
      // same fallback as ui/input-copy: Clipboard API denied or unavailable
      const field = document.createElement('textarea')
      field.value = EMAIL
      field.setAttribute('readonly', '')
      field.style.position = 'fixed'
      field.style.opacity = '0'
      document.body.appendChild(field)
      field.select()
      let ok = false
      try {
        ok = document.execCommand('copy')
      } catch {}
      field.remove()
      setState(ok ? 'copied' : 'failed')
    }
  }

  return (
    <button type="button" className="hire-slip-copy" data-state={state} onClick={copy}>
      <span className="hire-slip-copy-label" aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy blocked' : 'Copy'}
      </span>
    </button>
  )
}

// An engagement slip: role and terms on the body, the next steps on a
// perforated stub — the same technical-print register as the commits plate.
export function HireMeSection({ index }: { index: number }) {
  const time = useIndiaTime()

  return (
    <section className="mt-16" aria-labelledby="hire-me-title">
      <SectionTag index={index} id="hire-me-title">
        Hire me
      </SectionTag>

      <div className="hire-slip mt-4">
        <div className="hire-slip-body">
          <p className="hire-slip-status">
            <span className="hire-slip-beacon" aria-hidden="true" />
            Open to remote work
          </p>
          <h3 className="hire-slip-role">Full-Stack Software Engineer</h3>

          <dl className="hire-slip-terms">
            <div className="hire-slip-term">
              <dt>Based in</dt>
              <dd>India, UTC+5:30</dd>
            </div>
            <div className="hire-slip-term">
              <dt>Local time</dt>
              <dd>
                <time className="hire-slip-time" suppressHydrationWarning>
                  {time ?? '--:-- --'}
                </time>
              </dd>
            </div>
            <div className="hire-slip-term">
              <dt>Email</dt>
              <dd className="hire-slip-email">
                <a href={`mailto:${EMAIL}`} className="hire-slip-email-link">
                  {EMAIL}
                </a>
                <CopyEmail />
              </dd>
            </div>
          </dl>
        </div>

        <span className="hire-slip-perforation" aria-hidden="true" />

        <nav className="hire-slip-stub" aria-label="Hiring links">
          <Link href="/en/contact" className="hire-slip-action hire-slip-action-primary">
            <span>Start a conversation</span>
            <ArrowMark />
          </Link>
          <Link href="/en/resume" className="hire-slip-action hire-slip-action-secondary">
            <span>View resume</span>
          </Link>
        </nav>
      </div>
    </section>
  )
}
