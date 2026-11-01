import { cn } from '~/lib/utils'

// The print shop's own vocabulary, drawn in ink: the SD seal, the sun, the
// plate figures beside each section, and the colophon's printer's device.
// Server-rendered SVG, coloured only through tokens, always decorative.

/** Shared filters, rendered once per document and referenced by id. */
export function WashiArtDefs() {
  return (
    <svg className="washi-art-defs" aria-hidden="true" focusable="false">
      <defs>
        {/* stamped ink: a slightly bitten edge and a few unprinted specks */}
        <filter id="washi-stamp" x="-6%" y="-6%" width="112%" height="112%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.1" xChannelSelector="R" yChannelSelector="G" result="bitten" />
          <feColorMatrix in="noise" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.4 1.9" result="specks" />
          <feComposite in="bitten" in2="specks" operator="in" />
        </filter>
        {/* the woodblock sun: a paper-grain edge and pigment pooled along the grain */}
        <filter id="washi-sun" x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="7" result="edge" />
          <feDisplacementMap in="SourceGraphic" in2="edge" scale="5" xChannelSelector="R" yChannelSelector="B" result="disc" />
          <feTurbulence type="fractalNoise" baseFrequency="0.005 0.2" numOctaves="2" seed="11" result="grain" />
          <feColorMatrix in="grain" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.55 -0.2" result="pool" />
          <feComposite in="pool" in2="disc" operator="in" result="pooled" />
          <feMerge>
            <feMergeNode in="disc" />
            <feMergeNode in="pooled" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  )
}

/** The SD hanko: site mark, active-route marker, success stamp, signature. */
export function Seal({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn('seal', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <g filter="url(#washi-stamp)">
        <rect className="seal-ground" x="1" y="1" width="30" height="30" rx="2" />
        <rect className="seal-border" x="3.5" y="3.5" width="25" height="25" rx="1" />
        <text className="seal-mark" x="16" y="20.25" textAnchor="middle">
          SD
        </text>
      </g>
    </svg>
  )
}

/** The one loud element: printed once, behind the hero portrait. */
export function Sun({ className }: { className?: string }) {
  return (
    <span className={cn('washi-sun', className)} aria-hidden="true">
      <svg viewBox="0 0 400 400" focusable="false">
        <circle className="washi-sun-disc" cx="200" cy="200" r="184" filter="url(#washi-sun)" />
      </svg>
    </span>
  )
}

/** A registration target, the printer's alignment mark. */
export function RegistrationMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('registration-mark', className)} aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="4.5" />
      <path d="M8 0v16M0 8h16" />
    </svg>
  )
}

export type FigureName = 'ledger' | 'plates' | 'manuscript' | 'mats' | 'type-case' | 'density' | 'letter'

// 96 × 64 line drawings, one per homepage section; the single filled square
// in each is the seal at dot scale.
const FIGURES: Record<FigureName, React.ReactNode> = {
  ledger: (
    <>
      <path d="M8 14h80M8 26h80M8 38h80M8 50h80M22 6v52" />
      <path d="M70 6v20l4-3.5 4 3.5V6" />
      <path className="figure-faint" d="M28 20h22M28 32h30M28 44h18M28 56h26" />
      <rect className="figure-seal" x="12" y="44" width="5" height="5" />
    </>
  ),
  plates: (
    <>
      <path d="M48 8 82 24 48 40 14 24Z" />
      <path d="M14 33l34 16 34-16M14 42l34 16 34-16" />
      <path className="figure-faint" d="M48 40v18M14 24v18M82 24v18" />
      <path className="figure-faint" d="M31 24h34M48 16v16" />
      <rect className="figure-seal" x="45.5" y="21.5" width="5" height="5" />
    </>
  ),
  manuscript: (
    <>
      <path d="M26 6h36l10 10v42H26Z" />
      <path d="M62 6v10h10" />
      <path className="figure-faint" d="M32 22h32M32 29h34M32 36h28M32 43h34M32 50h18" />
      <rect className="figure-seal" x="54" y="47.5" width="5" height="5" />
    </>
  ),
  mats: (
    <>
      <rect x="8" y="14" width="28" height="36" />
      <rect x="34" y="8" width="28" height="36" />
      <rect x="60" y="18" width="28" height="36" />
      <path className="figure-faint" d="M13 19h18v20H13ZM39 13h18v20H39ZM65 23h18v20H65Z" />
      <rect className="figure-seal" x="78" y="47" width="5" height="5" />
    </>
  ),
  'type-case': (
    <>
      <rect x="8" y="12" width="80" height="40" />
      <path d="M8 25.5h80M8 38.5h80" />
      <path className="figure-faint" d="M22 12v13.5M44 12v13.5M58 12v13.5M74 12v13.5M16 25.5v13M34 25.5v13M62 25.5v13M28 38.5v13.5M50 38.5v13.5M68 38.5v13.5" />
      <rect className="figure-seal" x="38" y="29.5" width="5" height="5" />
    </>
  ),
  density: (
    <>
      <path d="M8 27h10v10H8ZM22 27h10v10H22ZM36 27h10v10H36ZM50 27h10v10H50ZM64 27h10v10H64ZM78 27h10v10H78Z" />
      <path className="figure-faint" d="M22 37l10-10M36 32l5-5M36 37l10-10M41 37l5-5M50 30l3-3M50 34l7-7M50 37l10-10M53 37l7-7M57 37l3-3" />
      <rect className="figure-ink" x="64" y="27" width="10" height="10" opacity=".55" />
      <rect className="figure-ink" x="78" y="27" width="10" height="10" />
      <path className="figure-faint" d="M8 46h80M8 18h80" />
      <rect className="figure-seal" x="10.5" y="49.5" width="5" height="5" />
    </>
  ),
  letter: (
    <>
      <path d="M10 16h76v38H10Z" />
      <path d="M10 16l38 22 38-22" />
      <path className="figure-faint" d="M10 54l28-18M86 54 58 36" />
      <circle className="figure-faint" cx="48" cy="38" r="9" />
      <rect className="figure-seal figure-seal-large" x="44" y="34" width="8" height="8" />
    </>
  ),
}

/** The plate figure printed beside a section title. */
export function SectionFigure({ name, className }: { name: FigureName; className?: string }) {
  return (
    <svg viewBox="0 0 96 64" className={cn('section-figure', className)} aria-hidden="true" focusable="false">
      {FIGURES[name]}
    </svg>
  )
}

/** The colophon's printer's device: the seal inside a registration target. */
export function ColophonDevice({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={cn('colophon-device', className)} aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="52" />
      <circle className="figure-faint" cx="60" cy="60" r="44" />
      <path d="M60 0v22M60 98v22M0 60h22M98 60h22" />
      <path className="figure-faint" d="M23.2 23.2l6.4 6.4M96.8 23.2l-6.4 6.4M23.2 96.8l6.4-6.4M96.8 96.8l-6.4-6.4" />
      <g filter="url(#washi-stamp)">
        <rect className="seal-ground" x="42" y="42" width="36" height="36" rx="2" />
        <rect className="seal-border" x="45" y="45" width="30" height="30" rx="1" />
        <text className="seal-mark colophon-device-mark" x="60" y="64.5" textAnchor="middle">
          SD
        </text>
      </g>
    </svg>
  )
}
