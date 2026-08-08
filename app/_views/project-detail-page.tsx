import Link from 'next/link'

import { ExternalLabel } from '~/components/external-mark'
import { GhostSchematic } from '~/components/ghost-schematic'
import { PixelCluster } from '~/components/pixel-cluster'
import type { Project } from '~/lib/projects'
import { projectPath } from '~/lib/projects'

function SectionHeading({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <div className="project-dossier-section-heading">
      <span aria-hidden="true">{index}</span>
      <h2>{children}</h2>
    </div>
  )
}

export function ProjectDetailPage({
  project,
  position,
  total,
  previous,
  next,
}: {
  project: Project
  position: number
  total: number
  previous?: Project
  next?: Project
}) {
  const caseNumber = String(position).padStart(2, '0')
  const caseTotal = String(total).padStart(2, '0')

  return (
    <article className="project-dossier relative mx-auto w-full max-w-[37.5rem] px-6">
      <GhostSchematic className="project-dossier-ghost hidden sm:block" />

      <nav className="project-dossier-register enter" aria-label="Project context">
        <Link href="/en/projects" className="project-dossier-back">
          <span aria-hidden="true">←</span> Project register
        </Link>
        <span className="project-dossier-case">
          Case file {caseNumber} / {caseTotal}
        </span>
      </nav>

      <header className="project-dossier-header">
        <div className="project-dossier-mast enter" style={{ '--enter-delay': '50ms' } as React.CSSProperties}>
          <div>
            <p className="project-dossier-kicker">{project.category}</p>
            <h1>{project.nameEn}</h1>
          </div>
          <PixelCluster variant={position + 2} className="shrink-0" />
        </div>

        <p
          className="project-dossier-lede enter"
          style={{ '--enter-delay': '90ms' } as React.CSSProperties}
        >
          {project.descriptionEn ?? project.description}
        </p>

        <div
          className="project-dossier-actions enter"
          style={{ '--enter-delay': '130ms' } as React.CSSProperties}
        >
          {project.links.map((link) => (
            <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
              <ExternalLabel>{link.label}</ExternalLabel>
            </a>
          ))}
        </div>
      </header>

      <dl
        className="project-dossier-facts enter"
        style={{ '--enter-delay': '170ms' } as React.CSSProperties}
      >
        <div>
          <dt>Role</dt>
          <dd>{project.role}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{project.status}</dd>
        </div>
        <div>
          <dt>Surface</dt>
          <dd>{project.scope}</dd>
        </div>
        <div>
          <dt>Primary stack</dt>
          <dd>{project.stack.slice(0, 3).join(' · ')}</dd>
        </div>
      </dl>

      <section
        className="project-system-plate enter"
        aria-labelledby="project-system-title"
        style={{ '--enter-delay': '210ms' } as React.CSSProperties}
      >
        <div className="project-system-plate-header">
          <h2 id="project-system-title">System trace</h2>
          <span>{project.flow.length ? `${project.flow.length} stages` : 'record only'}</span>
        </div>
        {project.flow.length ? (
          <ol className="project-system-flow">
            {project.flow.map((stage, index) => (
              <li key={stage}>
                <span className="project-system-node" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="project-system-label">{stage}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="project-system-record">
            The public branch documents an early interface foundation; no unverified system flow is shown.
          </p>
        )}
      </section>

      <section className="project-dossier-section">
        <SectionHeading index="01">Overview</SectionHeading>
        <div className="project-dossier-prose">
          {project.overview.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="project-dossier-section">
        <SectionHeading index="02">Product surface</SectionHeading>
        <ol className="project-capability-list">
          {project.capabilities.map((capability, index) => (
            <li key={capability}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <p>{capability}</p>
            </li>
          ))}
        </ol>
      </section>

      {project.notes.length ? (
        <section className="project-dossier-section">
          <SectionHeading index="03">Engineering notes</SectionHeading>
          <div className="project-note-register">
            {project.notes.map((note, index) => (
              <article key={note.title}>
                <span aria-hidden="true">N{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h3>{note.title}</h3>
                  <p>{note.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="project-dossier-section">
        <SectionHeading index={project.notes.length ? '04' : '03'}>Build register</SectionHeading>
        <ul className="project-stack-register" aria-label="Technology stack">
          {project.stack.map((technology, index) => (
            <li key={technology}>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              {technology}
            </li>
          ))}
        </ul>
        <p className="project-dossier-source-note">
          This record describes only behavior visible in the live product, local engineering record, or linked public source.
        </p>
      </section>

      <nav className="project-dossier-pager hairline-top" aria-label="Adjacent projects">
        {previous ? (
          <Link href={projectPath(previous.id)} rel="prev">
            <span>Previous case</span>
            <strong>← {previous.nameEn}</strong>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
        {next ? (
          <Link href={projectPath(next.id)} rel="next">
            <span>Next case</span>
            <strong>{next.nameEn} →</strong>
          </Link>
        ) : (
          <Link href="/en/projects">
            <span>End of register</span>
            <strong>All projects →</strong>
          </Link>
        )}
      </nav>
    </article>
  )
}
