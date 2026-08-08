import type { CSSProperties } from 'react'

import { SectionTag } from '~/components/section-tag'

// Curated from the verified resume registry. This is the homepage signal,
// not an exhaustive list of every language or tool in the resume.
const homepageTechStack = [
  {
    label: 'Product surfaces',
    items: ['Next.js', 'React', 'React Native', 'TypeScript'],
  },
  {
    label: 'Services & runtime',
    items: ['Node.js', 'Express', 'REST APIs', 'Socket.io', 'background jobs'],
  },
  {
    label: 'Data & performance',
    items: ['PostgreSQL', 'Drizzle ORM', 'Redis', 'indexing', 'query optimization'],
  },
  {
    label: 'Delivery & quality',
    items: ['Docker', 'GitHub Actions', 'NGINX', 'PM2', 'AWS', 'Jest', 'Vitest'],
  },
] as const

export function TechStackSection({ index }: { index: number }) {
  return (
    <section className="tech-stack-section mt-16" aria-labelledby="tech-stack-title">
      <div className="flex items-end justify-between gap-4">
        <SectionTag index={index} id="tech-stack-title">
          Tech stack
        </SectionTag>
        <span className="tech-stack-meta">Selected systems</span>
      </div>

      <ul className="tech-stack-register mt-4" aria-label="Saikat's selected technical stack">
        {homepageTechStack.map((group, groupIndex) => (
          <li
            key={group.label}
            className="tech-stack-row"
            style={{ '--tech-index': groupIndex } as CSSProperties}
          >
            <span className="tech-stack-index" aria-hidden>
              {String(groupIndex + 1).padStart(2, '0')}
            </span>
            <h3 className="tech-stack-label">{group.label}</h3>
            <ul className="tech-stack-items" aria-label={`${group.label} technologies`}>
              {group.items.map((item) => (
                <li key={item} className="tech-stack-item">
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
