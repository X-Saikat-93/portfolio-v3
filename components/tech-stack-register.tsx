import type { CSSProperties } from 'react'

import { resumeProfile } from '~/lib/personal'

// The full verified skills registry from the resume, so the homepage and the
// resume never drift apart.
const techStack = resumeProfile.skills

export function TechStackRegister() {
  return (
    <ul className="tech-stack-register" aria-label="Saikat's technical stack">
      {techStack.map((group, groupIndex) => (
        <li
          key={group.label}
          className="tech-stack-group"
          style={{ '--g': groupIndex } as CSSProperties}
        >
          <h3 className="tech-stack-label">{group.label}</h3>
          <ul className="tech-stack-items" aria-label={`${group.label} technologies`}>
            {group.items.map((item, itemIndex) => (
              <li
                key={item}
                className="tech-stack-item"
                style={{ '--i': itemIndex } as CSSProperties}
              >
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
