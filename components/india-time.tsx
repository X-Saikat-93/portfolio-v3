'use client'

import { useIndiaTime } from '~/hooks/use-india-time'

// Saikat's local time as tabular figures; a placeholder of the same width
// until mounted, so the line never shifts.
export function IndiaTime({ className }: { className?: string }) {
  const time = useIndiaTime()
  return (
    <time className={className} suppressHydrationWarning>
      {time ?? '--:-- --'}
    </time>
  )
}
