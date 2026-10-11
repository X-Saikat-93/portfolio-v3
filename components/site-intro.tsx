'use client'

import { useEffect } from 'react'

const NAME = 'Saikat Das'
// Matches the end of the plate's lift in site-intro.css. After it, the
// html[data-intro] flag comes off so entrances on later client-side
// navigations run at their normal timing.
const INTRO_MS = 1700

// The opening plate on every full page load: the name prints in, a signal
// rule draws under it, then the plate lifts and the page develops behind
// it. Server-rendered and driven entirely by CSS, so it never flashes the
// page first and needs no JavaScript to finish; this component only clears
// the flag afterwards. Client-side navigations keep the layout, so the
// plate never replays mid-visit.
export function SiteIntro() {
  useEffect(() => {
    const id = window.setTimeout(() => {
      delete document.documentElement.dataset.intro
    }, INTRO_MS)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div className="site-intro" aria-hidden="true">
      <div className="site-intro-mark">
        <span className="site-intro-name">
          {[...NAME].map((char, i) => (
            <span key={i} className="site-intro-char" style={{ '--c': i } as React.CSSProperties}>
              {char === ' ' ? ' ' : char}
            </span>
          ))}
        </span>
        <span className="site-intro-rule" />
        <span className="site-intro-role">Full-Stack Product Engineer</span>
      </div>
    </div>
  )
}
