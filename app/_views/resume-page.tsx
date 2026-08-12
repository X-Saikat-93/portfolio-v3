import Link from 'next/link'

import { ExternalLabel } from '~/components/external-mark'
import { ResumeActions } from '~/components/resume-actions'
import { resumeProfile } from '~/lib/personal'

function ResumeSection({
  index,
  title,
  children,
}: {
  index: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="resume-section">
      <div className="resume-section-heading">
        <span aria-hidden="true">{index}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  )
}

type ResumeProject = {
  name: string
  url?: string
  stack: string
  bullets: readonly string[]
}

type ResumeRole = {
  title: string
  company: string
  period: string
  projects: readonly ResumeProject[]
}

function ResumeExperienceList({ roles }: { roles: readonly ResumeRole[] }) {
  return (
    <div className="resume-experience-list">
      {roles.map((role) => (
        <article key={`${role.title}-${role.company}`} className="resume-role">
          <header className="resume-role-header">
            <div>
              <h3>{role.title}</h3>
              <p>{role.company}</p>
            </div>
            <time>{role.period}</time>
          </header>
          <div className="resume-role-projects">
            {role.projects.map((project) => (
              <div key={project.name} className="resume-project">
                <div className="resume-project-heading">
                  <div>
                    <h4>{project.name}</h4>
                    {project.stack ? <p>{project.stack}</p> : null}
                  </div>
                  {project.url ? (
                    <a href={project.url} target="_blank" rel="noreferrer" className="resume-project-link">
                      Live: {project.url.replace(/^https?:\/\//, '')}
                    </a>
                  ) : null}
                </div>
                <ul>
                  {project.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

export function ResumePageView({ resumeUrl }: { resumeUrl: string | null }) {
  return (
    <article className="resume-page mx-auto w-full max-w-[64rem] px-6">
      <div className="resume-utility enter">
        <Link href="/en" className="resume-back-link">
          <span aria-hidden="true">←</span> Back to portfolio
        </Link>
        <ResumeActions resumeUrl={resumeUrl} />
      </div>

      <div className="resume-document enter-swing">
        <header className="resume-header">
          <div className="resume-nameplate">
            <p className="resume-kicker">Curriculum vitae / HTML edition</p>
            <h1>{resumeProfile.name}</h1>
            <p>{resumeProfile.title}</p>
            <p className="resume-headline">{resumeProfile.headline}</p>
          </div>
          <div className="resume-header-mark" aria-hidden="true">
            <span>TEXT</span>
            <span>A4</span>
            <span>2026</span>
          </div>
          <address className="resume-contact">
            <a href={`mailto:${resumeProfile.email}`}>{resumeProfile.email}</a>
            <a href={`tel:${resumeProfile.phone.replace(/\s/g, '')}`}>{resumeProfile.phone}</a>
            <span>{resumeProfile.location}</span>
            <a href={resumeProfile.portfolioUrl} target="_blank" rel="noreferrer">
              <ExternalLabel>xsaikat.vercel.app</ExternalLabel>
            </a>
            <a href={resumeProfile.githubUrl} target="_blank" rel="noreferrer">
              <ExternalLabel>github.com/X-Saikat-93</ExternalLabel>
            </a>
          </address>
        </header>

        <div className="resume-layout">
          <div className="resume-main-column">
            <ResumeSection index="01" title="Professional experience">
              <ResumeExperienceList roles={resumeProfile.experience} />
            </ResumeSection>

            <ResumeSection index="02" title="Additional experience">
              <ResumeExperienceList roles={resumeProfile.additionalExperience} />
            </ResumeSection>
          </div>

          <aside className="resume-side-column">
            <ResumeSection index="03" title="Technical skills">
              <dl className="resume-skills">
                {resumeProfile.skills.map((group) => (
                  <div key={group.label}>
                    <dt>{group.label}</dt>
                    <dd>{group.items.join(' · ')}</dd>
                  </div>
                ))}
              </dl>
            </ResumeSection>

            <ResumeSection index="04" title="Education">
              <div className="resume-education-list">
                {resumeProfile.education.map((item) => (
                  <div key={item.title} className="resume-education-item">
                    <h3>{item.title}</h3>
                    <p>{item.institution}</p>
                    <time>{item.period}</time>
                  </div>
                ))}
              </div>
            </ResumeSection>

            <ResumeSection index="05" title="Certifications">
              <ul className="resume-certifications">
                {resumeProfile.certifications.map((certification) => (
                  <li key={certification}>{certification}</li>
                ))}
              </ul>
            </ResumeSection>
          </aside>
        </div>
      </div>
    </article>
  )
}
