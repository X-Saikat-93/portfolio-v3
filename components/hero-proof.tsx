'use client'

import { useEffect, useRef } from 'react'

import { settle } from '~/hooks/use-dock-magnify'

const MAX_TILT = 3 // degrees at the sheet's edge
const SETTLE_MS = 140 // slower than the dock: paper has weight

const clamp = (value: number) => Math.max(-1, Math.min(1, value))

// The proof sheet answers the pointer like a print held in the hand: it
// tips a few degrees toward it, its shadow slides the other way and the
// light moves across the stock, each settling on a critically damped
// spring. Fine pointers only; perfectly still under reduced motion.
export function HeroProof({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sheet = ref.current
    const stage = sheet?.closest<HTMLElement>('.home-hero')
    if (!sheet || !stage) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    const current = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let frame = 0
    let last = 0

    const step = (now: number) => {
      const dt = Math.min(48, now - (last || now - 16))
      last = now
      current.x = settle(current.x, target.x, dt, SETTLE_MS)
      current.y = settle(current.y, target.y, dt, SETTLE_MS)
      sheet.style.setProperty('--tilt-x', `${(-current.y * MAX_TILT).toFixed(3)}deg`)
      sheet.style.setProperty('--tilt-y', `${(current.x * MAX_TILT).toFixed(3)}deg`)
      sheet.style.setProperty('--shadow-x', `${(-current.x * 10).toFixed(2)}px`)
      sheet.style.setProperty('--shadow-y', `${(26 - current.y * 8).toFixed(2)}px`)
      sheet.style.setProperty('--light-x', `${(50 + current.x * 45).toFixed(1)}%`)
      sheet.style.setProperty('--light-y', `${(35 + current.y * 45).toFixed(1)}%`)
      const moving =
        Math.abs(current.x - target.x) > 0.0005 || Math.abs(current.y - target.y) > 0.0005
      frame = moving ? requestAnimationFrame(step) : 0
      if (!moving) last = 0
    }
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(step)
    }

    const move = (event: PointerEvent) => {
      const box = sheet.getBoundingClientRect()
      target.x = clamp((event.clientX - (box.left + box.width / 2)) / box.width)
      target.y = clamp((event.clientY - (box.top + box.height / 2)) / box.height)
      sheet.dataset.lit = ''
      wake()
    }
    const leave = () => {
      target.x = 0
      target.y = 0
      delete sheet.dataset.lit
      wake()
    }

    stage.addEventListener('pointermove', move)
    stage.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      stage.removeEventListener('pointermove', move)
      stage.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <div ref={ref} className="proof-sheet">
      {children}
    </div>
  )
}
