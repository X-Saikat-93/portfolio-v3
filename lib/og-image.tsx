import path from 'node:path'
import { ImageResponse } from 'next/og'

import type { Locale } from './locale-route'
import { ogColors, ogRuntimeFonts } from './og'
import { publicPageMetadata, type PublicSection } from './public-page-metadata'
import { seo } from './seo'

const sectionCopy: Record<PublicSection, { title: string; description: string }> = {
  blog: publicPageMetadata.blog.en,
  photos: publicPageMetadata.photos.en,
  books: publicPageMetadata.books.en,
  music: publicPageMetadata.music.en,
  projects: publicPageMetadata.projects.en,
  now: publicPageMetadata.now.en,
  resume: publicPageMetadata.resume.en,
  contact: publicPageMetadata.contact.en,
  uses: publicPageMetadata.uses.en,
  privacy: publicPageMetadata.privacy.en,
}

const WIDTH = 1200
const HEIGHT = 630
// --signal (oklch 0.62 0.17 45) resolved to sRGB for satori
const SIGNAL = '#d4642c'
const INK = '#1b1a18'

// ── Portrait art ───────────────────────────────────────────────────
// The site's signature, printed as a two-ink riso plate: the avatar sampled
// onto a hex halftone in ink, a second signal pass slightly off register,
// and the topographic halo the homepage portrait hides, drawn behind the
// head. One SVG, built once per server process.
const ART = { width: 600, height: HEIGHT }
// where the photo sits on the plate; it bleeds off the bottom edge
const PRINT = { x: 50, y: 40, width: 500, height: 590, pitch: 6 }
// head centre on the plate, from the crop below
const HEAD = { x: 289, y: 188 }

let art: Promise<string | null> | undefined

// a closed, gently wobbling contour; fixed phases keep every render identical
function contour(radius: number, index: number) {
  const points: string[] = []
  for (let step = 0; step <= 96; step++) {
    const angle = (step / 96) * Math.PI * 2
    const wobble =
      1 + 0.055 * Math.sin(3 * angle + index * 0.7) + 0.035 * Math.sin(5 * angle - index * 0.45)
    const x = HEAD.x + Math.cos(angle) * radius * wobble
    const y = HEAD.y + Math.sin(angle) * radius * wobble * 0.92
    points.push(`${step ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return `<path d="${points.join('')}Z"/>`
}

async function buildArt(): Promise<string | null> {
  let sharp: typeof import('sharp').default
  try {
    sharp = (await import('sharp')).default
  } catch {
    return null // no sharp: the card prints without the portrait
  }

  const { pitch } = PRINT
  const cols = Math.floor(PRINT.width / pitch)
  const rows = Math.floor(PRINT.height / (pitch * 0.866)) // hex row spacing
  const source = path.join(process.cwd(), 'public/images/saikat-avatar-preview.webp')
  // the avatar is a cut-out: flatten its transparency to paper, then frame
  // head and shoulders (the source is a 1000px square)
  const { data } = await sharp(source)
    .flatten({ background: '#ffffff' })
    .extract({ left: 270, top: 150, width: 460, height: 569 })
    .resize(cols, rows, { fit: 'fill' })
    .grayscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const dots: string[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = (col + (row % 2 ? 0.5 : 0) + 0.5) * pitch
      const y = (row + 0.5) * pitch * 0.866
      // the print thins out toward its sides so the crop never shows
      const fade = Math.min(1, Math.min(x, PRINT.width - x) / PRINT.width / 0.22)
      const tone = 1 - data[row * cols + col] / 255
      const r = (pitch / 2) * Math.pow(tone, 1.35) * fade
      if (r > 0.35) {
        dots.push(
          `<circle cx="${(PRINT.x + x).toFixed(1)}" cy="${(PRINT.y + y).toFixed(1)}" r="${r.toFixed(2)}"/>`,
        )
      }
    }
  }
  const plate = dots.join('')

  // halo rings start clear of the face, then widen and fade outward
  const rings = Array.from({ length: 11 }, (_, i) => {
    const opacity = (0.55 - i * 0.04).toFixed(2)
    return `<g stroke-opacity="${opacity}">${contour(168 + i * 26, i)}</g>`
  }).join('')

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ART.width}" height="${ART.height}" viewBox="0 0 ${ART.width} ${ART.height}">`,
    `<g fill="none" stroke="${SIGNAL}" stroke-width="1">${rings}</g>`,
    // the signal pass, off register like a second riso drum
    `<g fill="${SIGNAL}" fill-opacity="0.42" transform="translate(4 3)">${plate}</g>`,
    `<g fill="${INK}">${plate}</g>`,
    `</svg>`,
  ].join('')
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

function portraitArt() {
  art ??= buildArt().catch(() => null)
  return art
}

// ── Card ───────────────────────────────────────────────────────────

// the OG font subset has no curly apostrophe; print a straight one
const printable = (text: string) => text.replace(/’/g, "'")

async function render({ title, description, path }: { title: string; description: string; path: string }) {
  const artwork = await portraitArt()
  const guide = `1px dashed ${ogColors.border}`
  const titleSize = title.length > 28 ? 58 : 84

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: ogColors.paper,
          color: INK,
          fontFamily: 'Frex Sans GB',
        }}
      >
        {/* drafting guides, as on the site's ambient sheet */}
        <div style={{ position: 'absolute', top: 40, bottom: 40, left: 0, right: 0, borderTop: guide, borderBottom: guide, display: 'flex' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 48, right: 48, borderLeft: guide, borderRight: guide, display: 'flex' }} />

        {artwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={artwork}
            alt=""
            width={ART.width}
            height={ART.height}
            style={{ position: 'absolute', top: 0, right: 0 }}
          />
        ) : null}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 660,
            padding: '76px 0 76px 96px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 600, letterSpacing: -0.4 }}>Saikat Das</div>
            <div style={{ display: 'flex', fontSize: 20, color: ogColors.mutedForeground }}>
              Full-Stack Product Engineer
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div
              style={{
                display: 'flex',
                fontSize: titleSize,
                fontWeight: 600,
                letterSpacing: titleSize > 60 ? -3 : -1.6,
                lineHeight: 1.06,
              }}
            >
              {printable(title)}
            </div>
            <div
              style={{
                display: 'block',
                fontSize: 24,
                lineHeight: 1.45,
                color: ogColors.paperInk,
                lineClamp: 3,
              }}
            >
              {printable(description)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 18, color: ogColors.mutedForeground }}>
            <div style={{ display: 'flex', width: 28, height: 2, backgroundColor: SIGNAL }} />
            <div style={{ display: 'flex' }}>
              {seo.url.host}
              <span style={{ color: INK }}>{path}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: await ogRuntimeFonts() },
  )
}

export function createHomeOgImage(_locale: Locale) {
  return render({
    title: 'I build software that stays calm on a bad network.',
    description: 'Web products, APIs, and data systems, from architecture to production.',
    path: '/en',
  })
}

export function createSectionOgImage(section: PublicSection, _locale: Locale) {
  const copy = sectionCopy[section]
  return render({ title: copy.title, description: copy.description, path: `/en/${section}` })
}
