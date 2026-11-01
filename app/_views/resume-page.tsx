import Link from 'next/link'

import { ExternalLabel } from '~/components/external-mark'
import { ResumeActions } from '~/components/resume-actions'
import { RevealScope } from '~/components/reveal-scope'
import { resumeProfile } from '~/lib/personal'

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="resume-section">
      <h2 className="resume-section-heading">{title}</h2>
      {children}
    </section>
  )
}

type ResumeProject = {
  name: string
  url?: string
  /** what the link opens; a live product by default */
  linkLabel?: string
  stack: string
  bullets: readonly string[]
}

function ResumeProjectBlock({ project }: { project: ResumeProject }) {
  return (
    <div className="resume-project">
      <div className="resume-project-heading">
        <div>
          <h4>{project.name}</h4>
          {project.stack ? <p>{project.stack}</p> : null}
        </div>
        {project.url ? (
          <a href={project.url} target="_blank" rel="noreferrer" className="resume-project-link">
            {project.linkLabel ?? 'Live'}: {project.url.replace(/^https?:\/\//, '')}
          </a>
        ) : null}
      </div>
      <ul>
        {project.bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  )
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
        <article
          key={`${role.title}-${role.company}`}
          className="resume-role"
          data-current={/present/i.test(role.period) ? '' : undefined}
        >
          <span className="resume-role-node" aria-hidden="true" />
          <header className="resume-role-header">
            <div>
              <h3>{role.title}</h3>
              <p>{role.company}</p>
            </div>
            <time>{role.period}</time>
          </header>
          <div className="resume-role-projects">
            {role.projects.map((project) => (
              <ResumeProjectBlock key={project.name} project={project} />
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

export function ResumePageView({ resumeUrl }: { resumeUrl: string | null }) {
  return (
    <article className="page resume-page">
      <div className="resume-utility">
        <Link href="/en" className="resume-back-link">
          <span aria-hidden="true">←</span> Back to portfolio
        </Link>
        <ResumeActions resumeUrl={resumeUrl} />
      </div>

      <div className="resume-document paper">
        <header className="resume-header">
          <div className="resume-nameplate">
            <h1>{resumeProfile.name}</h1>
            <p className="resume-title">{resumeProfile.title}</p>
            <p className="resume-headline">{resumeProfile.headline}</p>
          </div>
          <address className="resume-contact">
            <a href={`mailto:${resumeProfile.email}`}>{resumeProfile.email}</a>
            {/* a masked number would dial nothing; list it only once it is real */}
            {/^\+?[\d\s-]+$/.test(resumeProfile.phone) ? (
              <a href={`tel:${resumeProfile.phone.replace(/\s/g, '')}`}>{resumeProfile.phone}</a>
            ) : null}
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
          <RevealScope className="resume-main-column">
            <ResumeSection title="Professional experience">
              <ResumeExperienceList roles={resumeProfile.experience} />
            </ResumeSection>

            <ResumeSection title="Open-source projects">
              <div className="resume-role-projects">
                {resumeProfile.openSource.map((project) => (
                  <ResumeProjectBlock key={project.name} project={project} />
                ))}
              </div>
            </ResumeSection>

            <ResumeSection title="Additional experience">
              <ResumeExperienceList roles={resumeProfile.additionalExperience} />
            </ResumeSection>
          </RevealScope>

          <RevealScope as="aside" className="resume-side-column">
            <ResumeSection title="Technical skills">
              <dl className="resume-skills">
                {resumeProfile.skills.map((group) => (
                  <div key={group.label}>
                    <dt>{group.label}</dt>
                    <dd>{group.items.join(' · ')}</dd>
                  </div>
                ))}
              </dl>
            </ResumeSection>

            <ResumeSection title="Education">
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

            <ResumeSection title="Certifications">
              <ul className="resume-certifications">
                {resumeProfile.certifications.map((certification) => (
                  <li key={certification}>{certification}</li>
                ))}
              </ul>
            </ResumeSection>
          </RevealScope>
        </div>
      </div>
    </article>
  )
}
