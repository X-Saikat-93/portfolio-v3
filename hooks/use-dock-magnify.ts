'use client'

import { useEffect, type RefObject } from 'react'

export const MAGNIFY_MAX = 1.35
export const MAGNIFY_RADIUS = 110 // px from the pointer where the swell ends
const SETTLE_MS = 70 // spring time constant: critically damped, no overshoot
const TIP_DWELL_MS = 300

/** Target scale for an item whose centre is `distance` px from the pointer. */
export function magnification(distance: number, max = MAGNIFY_MAX, radius = MAGNIFY_RADIUS) {
  const t = Math.max(0, 1 - Math.abs(distance) / radius)
  // smoothstep: full swell under the pointer, no edge at the radius
  return 1 + (max - 1) * t * t * (3 - 2 * t)
}

/** One step of a critically damped approach toward `target`. */
export function settle(current: number, target: number, dt: number, tau = SETTLE_MS) {
  return target + (current - target) * Math.exp(-dt / tau)
}

/**
 * Dock magnification: items widen toward the pointer, so neighbours move
 * aside, and each settles on a critically damped spring every frame until
 * it rests. The scale rides --dock-mag. After a 300ms dwell the dock is
 * "warm" and tooltips follow the pointer without waiting again. Fine
 * pointers only, never under reduced motion.
 */
export function useDockMagnify(dockRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const dock = dockRef.current
    if (!dock) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    const scales = new Map<HTMLElement, number>()
    let pointerX: number | null = null
    let frame = 0
    let last = 0
    let warmTimer = 0

    const step = (now: number) => {
      const dt = Math.min(48, now - (last || now - 16))
      last = now
      let moving = false
      for (const item of dock.querySelectorAll<HTMLElement>('.dock-item')) {
        let target = 1
        if (pointerX !== null) {
          const box = item.getBoundingClientRect()
          target = magnification(pointerX - (box.left + box.width / 2))
        }
        const next = settle(scales.get(item) ?? 1, target, dt)
        const done = Math.abs(next - target) < 0.002
        const value = done ? target : next
        scales.set(item, value)
        if (value === 1) item.style.removeProperty('--dock-mag')
        else item.style.setProperty('--dock-mag', value.toFixed(4))
        if (!done) moving = true
      }
      frame = moving ? requestAnimationFrame(step) : 0
      if (!moving) last = 0
    }
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(step)
    }

    const move = (event: PointerEvent) => {
      pointerX = event.clientX
      wake()
    }
    const enter = () => {
      window.clearTimeout(warmTimer)
      warmTimer = window.setTimeout(() => (dock.dataset.warm = ''), TIP_DWELL_MS)
    }
    const leave = () => {
      pointerX = null
      window.clearTimeout(warmTimer)
      delete dock.dataset.warm
      wake()
    }

    dock.addEventListener('pointermove', move)
    dock.addEventListener('pointerenter', enter)
    dock.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(warmTimer)
      dock.removeEventListener('pointermove', move)
      dock.removeEventListener('pointerenter', enter)
      dock.removeEventListener('pointerleave', leave)
    }
  }, [dockRef])
}
