// The washi sheet: one fixed fibre layer at --fibre-opacity, inked with the
// theme's own ink so it reads as paper in both themes. Rendered once, never
// animated, never scrolled separately from the page.
export function AmbientBackground() {
  return <div aria-hidden className="paper-fibre" />
}
