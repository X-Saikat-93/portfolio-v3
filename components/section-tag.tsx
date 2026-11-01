import { toRoman } from '~/lib/roman'
import { cn } from '~/lib/utils'

// A section heading in the manual register: a roman numeral, then the
// title. Shared by the homepage and the other public routes.
export function SectionTag({
  index,
  id,
  className,
  children,
}: {
  index: number
  id?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <h2 id={id} className={cn('section-tag', className)}>
      <span className="section-tag-index" aria-hidden>
        {toRoman(index)}
      </span>
      <span className="section-tag-label">{children}</span>
    </h2>
  )
}
