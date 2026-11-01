import { resumeProfile } from '~/lib/personal'

// The verified skills registry from the resume as a manual's spec sheet, so
// the homepage and the resume never drift apart.
export function TechStackRegister() {
  return (
    <dl className="spec-sheet" aria-label="Saikat's technical stack">
      {resumeProfile.skills.map((group) => (
        <div key={group.label} className="spec-row">
          <dt>{group.label}</dt>
          <dd>{group.items.join(' · ')}</dd>
        </div>
      ))}
    </dl>
  )
}
