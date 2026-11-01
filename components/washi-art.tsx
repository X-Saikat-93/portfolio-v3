import { cn } from '~/lib/utils'

// The print shop's own vocabulary, drawn in ink: the SD seal and the
// colophon's printer's device.
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
          <feColorMatrix in="noise" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -3.6 3.25" result="specks" />
          <feComposite in="bitten" in2="specks" operator="in" />
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

/** A registration target, the printer's alignment mark. */
export function RegistrationMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn('registration-mark', className)} aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="4.5" />
      <path d="M8 0v16M0 8h16" />
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
