'use client'

import { useEffect, useState } from 'react'

const indiaTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

// Saikat's local time, e.g. "12:38 PM". Null until mounted so the server
// render never disagrees with the visitor's clock.
export function useIndiaTime() {
  const [label, setLabel] = useState<string | null>(null)
  useEffect(() => {
    const tick = () => setLabel(indiaTime.format(new Date()))
    tick()
    const id = window.setInterval(tick, 15_000)
    return () => window.clearInterval(id)
  }, [])
  return label
}
