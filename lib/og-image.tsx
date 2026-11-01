import { ImageResponse } from 'next/og'

import type { Locale } from './locale-route'
import { ogColors, ogRuntimeFonts } from './og'
import { getProjectById } from './projects'
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
// the ruled footer strip, as on a print register
const RULE_Y = 486
// --signal (oklch 0.62 0.17 45) resolved to sRGB for satori
const SIGNAL = '#d4642c'
const INK = '#1b1a18'
const PAPER = '#fafaf8'

// ── Ember fan ──────────────────────────────────────────────────────
// Hairlines fan up and left from just past the right end of the footer
// rule, each one fading from a hot root to nothing. The palette walks the
// ember from gold at the rule to wine at the top, so the card carries the
// site's signal without a photograph. Built once; every render is identical.
const EMBER = ['#f5b83d', '#ef8a2e', SIGNAL, '#d6363b', '#b0245a', '#5b2a86']

function mix(a: string, b: string, t: number) {
  const channel = (hex: string, i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
  return `#${[0, 1, 2]
    .map((i) => Math.round(channel(a, i) + (channel(b, i) - channel(a, i)) * t).toString(16).padStart(2, '0'))
    .join('')}`
}

function emberAt(t: number) {
  const scaled = t * (EMBER.length - 1)
  const index = Math.min(EMBER.length - 2, Math.floor(scaled))
  return mix(EMBER[index], EMBER[index + 1], scaled - index)
}

function buildFan() {
  const origin = { x: WIDTH + 24, y: RULE_Y }
  const lines = 132
  const defs: string[] = []
  const strokes: string[] = []

  for (let i = 0; i < lines; i++) {
    const t = i / (lines - 1)
    // from just above the rule (180°) round to straight up (270°), packed
    // tighter near the rule where the glow is hottest
    const angle = Math.PI * (1 + 0.5 * Math.pow(t, 0.82))
    const length = 640 + 180 * Math.sin(t * Math.PI)
    const x = origin.x + Math.cos(angle) * length
    const y = origin.y + Math.sin(angle) * length
    const color = emberAt(t)
    defs.push(
      `<linearGradient id="l${i}" gradientUnits="userSpaceOnUse" x1="${origin.x}" y1="${origin.y}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}">` +
        `<stop offset="0" stop-color="${color}" stop-opacity="1"/>` +
        `<stop offset="0.5" stop-color="${color}" stop-opacity="0.55"/>` +
        `<stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`,
    )
    strokes.push(
      `<line x1="${origin.x}" y1="${origin.y}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="url(#l${i})"/>`,
    )
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
    `<defs>${defs.join('')}`,
    `<radialGradient id="glow" cx="${origin.x}" cy="${origin.y}" r="460" gradientUnits="userSpaceOnUse">`,
    `<stop offset="0" stop-color="${SIGNAL}" stop-opacity="0.5"/>`,
    `<stop offset="0.45" stop-color="${EMBER[1]}" stop-opacity="0.14"/>`,
    `<stop offset="1" stop-color="${EMBER[0]}" stop-opacity="0"/></radialGradient>`,
    `<clipPath id="above"><rect width="${WIDTH}" height="${RULE_Y}"/></clipPath></defs>`,
    `<g clip-path="url(#above)">`,
    `<rect width="${WIDTH}" height="${RULE_Y}" fill="url(#glow)"/>`,
    `<g stroke-width="1.1" fill="none">${strokes.join('')}</g>`,
    `</g>`,
    `</svg>`,
  ].join('')
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

let fan: string | undefined
const emberFan = () => (fan ??= buildFan())

// ── Card ───────────────────────────────────────────────────────────

// the OG font subset has no curly apostrophe; print a straight one
const printable = (text: string) => text.replace(/’/g, "'")

// two lines of 24px copy hold about 110 characters; end on a whole word
// with dots rather than letting the clamp cut mid-phrase (the OG face sets
// its ellipsis glyph at mid-height)
function fitDescription(text: string, max = 110) {
  if (text.length <= max) return text
  const cut = text.slice(0, max).replace(/[\s,;:.]+\S*$/, '')
  return `${cut}...`
}

function titleSize(title: string) {
  if (title.length <= 16) return 112
  if (title.length <= 30) return 88
  return 64
}

// The ember hairlines leave thousands of distinct anti-aliased colours, which
// PNG compresses poorly (~500 KB). A 4:4:4 JPEG keeps the thin coloured
// lines sharp at a fraction of the size, under the limits chat apps such as
// WhatsApp apply to link previews. Without sharp the PNG is served as is.
async function toJpeg(image: ImageResponse) {
  let sharp: typeof import('sharp').default
  try {
    sharp = (await import('sharp')).default
  } catch {
    return image
  }
  const jpeg = await sharp(Buffer.from(await image.arrayBuffer()))
    .jpeg({ quality: 86, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toBuffer()
  return new Response(new Uint8Array(jpeg), { headers: { 'content-type': 'image/jpeg' } })
}

async function render({
  kicker,
  title,
  description,
  path,
}: {
  kicker: string
  title: string
  description: string
  path: string
}) {
  const size = titleSize(title)

  const image = new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: PAPER,
          color: INK,
          fontFamily: 'Frex Sans GB',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={emberFan()} alt="" width={WIDTH} height={HEIGHT} style={{ position: 'absolute', top: 0, left: 0 }} />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: RULE_Y,
            padding: '64px 80px 52px',
          }}
        >
          {/* the site mark: a framed monogram with its signal cell */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 46,
                height: 46,
                border: `2px solid ${INK}`,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              SD
              <div
                style={{
                  position: 'absolute',
                  right: -7,
                  bottom: -7,
                  display: 'flex',
                  width: 10,
                  height: 10,
                  backgroundColor: SIGNAL,
                }}
              />
            </div>
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 600, letterSpacing: -0.4 }}>Saikat Das</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 760 }}>
            <div
              style={{
                display: 'flex',
                fontSize: size,
                fontWeight: 600,
                letterSpacing: size >= 88 ? -4 : -2.4,
                lineHeight: 1.02,
              }}
            >
              {printable(title)}
            </div>
            <div
              style={{
                display: 'block',
                maxWidth: 680,
                fontSize: 24,
                lineHeight: 1.42,
                color: ogColors.paperInk,
                lineClamp: 2,
              }}
            >
              {printable(fitDescription(description))}
            </div>
          </div>
        </div>

        {/* footer strip under the rule: what this is, and where it lives */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 80px',
            borderTop: '1px solid #e2dfd8',
            fontSize: 19,
            color: ogColors.mutedForeground,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, letterSpacing: 2.2 }}>
            <div style={{ display: 'flex', width: 8, height: 8, backgroundColor: SIGNAL }} />
            {kicker.toUpperCase()}
          </div>
          <div style={{ display: 'flex' }}>
            {seo.url.host}
            <span style={{ color: INK }}>{path}</span>
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts: await ogRuntimeFonts() },
  )
  return toJpeg(image)
}

export function createHomeOgImage(_locale: Locale) {
  return render({
    kicker: 'Full-Stack Product Engineer',
    title: 'I build software that stays calm on a bad network.',
    description: 'Web products, APIs, and data systems, from architecture to production.',
    path: '/en',
  })
}

export function createSectionOgImage(section: PublicSection, _locale: Locale) {
  const copy = sectionCopy[section]
  return render({
    kicker: 'Full-Stack Product Engineer',
    title: copy.title,
    description: copy.description,
    path: `/en/${section}`,
  })
}

export function createProjectOgImage(id: string, _locale: Locale) {
  const project = getProjectById(id)
  if (!project) return null
  return render({
    kicker: `Project · ${project.category}`,
    title: project.nameEn,
    description: project.descriptionEn ?? project.description,
    path: `/en/projects/${project.id}`,
  })
}
