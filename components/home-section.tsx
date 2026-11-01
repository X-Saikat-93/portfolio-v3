import Link from 'next/link'

import { toRoman } from '~/lib/roman'
import { cn } from '~/lib/utils'

// One homepage section: a numbered title, an optional way onward, then the
// section's object.
export function HomeSection({
  index,
  id,
  title,
  action,
  className,
  children,
}: {
  index: number
  id: string
  title: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn('home-section', className)} aria-labelledby={id}>
      <header className="home-section-head">
        <h2 id={id} className="home-section-title">
          <span className="home-section-numeral" aria-hidden>
            {toRoman(index)}
          </span>
          {title}
        </h2>
        {action}
      </header>
      {children}
    </section>
  )
}

/** "All projects", "All writing": the way onward from a section. */
export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="section-link">
      <span className="ink-link">{children}</span>
      <span className="section-link-arrow" aria-hidden>
        →
      </span>
    </Link>
  )
}
