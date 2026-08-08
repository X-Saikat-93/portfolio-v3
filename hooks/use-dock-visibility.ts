'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const SCROLL_TOLERANCE = 4

/**
 * Keep the persistent dock available at the top of a page, then get it out
 * of the reading path while the visitor scrolls down. Scrolling back up or
 * focusing the dock brings it back without making navigation harder to find.
 */
export function useDockVisibility() {
  const [hidden, setHidden] = useState(false)
  const previousScrollY = useRef(0)
  const frame = useRef<number | null>(null)

  const show = useCallback(() => setHidden(false), [])

  useEffect(() => {
    previousScrollY.current = window.scrollY

    const update = () => {
      frame.current = null
      const currentScrollY = window.scrollY
      const delta = currentScrollY - previousScrollY.current

      if (currentScrollY <= 24 || delta < -SCROLL_TOLERANCE) {
        setHidden(false)
      } else if (delta > SCROLL_TOLERANCE) {
        setHidden(true)
      }

      previousScrollY.current = currentScrollY
    }

    const onScroll = () => {
      if (frame.current !== null) return
      frame.current = window.requestAnimationFrame(update)
    }

    const scrollTarget = document.scrollingElement ?? document.documentElement
    scrollTarget.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scrollTarget.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
      if (frame.current !== null) window.cancelAnimationFrame(frame.current)
    }
  }, [])

  return { hidden, show }
}
