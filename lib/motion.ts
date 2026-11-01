// The motion tokens for script-driven animation (WAAPI, View Transitions).
// CSS reads the same values from app/styles/base/motion.css; nothing else
// defines timing.

export const duration = {
  instant: 90,
  quick: 160,
  base: 240,
  gentle: 420,
  slow: 720,
} as const

export const easing = {
  settle: 'cubic-bezier(0.22, 1, 0.36, 1)',
  ink: 'cubic-bezier(0.45, 0, 0.55, 1)',
  exit: 'cubic-bezier(0.4, 0, 1, 1)',
} as const

export const STAGGER_MS = 48
export const MAX_STAGGERED = 6

/** Sibling delay: the first six stagger, the rest arrive with the sixth. */
export function staggerDelay(index: number, step: number = STAGGER_MS) {
  return Math.min(Math.max(0, Math.floor(index)), MAX_STAGGERED - 1) * step
}

/** Exits run at about 70% of the matching entrance. */
export function exitDuration(enter: number) {
  return Math.round(enter * 0.7)
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Radius that lets a circle grown from (x, y) cover the whole viewport. */
export function coverRadius(x: number, y: number, width: number, height: number) {
  return Math.ceil(Math.hypot(Math.max(x, width - x), Math.max(y, height - y)))
}
