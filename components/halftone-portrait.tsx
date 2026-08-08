'use client'

import NextImage from 'next/image'
import { useEffect, useRef } from 'react'

import { localize, useLocale } from '~/lib/locale-client'

const MOBILE_CELL = 1.8 // denser mobile screen keeps facial features legible
const DESKTOP_CELL = 2.25 // CSS px between dot centers
const MOBILE_PRESENTATION_MAX = 200 // separates the 149.6px and 240px presentations
const EDGE_FADE = 0.06 // fraction of each edge over which dots taper out
const ALPHA_CUTOFF = 0.045
const TONE_GAMMA = 0.82
const DARK_TONE_GAMMA = 0.9
const DETAIL_GAIN = 3.2
const DARK_SHADOW_INK = 0.14
const DARK_HIGHLIGHT_INK = 0.82
const PORTRAIT_WIDTH_RATIO = 0.58
const PORTRAIT_HEIGHT_RATIO = 0.5
const PORTRAIT_CENTER_Y = 0.2
const SHOULDER_FADE_START = 0.75
const SHOULDER_FADE = 0.62
const RADIUS = 150 // pointer influence radius (CSS px)
const RADIUS_SQUARED = RADIUS * RADIUS
const SWELL = 0.08 // max extra dot growth near the pointer
const PUSH = 3 // max dot displacement away from the pointer (CSS px)
const FADE_MS = 550 // theme crossfade duration
const MAX_DEVICE_PIXEL_RATIO = 2
const TAU = Math.PI * 2

// per-theme print inks, matching the foreground tokens
const INK_LIGHT = 'oklch(0.145 0 0)'
const INK_DARK = 'oklch(0.985 0 0)'

interface Cell {
  x: number
  y: number
  tone: number
}

interface Field {
  cells: Cell[]
  cell: number
  ink: string
}

export function getHalftoneTone(
  kind: 'light' | 'dark',
  luminance: number,
  detail: number,
  silhouetteEdge: number,
  alpha: number,
  shoulderFade: number,
) {
  const ink =
    kind === 'light'
      ? (1 - luminance) * 0.9 + detail * 0.22 + silhouetteEdge * 0.08
      : DARK_SHADOW_INK * (1 - luminance) +
        DARK_HIGHLIGHT_INK * luminance +
        detail * 0.34 +
        silhouetteEdge * 0.36

  return (
    alpha *
    Math.pow(Math.min(1, Math.max(0, ink)), kind === 'dark' ? DARK_TONE_GAMMA : TONE_GAMMA) *
    (1 - SHOULDER_FADE * shoulderFade)
  )
}

