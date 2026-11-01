// Writes public/art/contours.svg: the faint topographic field behind the
// hero, echoing the portrait's hidden halo. Deterministic; rerun only to
// change the drawing. The file is used as a CSS mask, so stroke colour is
// irrelevant — the page inks it with --hairline.
import { writeFileSync } from 'node:fs'

const SIZE = 720
const CENTER = { x: 360, y: 380 }
const RINGS = 12
const POINTS = 40
const round = (n) => Math.round(n)

function radius(ring, theta) {
  const base = 70 + ring * 22 + ring * ring * 0.55
  const swell =
    Math.sin(theta * 2 + ring * 0.35) * (6 + ring * 0.9) +
    Math.sin(theta * 3 - ring * 0.5 + 1.3) * (4 + ring * 0.6) +
    Math.cos(theta * 5 + ring * 0.8) * (1.5 + ring * 0.25)
  return base + swell
}

// closed Catmull-Rom through the ring's points, as cubic Béziers
function ringPath(ring) {
  const pts = Array.from({ length: POINTS }, (_, i) => {
    const theta = (i / POINTS) * Math.PI * 2
    const r = radius(ring, theta)
    return [CENTER.x + Math.cos(theta) * r, CENTER.y + Math.sin(theta) * r * 0.86]
  })
  let d = `M${round(pts[0][0])} ${round(pts[0][1])}`
  for (let i = 0; i < POINTS; i++) {
    const p0 = pts[(i - 1 + POINTS) % POINTS]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % POINTS]
    const p3 = pts[(i + 2) % POINTS]
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
    d += `C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(p2[0])} ${round(p2[1])}`
  }
  return d + 'Z'
}

const paths = Array.from({ length: RINGS }, (_, ring) => {
  // every fifth ring is an index contour, drawn a touch heavier
  const width = ring % 4 === 3 ? 1.4 : 0.8
  return `<path d="${ringPath(ring)}" stroke-width="${width}"/>`
}).join('')

writeFileSync(
  new URL('../public/art/contours.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" fill="none" stroke="#000">${paths}</svg>\n`,
)
