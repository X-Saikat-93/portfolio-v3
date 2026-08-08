'use client'

import { CloudinaryAvatar } from '~/components/cloudinary-image'
import { ExternalLabel } from '~/components/external-mark'
import { SitePreviewCard } from '~/components/preview-card-timing'
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

export function GitHubGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden
      className="service-card-glyph"
    >
      <path
        fill="currentColor"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    </svg>
  )
}

export function LinkedInGlyph({
  size = 16,
  className = 'service-card-glyph',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden
      className={className}
    >
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  )
}

function Card({
  trigger,
  href,
  children,
  className,
  triggerClassName = 'footer-tree-link',
}: {
  trigger: React.ReactNode
  href: string
  children: React.ReactNode
  className: string
  triggerClassName?: string
}) {
  return (
    <SitePreviewCard
      href={href}
      target="_blank"
      rel="noreferrer"
      triggerClassName={triggerClassName}
      closeDelay={120}
      popupClassName={className}
      popup={children}
      side="top"
    >
      <ExternalLabel>{trigger}</ExternalLabel>
    </SitePreviewCard>
  )
}

export function GitHubCardBody({ data }: { data: GitHubSnapshot }) {
  const levels = data.levels?.slice(-WEEKS * DAYS) ?? ''
  return (
    <>
      {levels ? (
        <span className="contrib-grid" aria-hidden>
          {Array.from({ length: WEEKS }, (_, week) => (
            <span key={week} className="contrib-col">
              {Array.from({ length: DAYS }, (_, day) => {
                const index = week * DAYS + day
                return (
                  <i
                    key={day}
                    data-level={levels[index] ?? '0'}
                    style={{ '--ci': index } as React.CSSProperties}
                  />
                )
              })}
            </span>
          ))}
        </span>
      ) : null}
      <span className="service-card-stat">
        {data.total != null ? (
          <span>
            <b>{data.total.toLocaleString()}</b> <T zh="次贡献" en="contributions" />
          </span>
        ) : null}
        {data.publicRepos != null ? (
          <span>
            <b>{data.publicRepos}</b> <T zh="个公开仓库" en="public repositories" />
          </span>
        ) : null}
        {data.followers != null ? (
          <span>
            <b>{data.followers}</b> <T zh="关注者" en="followers" />
          </span>
        ) : null}
        <GitHubGlyph />
      </span>
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
      className="link-card service-card"
      triggerClassName={triggerClassName}
    >
      <span className="service-card-head">
        <CloudinaryAvatar alt="Saikat Das" className="service-card-avatar" />
        <span className="service-card-names">
          <span className="service-card-name">Saikat Das</span>
          <span className="service-card-sub">@{data.user}</span>
        </span>
        <GitHubGlyph />
      </span>
      <span className="service-card-bio">
        <T
          zh="Product engineer building web products end to end."
          en="Product engineer building web products end to end."
        />
      </span>
      <GitHubCardBody data={data} />
    </Card>
  )
}

export function LinkedInCardBody() {
  return (
    <>
      <span className="linkedin-card-banner" aria-hidden>
        <LinkedInGlyph size={34} className="linkedin-card-banner-glyph" />
      </span>
      <span className="linkedin-card-head">
        <CloudinaryAvatar alt="Saikat Das" className="linkedin-card-avatar" />
        <span className="linkedin-card-names">
          <span className="linkedin-card-name">Saikat Das</span>
          <span className="linkedin-card-sub">
            <T zh="产品工程师 · 印度" en="Product Engineer · India" />
          </span>
        </span>
      </span>
      <ul className="linkedin-card-roles">
        {experience.map((job) => (
          <li key={job.company} className="linkedin-card-role">
            <span className="linkedin-card-role-line">
              <span className="linkedin-card-role-dot" aria-hidden />
              <span className="linkedin-card-role-title">
                <T zh={job.role} en={job.roleEn ?? job.role} />
              </span>
              <span className="linkedin-card-role-period">
                {job.from}—{job.to ?? <T zh="现在" en="now" />}
              </span>
            </span>
            <span className="linkedin-card-role-company">
              <T zh={job.company} en={job.companyEn} />
            </span>
          </li>
        ))}
      </ul>
      <span className="linkedin-card-foot">
        <span className="linkedin-card-badge">
          <span className="linkedin-card-badge-dot" aria-hidden />
          <T zh="开放远程" en="Open to Remote" />
        </span>
        <LinkedInGlyph size={18} className="linkedin-card-foot-glyph" />
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
      className="link-card linkedin-card"
      triggerClassName={triggerClassName}
    >
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
    <SitePreviewCard
      href={`mailto:${address}`}
      triggerClassName={triggerClassName}
      closeDelay={120}
      popupClassName="link-card email-envelope-card"
      side="top"
      popup={
        <span className="email-envelope" aria-hidden>
          <span className="email-envelope-flap" />
          <span className="email-envelope-return">
            <span>FROM</span>
            SAIKAT DAS
            <br />
            INDIA
          </span>
          <span className="email-envelope-stamps">
            <span className="email-envelope-stamp email-envelope-stamp-portrait">
              <CloudinaryAvatar alt="" width={32} height={32} />
              <span>SAIKAT · 26</span>
            </span>
            <span className="email-envelope-stamp email-envelope-stamp-mark">
              <span className="email-envelope-stamp-star">✦</span>
              <span>POST · 26</span>
            </span>
          </span>
          <span className="email-envelope-postmark" />
          <span className="email-envelope-address">
            <span><T zh="收" en="TO" /></span>
            {address}
          </span>
        </span>
      }
    >
      {trigger}
    </SitePreviewCard>
  )
}
