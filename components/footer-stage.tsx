'use client'

import { useEffect, useRef } from 'react'

// Arms the footer's entrance once it nears the viewport and steers the
// wordmark's light with the pointer. Hidden states exist only after JS
// arms them, so without JS (or with reduced motion) the footer is static.
export function FooterStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = ref.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let io: IntersectionObserver | undefined
    if (root.getBoundingClientRect().top > window.innerHeight) {
      root.dataset.armed = ''
      io = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return
          root.dataset.in = ''
          io?.disconnect()
        },
        { threshold: 0.15 },
      )
      io.observe(root)
    }

    const mark = root.querySelector<HTMLElement>('.footer-wordmark')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    let frame = 0
    const move = (event: PointerEvent) => {
      if (!mark) return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = mark.getBoundingClientRect()
        mark.style.setProperty('--mx', `${((event.clientX - box.left) / box.width) * 100}%`)
        mark.style.setProperty('--my', `${((event.clientY - box.top) / box.height) * 100}%`)
      })
    }
    if (mark && fine) root.addEventListener('pointermove', move)

    return () => {
      io?.disconnect()
      cancelAnimationFrame(frame)
      root.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <div ref={ref} className="footer-stage">
      {children}
    </div>
  )
}
