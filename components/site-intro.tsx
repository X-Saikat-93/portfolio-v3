'use client'

import { useEffect } from 'react'

// Ends the first-load choreography (motion.css, home.css, dock.css), which
// plays once per session on a full load while html[data-intro] is set and
// html[data-visited] is not. After the last entrance the flag comes off, so
// client navigations simply arrive. Any key, tap or scroll finishes the
// sequence at once.
const FIRST_LOAD_MS = 1000

export function SiteIntro() {
  useEffect(() => {
    const root = document.documentElement
    const end = () => {
      delete root.dataset.intro
      window.removeEventListener('keydown', skip)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchmove', skip)
    }
    const skip = () => {
      if (!('visited' in root.dataset)) {
        for (const animation of document.getAnimations()) {
          if (animation instanceof CSSAnimation && animation.animationName.startsWith('first-')) {
            animation.finish()
          }
        }
      }
      end()
    }
    const id = window.setTimeout(end, FIRST_LOAD_MS)
    window.addEventListener('keydown', skip, { once: true })
    window.addEventListener('pointerdown', skip, { once: true })
    window.addEventListener('wheel', skip, { once: true, passive: true })
    window.addEventListener('touchmove', skip, { once: true, passive: true })
    return () => {
      window.clearTimeout(id)
      end()
    }
  }, [])

  return null
}
