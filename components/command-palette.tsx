'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

import { isTypingTarget, shortcutsEnabled } from '~/lib/shortcuts'

export interface CommandPaletteItem {
  id: string
  label: string
  description: string
  href: string
  group: string
}

export const OPEN_COMMAND_PALETTE_EVENT = 'command-palette:open'

const DISCOVERY_HINT_STORAGE_KEY = 'portfolio:command-palette-hint:v1'
const DISCOVERY_HINT_DELAY_MS = 900
const DISCOVERY_HINT_DURATION_MS = 5_400

function rememberDiscoveryHint() {
  try {
    window.localStorage.setItem(DISCOVERY_HINT_STORAGE_KEY, 'seen')
  } catch {
    // Storage can be unavailable in hardened browser modes. The hint still
    // works for the current page without making search depend on persistence.
  }
}

function hasSeenDiscoveryHint() {
  try {
    return window.localStorage.getItem(DISCOVERY_HINT_STORAGE_KEY) === 'seen'
  } catch {
    return false
  }
}

const CommandPaletteDialog = dynamic(
  () => import('~/components/command-palette-dialog').then((mod) => mod.CommandPaletteDialog),
  { ssr: false },
)

export function CommandPalette({ items }: { items: readonly CommandPaletteItem[] }) {
  const [open, setOpen] = useState(false)
  // the dialog mounts on first open and stays, so it can animate closed
  const [mounted, setMounted] = useState(false)
  const [showDiscoveryHint, setShowDiscoveryHint] = useState(false)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    if (open || hasSeenDiscoveryHint()) return

    let hideTimer: number | undefined
    const showTimer = window.setTimeout(() => {
      rememberDiscoveryHint()
      setShowDiscoveryHint(true)
      hideTimer = window.setTimeout(() => setShowDiscoveryHint(false), DISCOVERY_HINT_DURATION_MS)
    }, DISCOVERY_HINT_DELAY_MS)

    return () => {
      window.clearTimeout(showTimer)
      if (hideTimer !== undefined) window.clearTimeout(hideTimer)
    }
  }, [open])

  useEffect(() => {
    function handleGlobalKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === '/' && !isTypingTarget(event.target) && shortcutsEnabled()) {
        event.preventDefault()
        rememberDiscoveryHint()
        setShowDiscoveryHint(false)
        setOpen(true)
        return
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault()
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown)
    return () => document.removeEventListener('keydown', handleGlobalKeyDown)
  }, [open])

  // the dock's Search button lives in another tree, so it asks by event
  useEffect(() => {
    function openPalette() {
      rememberDiscoveryHint()
      setShowDiscoveryHint(false)
      setOpen(true)
    }

    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, openPalette)
    return () => window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, openPalette)
  }, [])

  return (
    <>
      {showDiscoveryHint && !open ? (
        <div className="command-palette-discovery" role="status" aria-live="polite">
          <span>Press</span>
          <kbd>/</kbd>
          <span>to search</span>
        </div>
      ) : null}

      {mounted ? <CommandPaletteDialog items={items} open={open} setOpen={setOpen} /> : null}
    </>
  )
}
