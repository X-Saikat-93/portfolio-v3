'use client'

import { useEffect, type RefObject } from 'react'

export const MAGNIFY_MAX = 1.35
export const MAGNIFY_RADIUS = 96 // px from the pointer where the swell ends

/** Scale for an item whose centre is `distance` px from the pointer. */
export function magnification(distance: number, max = MAGNIFY_MAX, radius = MAGNIFY_RADIUS) {
  const t = Math.max(0, 1 - Math.abs(distance) / radius)
  // smoothstep: full swell under the pointer, no edge at the radius
  return 1 + (max - 1) * t * t * (3 - 2 * t)
}

/**
 * Proximity magnification for the dock: items swell toward the pointer and
 * fall off with distance. Fine pointers only, never under reduced motion;
 * the scale rides --dock-mag so CSS owns the easing.
 */
export function useDockMagnify(dockRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const dock = dockRef.current
    if (!dock) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return

    const items = () => [...dock.querySelectorAll<HTMLElement>('.dock-item')]
    let frame = 0

    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        for (const item of items()) {
          const box = item.getBoundingClientRect()
          const scale = magnification(event.clientX - (box.left + box.width / 2))
          item.style.setProperty('--dock-mag', scale.toFixed(3))
        }
      })
    }
    const leave = () => {
      cancelAnimationFrame(frame)
      for (const item of items()) item.style.removeProperty('--dock-mag')
    }

    dock.addEventListener('pointermove', move)
    dock.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(frame)
      dock.removeEventListener('pointermove', move)
      dock.removeEventListener('pointerleave', leave)
    }
  }, [dockRef])
}
