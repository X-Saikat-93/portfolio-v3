'use client'

import { useEffect, useState } from 'react'

import { buttonVariants, expandHitAreaClasses } from '~/components/ui/button-classes'
import { Seal } from '~/components/washi-art'
import { cn } from '~/lib/utils'

type CopyState = 'idle' | 'copied' | 'failed'

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // same fallback as ui/input-copy: Clipboard API denied or unavailable
    const field = document.createElement('textarea')
    field.value = text
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
    return ok
  }
}

// Copies the address; success is the seal stamp plus a polite announcement.
export function CopyEmail({ address }: { address: string }) {
  const [state, setState] = useState<CopyState>('idle')

  useEffect(() => {
    if (state === 'idle') return
    const id = window.setTimeout(() => setState('idle'), 2400)
    return () => window.clearTimeout(id)
  }, [state])

  return (
    <span className="copy-email">
      <button
        type="button"
        className={cn(buttonVariants({ variant: 'ghost', size: 'md' }), expandHitAreaClasses)}
        onClick={async () => setState((await copyText(address)) ? 'copied' : 'failed')}
      >
        {state === 'failed' ? 'Copy blocked' : 'Copy address'}
      </button>
      <span className="seal-stamp" data-stamped={state === 'copied' || undefined} aria-hidden="true">
        {state === 'copied' ? <Seal /> : null}
      </span>
      <span className="sr-only" role="status" aria-live="polite">
        {state === 'copied' ? 'Email address copied' : state === 'failed' ? 'Copying was blocked by the browser' : ''}
      </span>
    </span>
  )
}
