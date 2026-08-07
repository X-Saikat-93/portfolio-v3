import { formatDate, SITE_TIME_ZONE } from '~/lib/date'

// This fork is English-only. Keep the two-value call signature so the cloned
// components stay easy to merge, but never ship the source language in DOM.
export function T({ en }: { zh?: React.ReactNode; en: React.ReactNode }) {
  return <>{en}</>
}

const enFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: SITE_TIME_ZONE,
})

export function LocalDate({ date }: { date: Date }) {
  return <T zh={formatDate(date)} en={enFormatter.format(date)} />
}
