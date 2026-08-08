'use client'

import { ExternalLabel } from '~/components/external-mark'

export function ResumeActions({ resumeUrl }: { resumeUrl: string | null }) {
  return (
    <div className="resume-actions">
      <button type="button" className="btn-cta" onClick={() => window.print()}>
        Print / save PDF
      </button>
      {resumeUrl ? (
        <a href={resumeUrl} target="_blank" rel="noreferrer" className="resume-pdf-link">
          <ExternalLabel>Download original PDF</ExternalLabel>
        </a>
      ) : (
        <span className="resume-pdf-muted">Original PDF unavailable</span>
      )}
    </div>
  )
}
