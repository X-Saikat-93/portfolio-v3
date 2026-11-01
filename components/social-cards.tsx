'use client'

import { CloudinaryAvatar } from '~/components/cloudinary-image'
import { ExternalLabel } from '~/components/external-mark'
import { SitePreviewCard } from '~/components/preview-card-timing'
import { Seal } from '~/components/washi-art'
import { T } from '~/lib/i18n'
import { experience } from '~/lib/personal'

export interface GitHubSnapshot {
  user: string
  followers?: number
  publicRepos?: number
  total?: number
  to?: string
  levels?: string
  weeks?: number[]
  dates?: string[]
  counts?: number[]
}

const WEEKS = 26
const DAYS = 7

function Card({
  trigger,
  href,
  children,
  label,
  triggerClassName = 'footer-tree-link',
  external = true,
}: {
  trigger: React.ReactNode
  href: string
  children: React.ReactNode
  /** the service, e.g. `calling-card-github` */
  label: string
  triggerClassName?: string
  external?: boolean
}) {
  return (
    <SitePreviewCard
      href={href}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      triggerClassName={triggerClassName}
      closeDelay={120}
      popupClassName={`link-card calling-card ${label}`}
      popup={children}
      side="top"
    >
      {external ? <ExternalLabel>{trigger}</ExternalLabel> : trigger}
    </SitePreviewCard>
  )
}

// One calling card per service, printed on the site's paper: a registration
// label, the name with the seal pressed beside it, then what the service
// holds. Rows ink in once per open; see social-cards.css.
function CardLabel({ service, handle }: { service: string; handle: string }) {
  return (
    <span className="calling-card-label">
      <span>{service}</span>
      <span className="calling-card-handle">{handle}</span>
    </span>
  )
}

function CardIdentity({ sub }: { sub: React.ReactNode }) {
  return (
    <span className="calling-card-identity">
      <CloudinaryAvatar alt="" className="calling-card-avatar" />
      <span className="calling-card-names">
        <span className="calling-card-name">Saikat Das</span>
        <span className="calling-card-sub">{sub}</span>
      </span>
      <Seal className="calling-card-seal" />
    </span>
  )
}

export function GitHubCardBody({ data }: { data: GitHubSnapshot }) {
  const levels = data.levels?.slice(-WEEKS * DAYS) ?? ''
  // a zero reads as an empty shelf, not a fact worth showing
  const stats = (
    [
      [data.total, 'contributions'],
      [data.publicRepos, 'public repositories'],
      [data.followers, 'followers'],
    ] satisfies [number | undefined, string][]
  ).filter((stat): stat is [number, string] => (stat[0] ?? 0) > 0)
  return (
    <>
      {levels ? (
        <span className="contrib-grid calling-card-row" aria-hidden>
          {Array.from({ length: WEEKS }, (_, week) => (
            <span key={week} className="contrib-col">
              {Array.from({ length: DAYS }, (_, day) => {
                return (
                  <i
                    key={day}
                    data-level={levels[week * DAYS + day] ?? '0'}
                    style={{ '--w': week, '--d': day } as React.CSSProperties}
                  />
                )
              })}
            </span>
          ))}
        </span>
      ) : null}
      {stats.length ? (
        <span className="calling-card-stats calling-card-row">
          {stats.map(([value, label]) => (
            <span key={label} className="calling-card-stat">
              <b>{value.toLocaleString()}</b>
              <span>{label}</span>
            </span>
          ))}
        </span>
      ) : null}
    </>
  )
}

export function GitHubCard({
  data,
  trigger = 'GitHub',
  triggerClassName,
}: {
  data: GitHubSnapshot
  trigger?: React.ReactNode
  triggerClassName?: string
}) {
  return (
    <Card
      trigger={trigger}
      href={`https://github.com/${data.user}`}
      label="calling-card-github"
      triggerClassName={triggerClassName}
    >
      <CardLabel service="GitHub" handle={`@${data.user}`} />
      <CardIdentity
        sub={
          <T
            zh="Full-stack software engineer building web products end to end."
            en="Full-stack software engineer building web products end to end."
          />
        }
      />
      <GitHubCardBody data={data} />
    </Card>
  )
}

export function LinkedInCardBody() {
  return (
    <>
      <CardIdentity
        sub={<T zh="全栈软件工程师 · 印度" en="Full-Stack Software Engineer · India" />}
      />
      <ul className="calling-card-roles calling-card-row">
        {experience.map((job, index) => (
          <li
            key={job.company}
            className="calling-card-role"
            data-current={job.to ? undefined : ''}
            style={{ '--i': index } as React.CSSProperties}
          >
            <span className="calling-card-role-line">
              <span className="calling-card-role-title">
                <T zh={job.role} en={job.roleEn ?? job.role} />
              </span>
              <span className="calling-card-role-period">
                {job.from} – {job.to ?? <T zh="现在" en="now" />}
              </span>
            </span>
            <span className="calling-card-role-company">
              <T zh={job.company} en={job.companyEn} />
            </span>
          </li>
        ))}
      </ul>
      <span className="calling-card-foot calling-card-row">
        <span className="status-dot" aria-hidden />
        <T zh="开放远程" en="Open to Remote" />
      </span>
    </>
  )
}

export function LinkedInCard({
  trigger = 'LinkedIn',
  triggerClassName,
}: {
  trigger?: React.ReactNode
  triggerClassName?: string
}) {
  return (
    <Card
      trigger={trigger}
      href="https://www.linkedin.com/in/saikat933/"
      label="calling-card-linkedin"
      triggerClassName={triggerClassName}
    >
      <CardLabel service="LinkedIn" handle="in/saikat933" />
      <LinkedInCardBody />
    </Card>
  )
}

export function EmailCard({
  address,
  trigger = 'Email',
  triggerClassName = 'footer-tree-link',
}: {
  address: string
  trigger?: React.ReactNode
  triggerClassName?: string
}) {
  return (
    <Card
      trigger={trigger}
      href={`mailto:${address}`}
      label="calling-card-email"
      triggerClassName={triggerClassName}
      external={false}
    >
      <CardLabel service="Post" handle="India · UTC+5:30" />
      <CardIdentity sub={<T zh="写信" en="Write to" />} />
      <span className="calling-card-address calling-card-row">{address}</span>
      <span className="calling-card-foot calling-card-row">
        <T zh="打开你的邮件应用" en="Opens your mail app" />
      </span>
    </Card>
  )
}
