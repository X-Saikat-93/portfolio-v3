'use client'

import { useState, type CSSProperties } from 'react'

// Words keep their own boxes so a phrase can wrap on narrow screens, while
// each character carries a global index for the stagger.
function words(phrase: string) {
  let offset = 0
  return phrase.split(' ').map((word) => {
    const entry = { word, offset }
    offset += word.length + 1
    return entry
  })
}

// One phrase at a time, stacked in a single grid cell so the line keeps the
// width of the longest phrase and never reflows. The signal underline is the
// clock: its animationend advances the phrase, and pausing it (hover) pauses
// the cycle. Under reduced motion the underline never runs, so the first
// phrase simply stays.
export function HomeIntroRotator({ phrases }: { phrases: readonly string[] }) {
  const [index, setIndex] = useState(0)
  const [cycled, setCycled] = useState(false)
  const previous = (index + phrases.length - 1) % phrases.length

  const advance = () => {
    setCycled(true)
    setIndex((current) => (current + 1) % phrases.length)
  }

  return (
    <span className="intro-rotator" aria-hidden="true">
      <span className="intro-rotator-window">
        {phrases.map((phrase, p) => (
          <span
            key={phrase}
            className="intro-rotator-phrase"
            data-state={p === index ? 'in' : cycled && p === previous ? 'out' : 'idle'}
            data-first={!cycled && p === 0 ? '' : undefined}
          >
            {words(phrase).map(({ word, offset }, w) => (
              <span key={w}>
                {w > 0 ? ' ' : null}
                <span className="intro-word">
                  {[...word].map((char, c) => (
                    <span key={c} className="intro-char" style={{ '--c': offset + c } as CSSProperties}>
                      {char}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </span>
        ))}
      </span>
      <span key={index} className="intro-rotator-clock" onAnimationEnd={advance} />
    </span>
  )
}
