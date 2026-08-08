import { ViewTransition } from 'react'
import type { ReactNode } from 'react'

export function RouteViewTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition default="route-content">{children}</ViewTransition>
  )
}
