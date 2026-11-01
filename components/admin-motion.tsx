'use client'

import { MotionConfig } from 'framer-motion'

// framer-motion powers a few owner-console controls; the public shell no
// longer ships it, so its reduced-motion contract lives with the admin.
export function AdminMotion({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
