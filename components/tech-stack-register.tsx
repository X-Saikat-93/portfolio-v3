import { resumeProfile } from '~/lib/personal'

// The verified skills registry from the resume, set as a letterpress type
// specimen: one ruled line per group, its tools pressed in display type.
// The resume and the homepage never drift apart.
export function TechStackRegister() {
  return (
    <div className="specimen">
      {resumeProfile.skills.map((group) => (
        <div key={group.label} className="specimen-row">
          <h3 className="specimen-label">{group.label}</h3>
          <ul className="specimen-items">
            {group.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
