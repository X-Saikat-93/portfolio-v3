import type { CSSProperties } from 'react'

import { RegistrationMark, Seal } from '~/components/washi-art'

const delay = (ms: number) => ({ '--enter-delay': `${ms}ms` }) as CSSProperties

/* The shared blank sheet behind the 403, 404, and 500 pages: the code as a
   faint print with the seal pressed beside it, what happened, and a calm
   way home. */
export function ErrorProof({
  code,
  meta,
  status,
  title,
  body,
  detail,
  onward,
  children,
}: {
  code: string
  /** the second and third registration labels, after `ERR / {code}` */
  meta: [React.ReactNode, React.ReactNode]
  /** the foot label, e.g. `NO IMPRESSION` */
  status: React.ReactNode
  title: React.ReactNode
  body: React.ReactNode
  /** a line under the body, e.g. the address that was asked for */
  detail?: React.ReactNode
  /** further places to go, set under the actions */
  onward?: React.ReactNode
  /** the recovery actions */
  children: React.ReactNode
}) {
  const titleId = `error-${code}-title`
  return (
    <div className="error-sheet">
      <section className="error-proof paper-grain" aria-labelledby={titleId}>
        <div className="error-proof-meta" aria-hidden>
          <span>ERR / {code}</span>
          <span>{meta[0]}</span>
          <span>{meta[1]}</span>
        </div>

        <div className="error-plate enter" aria-hidden>
          <span className="error-code">{code}</span>
          <Seal className="error-seal" />
        </div>

        <div className="error-message">
          <h1 id={titleId} className="error-title enter" style={delay(60)}>
            {title}
          </h1>
          <p className="error-body enter" style={delay(120)}>
            {body}
          </p>
          {detail ? (
            <p className="error-detail enter" style={delay(160)}>
              {detail}
            </p>
          ) : null}
        </div>

        <nav className="error-actions enter" style={delay(200)} aria-label="Error recovery">
          {children}
        </nav>

        {onward}

        <div className="error-proof-footer" aria-hidden>
          <span>{status}</span>
          <RegistrationMark />
        </div>
      </section>
    </div>
  )
}
