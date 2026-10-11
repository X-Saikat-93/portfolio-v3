import { GeistPixelCircle, GeistPixelSquare } from 'geist/font/pixel'

import { Barcode } from '~/components/barcode'

const digitFaces = [GeistPixelSquare, GeistPixelCircle, GeistPixelSquare]

/* The shared print-proof sheet behind the 403, 404, and 500 pages. */
export function ErrorProof({
  code,
  meta,
  status,
  title,
  body,
  children,
}: {
  code: string
  /** the second and third registration labels, after `ERR / {code}` */
  meta: [React.ReactNode, React.ReactNode]
  /** the footer's middle label, e.g. `NO IMPRESSION` */
  status: React.ReactNode
  title: React.ReactNode
  body: React.ReactNode
  /** the recovery actions */
  children: React.ReactNode
}) {
  const titleId = `error-${code}-title`
  return (
    <div className="error-sheet mx-auto w-full max-w-[37.5rem] px-6">
      <section className="error-proof" aria-labelledby={titleId}>
        <div className="error-proof-meta" aria-hidden>
          <span>ERR / {code}</span>
          <span>{meta[0]}</span>
          <span>{meta[1]}</span>
        </div>

        <div className="error-registration" aria-hidden>
          <span />
        </div>

        <div className="error-code" aria-hidden>
          {[...code].map((digit, index) => (
            <span key={index} className={digitFaces[index % 3].className}>
              {digit}
            </span>
          ))}
        </div>

        <span className="error-loose-pixel error-loose-pixel-a" aria-hidden />
        <span className="error-loose-pixel error-loose-pixel-b" aria-hidden />
        <span className="error-loose-pixel error-loose-pixel-c" aria-hidden />

        <div className="error-message">
          <h1 id={titleId} className="text-sm font-semibold">
            {title}
          </h1>
          <p className="mt-2 max-w-[23rem] text-sm leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>

        <nav className="error-actions flex flex-wrap gap-3" aria-label="Error recovery">
          {children}
        </nav>

        <Barcode code={`ERR-${code}-SAIKAT`} className="error-barcode" />

        <div className="error-proof-footer font-mono" aria-hidden>
          <span>ORIGIN</span>
          <span>{status}</span>
          <span>EDGE</span>
        </div>
      </section>
    </div>
  )
}
