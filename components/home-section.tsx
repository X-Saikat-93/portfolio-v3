import Link from 'next/link'

import { SectionFigure, type FigureName } from '~/components/washi-art'
import { toRoman } from '~/lib/roman'
import { cn } from '~/lib/utils'

// One homepage section on the manual grid: the numbered title (run
// vertically in the margin on wide screens), its plate figure in the
// corner, a hairline that draws in, the content, then the way onward.
export function HomeSection({
  index,
  id,
  title,
  figure,
  action,
  wide = false,
  children,
}: {
  index: number
  id: string
  title: string
  figure: FigureName
  action?: React.ReactNode
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={cn('home-section', wide && 'home-section-wide')} aria-labelledby={id}>
      <h2 id={id} className="home-section-title">
        <span className="home-section-numeral" aria-hidden>
          {toRoman(index)}
        </span>
        <span>{title}</span>
      </h2>
      <SectionFigure name={figure} className="home-section-figure" />
      <span className="home-section-rule" aria-hidden />
      <div className="home-section-body">{children}</div>
      {action ? <div className="home-section-action">{action}</div> : null}
    </section>
  )
}

/** "All projects", "All writing": the way onward from a section. */
export function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="section-link ink-link">
      {children}
      <span aria-hidden> →</span>
    </Link>
  )
}
