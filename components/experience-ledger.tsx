import { ExternalLabel } from '~/components/external-mark'
import { experience } from '~/lib/personal'

// A stamped ledger strip: one ruled row per role on a perforated paper
// strip, dates set in pressed type, the current role stamped in vermilion.
export function ExperienceLedger() {
  return (
    <ol className="ledger">
      {experience.map((job) => (
        <li key={job.company} className="ledger-row" data-current={job.to ? undefined : ''}>
          <span className="ledger-entry">
            <span className="ledger-role">{job.roleEn ?? job.role}</span>
            {job.url ? (
              <a href={job.url} target="_blank" rel="noreferrer" className="ledger-company ink-link">
                <ExternalLabel>{job.companyEn}</ExternalLabel>
              </a>
            ) : (
              <span className="ledger-company">{job.companyEn}</span>
            )}
          </span>
          {job.to ? null : (
            <span className="ledger-stamp" aria-hidden="true">
              Now
            </span>
          )}
          <span className="ledger-dates">
            {job.from}
            <span aria-hidden> – </span>
            <span className="sr-only"> to </span>
            {job.to ?? 'present'}
            {job.to ? null : <span className="sr-only">, current role</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}
