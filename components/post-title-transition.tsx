import { ViewTransition } from 'react'

export function PostTitleTransition({
  slug,
  children,
}: {
  slug: string
  children: React.ReactNode
}) {
  return (
    <ViewTransition
      name={`post-title-${slug}`}
      share="post-title-morph"
      default="none"
    >
      {children}
    </ViewTransition>
  )
}
