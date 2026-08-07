'use client'

import NextImage from 'next/image'
import { useEffect, useRef } from 'react'

import { localize, useLocale } from '~/lib/locale-client'

const MOBILE_CELL = 2 // denser mobile screen keeps facial features legible
const DESKTOP_CELL = 2.5 // CSS px between dot centers
const MOBILE_PRESENTATION_MAX = 200 // separates the 149.6px and 240px presentations
const EDGE_FADE = 0.1 // fraction of each edge over which dots taper out
const ALPHA_CUTOFF = 0.04
const TONE_GAMMA = 0.82
const FACE_WIDTH_RATIO = 0.7
const FACE_HEIGHT_RATIO = 0.56
const FACE_CENTER_Y = 0.29
const RADIUS = 150 // pointer influence radius (CSS px)
const SWELL = 0.14 // max extra dot growth near the pointer
const PUSH = 4 // max dot displacement away from the pointer (CSS px)
const FADE_MS = 550 // theme crossfade duration

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

// The portrait as an interactive halftone print with a source per theme:
// light mode prints the clean white-ground headshot (ink ∝ darkness — a
// natural positive), dark mode prints the studio portrait (ink ∝ light).
// Theme switches crossfade between the two dot fields; a fine pointer
// swells and repels dots. Touch and reduced motion get the static print.
export function HalftonePortrait({
  srcLight,
  srcDark,
  alt,
  altEn,
  className,
}: {
  srcLight: string
  srcDark: string
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

    function loadImage(kind: 'light' | 'dark', src: string) {
      if (!src) return
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      const done = () => {
        images[kind] = img
        buildField(kind)
        draw()
      }
      if (img.complete && img.naturalWidth > 0) done()
      else img.addEventListener('load', done, { once: true })
    }

    function faceCrop(img: HTMLImageElement) {
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
      const side = Math.min(
        img.naturalWidth,
        img.naturalHeight,
        subjectWidth * FACE_WIDTH_RATIO,
        subjectHeight * FACE_HEIGHT_RATIO,
      )
      const centerX = (left + right) / 2
      const centerY = top + subjectHeight * FACE_CENTER_Y
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
      const crop = faceCrop(img)
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
      const lo = sorted[Math.floor(sorted.length * 0.04)] ?? 0
      const hi = sorted[Math.floor(sorted.length * 0.96)] ?? 1
      const range = Math.max(0.05, hi - lo)

      const cells: Cell[] = []
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const index = r * cols + c
          const alpha = alphas[index]
          if (alpha <= ALPHA_CUTOFF) continue
          const lum = Math.min(1, Math.max(0, (lums[index] - lo) / range))
          // light: ink ∝ darkness, white ground drops out.
          // dark: ink ∝ light, black ground drops out.
          const ink = kind === 'light' ? 1 - lum : lum
          const tone = alpha * Math.pow(Math.max(0, Math.min(1, ink)), TONE_GAMMA)
          if (tone < 0.06) continue
          const x = (c + 0.5) * cell
          const y = (r + 0.5) * cell
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
      const maxR = field.cell * 0.52
      let painted = false
      for (const cell of field.cells) {
        let { x, y } = cell
        let r = cell.tone * maxR
        if (pointerActive || pointer.x > -1e3) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const d = Math.hypot(dx, dy)
          if (d < RADIUS) {
            const t = 1 - d / RADIUS
            const fall = t * t * (3 - 2 * t)
            r *= 1 + SWELL * fall
            const push = (PUSH * fall) / (d || 1)
            x += dx * push
            y += dy * push
          }
        }
        if (r < 0.3) continue
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        painted = true
      }
      ctx.globalAlpha = 1
      return painted
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
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
      if (pointerActive || fade || Math.hypot(dx, dy) > 0.5) raf = requestAnimationFrame(tick)
    }

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }

    function layout() {
      const rect = canvas.getBoundingClientRect()
      cssW = rect.width
      cssH = rect.height
      const dpr = window.devicePixelRatio || 1
      canvas.width = Math.round(cssW * dpr)
      canvas.height = Math.round(cssH * dpr)
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
      canvas.addEventListener('pointermove', onMove)
      canvas.addEventListener('pointerleave', onLeave)
    }

    loadImage('light', srcLight)
    loadImage('dark', srcDark)

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
  }, [srcLight, srcDark])

  return (
    <span ref={wrapperRef} className={className} data-halftone>
      {/* Warm both source images from the server HTML without exposing a
          raw-photo frame before the client paints the halftone field. */}
      {srcLight ? (
        <NextImage src={srcLight} alt="" width={1000} height={1000} unoptimized hidden aria-hidden />
      ) : null}
      {srcDark ? (
        <NextImage src={srcDark} alt="" width={1000} height={1000} unoptimized hidden aria-hidden />
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