// The portrait as an interactive halftone print with a source per theme:
// light mode prints the clean white-ground headshot (ink ∝ darkness — a
// natural positive), dark mode prints the studio portrait (ink ∝ light).
// Theme switches crossfade between the two dot fields; a fine pointer
// swells and repels dots. Touch and reduced motion get the static print.
export function HalftonePortrait({
  srcLight,
  srcDark,
  fallbackSrc,
  alt,
  altEn,
  className,
}: {
  srcLight: string
  srcDark: string
  fallbackSrc?: string
  alt: string
  altEn: string
  className?: string
}) {
  const locale = useLocale()
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const wrapperEl = wrapperRef.current
    const canvasEl = canvasRef.current
    if (!wrapperEl || !canvasEl) return
    const wrapper: HTMLElement = wrapperEl
    const canvas: HTMLCanvasElement = canvasEl
    const maybeCtx = canvas.getContext('2d')
    if (!maybeCtx) return
    const ctx: CanvasRenderingContext2D = maybeCtx

    let cssW = 0
    let cssH = 0
    let renderDpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
    let raf = 0
    const fields: { light?: Field; dark?: Field } = {}
    let fade: { from: 'light' | 'dark'; to: 'light' | 'dark'; start: number } | null = null
    const pointer = { x: -1e4, y: -1e4 }
    const target = { x: -1e4, y: -1e4 }
    let pointerActive = false

    const interactive =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isDark = () => document.documentElement.classList.contains('dark')

    const images: Partial<Record<'light' | 'dark', HTMLImageElement>> = {}

    function loadImage(kind: 'light' | 'dark', src: string, fallback?: string) {
      if (!src) return
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      const done = () => {
        images[kind] = img
        buildField(kind)
        draw()
      }
      if (img.complete) {
        if (img.naturalWidth > 0) done()
        else if (fallback && fallback !== src) loadImage(kind, fallback)
      } else {
        img.addEventListener('load', done, { once: true })
        if (fallback && fallback !== src) {
          img.addEventListener('error', () => loadImage(kind, fallback), { once: true })
        }
      }
    }

    function portraitCrop(img: HTMLImageElement) {
      const probeSize = 96
      const probe = document.createElement('canvas')
      probe.width = probeSize
      probe.height = probeSize
      const probeCtx = probe.getContext('2d', { willReadFrequently: true })
      if (!probeCtx) {
        return { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight }
      }

      probeCtx.drawImage(img, 0, 0, probeSize, probeSize)
      const alpha = probeCtx.getImageData(0, 0, probeSize, probeSize).data
      let minX = probeSize
      let minY = probeSize
      let maxX = -1
      let maxY = -1

      for (let y = 0; y < probeSize; y++) {
        for (let x = 0; x < probeSize; x++) {
          if (alpha[(y * probeSize + x) * 4 + 3] <= 16) continue
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        }
      }

      if (maxX < 0 || (maxX - minX > probeSize * 0.94 && maxY - minY > probeSize * 0.94)) {
        return { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight }
      }

      const left = (minX / probeSize) * img.naturalWidth
      const top = (minY / probeSize) * img.naturalHeight
      const right = ((maxX + 1) / probeSize) * img.naturalWidth
      const bottom = ((maxY + 1) / probeSize) * img.naturalHeight
      const subjectWidth = right - left
      const subjectHeight = bottom - top
      // Keep the natural head, neck, and upper shoulder silhouette. The
      // square is intentionally wider than the face so it never becomes an oval.
      const side = Math.min(
        img.naturalWidth,
        img.naturalHeight,
        subjectWidth * PORTRAIT_WIDTH_RATIO,
        subjectHeight * PORTRAIT_HEIGHT_RATIO,
      )
      const centerX = (left + right) / 2
      const centerY = top + subjectHeight * PORTRAIT_CENTER_Y
      const x = Math.max(0, Math.min(img.naturalWidth - side, centerX - side / 2))
      const y = Math.max(0, Math.min(img.naturalHeight - side, centerY - side / 2))

      return { x, y, width: side, height: side }
    }

    // sample an image cover-cropped into the square grid
    function buildField(kind: 'light' | 'dark') {
      const img = images[kind]
      if (!img || cssW < 4) return
      const cell =
        kind === 'light' && cssW < MOBILE_PRESENTATION_MAX ? MOBILE_CELL : DESKTOP_CELL
      const cols = Math.max(1, Math.round(cssW / cell))
      const rows = Math.max(1, Math.round(cssH / cell))
      const off = document.createElement('canvas')
      off.width = cols
      off.height = rows
      const octx = off.getContext('2d', { willReadFrequently: true })
      if (!octx) return
      const crop = portraitCrop(img)
      const scale = Math.max(cols / crop.width, rows / crop.height)
      const dw = crop.width * scale
      const dh = crop.height * scale
      octx.drawImage(
        img,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        (cols - dw) / 2,
        (rows - dh) / 2,
        dw,
        dh,
      )
      const data = octx.getImageData(0, 0, cols, rows).data

      const lums = new Float32Array(cols * rows)
      const alphas = new Float32Array(cols * rows)
      const samples: number[] = []
      for (let i = 0; i < lums.length; i++) {
        const j = i * 4
        const alpha = data[j + 3] / 255
        const lum = (0.2126 * data[j] + 0.7152 * data[j + 1] + 0.0722 * data[j + 2]) / 255
        lums[i] = lum
        alphas[i] = alpha
        if (alpha > ALPHA_CUTOFF) samples.push(lum)
      }
      const sorted = Float32Array.from(samples).sort()
      const lo = sorted[Math.floor(sorted.length * 0.025)] ?? 0
      const hi = sorted[Math.floor(sorted.length * 0.975)] ?? 1
      const range = Math.max(0.05, hi - lo)
      const normalizeLum = (value: number) => Math.min(1, Math.max(0, (value - lo) / range))

      const cells: Cell[] = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const index = r * cols + c
          const alpha = alphas[index]
          if (alpha <= ALPHA_CUTOFF) continue
          const lum = normalizeLum(lums[index])
          const left = r * cols + Math.max(0, c - 1)
          const right = r * cols + Math.min(cols - 1, c + 1)
          const top = Math.max(0, r - 1) * cols + c
          const bottom = Math.min(rows - 1, r + 1) * cols + c
          const localAverage = normalizeLum(
            (lums[left] + lums[right] + lums[top] + lums[bottom]) / 4,
          )
          const detail = Math.min(1, Math.abs(lum - localAverage) * DETAIL_GAIN)
          const silhouetteEdge = Math.max(
            0,
            alpha - Math.min(alphas[left], alphas[right], alphas[top], alphas[bottom]),
          )
          const x = (c + 0.5) * cell
          const y = (r + 0.5) * cell
          const shoulderT = Math.min(
            1,
            Math.max(0, (y / cssH - SHOULDER_FADE_START) / (1 - SHOULDER_FADE_START)),
          )
          const shoulderFade = shoulderT * shoulderT * (3 - 2 * shoulderT)
          const tone = getHalftoneTone(
            kind,
            lum,
            detail,
            silhouetteEdge,
            alpha,
            shoulderFade,
          )
          if (tone < 0.035) continue
          const fx = Math.min(x, cssW - x) / (cssW * EDGE_FADE)
          // the headshot's hair meets the frame top — no top fade in light
          const fy =
            (kind === 'light' ? cssH - y : Math.min(y, cssH - y)) / (cssH * EDGE_FADE)
          const edge = Math.min(1, fx, fy)
          if (edge <= 0) continue
          cells.push({ x, y, tone: tone * edge })
        }
      }
      fields[kind] = { cell, cells, ink: kind === 'light' ? INK_LIGHT : INK_DARK }
    }

    function drawField(field: Field, alpha: number) {
      if (alpha <= 0.01) return false
      ctx.globalAlpha = alpha
      ctx.fillStyle = field.ink
      const maxR = field.cell * 0.49
      let painted = false
      ctx.beginPath()
      for (const cell of field.cells) {
        let { x, y } = cell
        let r = cell.tone * maxR
        if (pointerActive || pointer.x > -1e3) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const distanceSquared = dx * dx + dy * dy
          if (distanceSquared < RADIUS_SQUARED) {
            const d = Math.sqrt(distanceSquared)
            const t = 1 - d / RADIUS
            const fall = t * t * (3 - 2 * t)
            r *= 1 + SWELL * fall
            const push = (PUSH * fall) / (d || 1)
            x += dx * push
            y += dy * push
          }
        }
        if (r < 0.08) continue
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, TAU)
        painted = true
      }
      if (painted) ctx.fill()
      ctx.globalAlpha = 1
      return painted
    }

    function draw() {
      ctx.setTransform(renderDpr, 0, 0, renderDpr, 0, 0)
      ctx.clearRect(0, 0, cssW, cssH)
      const active: 'light' | 'dark' = isDark() ? 'dark' : 'light'
      let painted = false
      if (fade) {
        const t = Math.min(1, (performance.now() - fade.start) / FADE_MS)
        const ease = t * t * (3 - 2 * t)
        const fromField = fields[fade.from]
        const toField = fields[fade.to]
        if (fromField) {
          painted = drawField(fromField, 1 - ease) || painted
        }
        if (toField) {
          painted = drawField(toField, ease) || painted
        }
        if (t >= 1) fade = null
      } else {
        const field = fields[active]
        if (field) {
          painted = drawField(field, 1)
        }
      }
      if (painted && !wrapper.hasAttribute('data-ready')) {
        wrapper.dataset.ready = ''
      }
    }

    function tick() {
      raf = 0
      const dx = target.x - pointer.x
      const dy = target.y - pointer.y
      pointer.x += dx * 0.16
      pointer.y += dy * 0.16
      draw()
      if (fade || dx * dx + dy * dy > 0.25) raf = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    function layout() {
      const rect = canvas.getBoundingClientRect()
      const nextDpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO)
      if (
        Math.abs(rect.width - cssW) < 0.25 &&
        Math.abs(rect.height - cssH) < 0.25 &&
        nextDpr === renderDpr &&
        canvas.width > 0
      ) {
        return
      }
      cssW = rect.width
      cssH = rect.height
      renderDpr = nextDpr
      canvas.width = Math.round(cssW * renderDpr)
      canvas.height = Math.round(cssH * renderDpr)
      buildField('light')
      buildField('dark')
      draw()
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      target.x = e.clientX - rect.left
      target.y = e.clientY - rect.top
      pointerActive = true
      wake()
    }
    const onLeave = () => {
      pointerActive = false
      target.x = -1e4
      target.y = -1e4
      wake()
    }

    if (interactive) {
      canvas.addEventListener('pointermove', onMove, { passive: true })
      canvas.addEventListener('pointerleave', onLeave)
    }

    loadImage('light', srcLight, fallbackSrc)
    loadImage('dark', srcDark, fallbackSrc)

    const ro = new ResizeObserver(() => layout())
    ro.observe(canvas)

    // theme flip: crossfade the two prints (instant under reduced motion)
    let lastDark = isDark()
    const mo = new MutationObserver(() => {
      const nowDark = isDark()
      if (nowDark === lastDark) return
      lastDark = nowDark
      if (reduced) {
        draw()
        return
      }
      fade = {
        from: nowDark ? 'light' : 'dark',
        to: nowDark ? 'dark' : 'light',
        start: performance.now(),
      }
      wake()
    })
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      ro.disconnect()
      mo.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [fallbackSrc, srcDark, srcLight])

  return (
    <span ref={wrapperRef} className={className} data-halftone>
      {/* Warm both source images from the server HTML without exposing a
          raw-photo frame before the client paints the halftone field. */}
      {srcLight ? (
        <NextImage
          src={srcLight}
          alt=""
          width={1000}
          height={1000}
          loading="eager"
          unoptimized
          hidden
          aria-hidden
        />
      ) : null}
      {srcDark ? (
        <NextImage
          src={srcDark}
          alt=""
          width={1000}
          height={1000}
          loading="eager"
          unoptimized
          hidden
          aria-hidden
        />
      ) : null}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={localize(locale, alt, altEn)}
        className="halftone-canvas"
      />
    </span>
  )
}
