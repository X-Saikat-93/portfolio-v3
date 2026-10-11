'use client'

import NextImage from 'next/image'
import { useEffect, useRef } from 'react'

import { localize, useLocale } from '~/lib/locale-client'

const MOBILE_CELL = 1.8 // denser mobile screen keeps facial features legible
const DESKTOP_CELL = 2.25 // CSS px between dot centers at 1x
const MIN_DEVICE_CELL = 2.7 // device px between dot centers on dense screens
const MOBILE_PRESENTATION_MAX = 200 // separates the 149.6px and 240px presentations
const ROW_STEP = Math.sqrt(3) / 2 // hexagonal print screen: rows interlock
const DOT_SCALE = 0.5 // full-tone dots just kiss their hex neighbours
const DOT_RESPONSE = 0.72 // between area-true (0.5) and diameter-true (1): keeps midtone depth
const MIN_RADIUS = 0.12 // CSS px; anything smaller is sub-pixel noise
const EDGE_FADE = 0.06 // fraction of each edge over which dots taper out
const ALPHA_CUTOFF = 0.045
const TONE_GAMMA = 0.82
const DARK_TONE_GAMMA = 0.9
const SHARPEN = 0.85 // unsharp mask: eyes, brows and mouth keep their edges
const DARK_SHADOW_INK = 0.14
const DARK_HIGHLIGHT_INK = 0.82
const HEAD_BAND = 0.2 // top fraction of the cut-out that is hair and face
const PORTRAIT_HEAD_WIDTHS = 2.25 // frame side, in head widths: head, neck, shoulders
const PORTRAIT_HEADROOM = 0.07 // frame side above the hair
const SHOULDER_FADE_START = 0.75
const SHOULDER_FADE = 0.62
const RADIUS = 150 // pointer influence radius (CSS px)
const RADIUS_SQUARED = RADIUS * RADIUS
const SWELL = 0.08 // max extra dot growth near the pointer
const PUSH = 3 // max dot displacement away from the pointer (CSS px)
const FOLLOW_MS = 70 // pointer spring time constant
const INFLUENCE_MS = 160 // how fast the lens fades in and out
const DEVELOP_MS = 560 // each dot's own ink-in
const DEVELOP_SPREAD = 680 // the print develops outward from the face
const DEVELOP_JITTER = 140
const MORPH_MS = 460 // theme flip: each dot re-inks in place
const MORPH_SPREAD = 380 // ...as a diagonal wave
const MAX_DEVICE_PIXEL_RATIO = 2
const TAU = Math.PI * 2

// per-theme print inks, matching the foreground tokens
const INK_LIGHT = 'oklch(0.145 0 0)'
const INK_DARK = 'oklch(0.985 0 0)'

type Kind = 'light' | 'dark'

// One hex grid shared by both prints, so a theme flip can resize each dot in place.
interface Grid {
  cell: number
  count: number
  xs: Float32Array
  ys: Float32Array
  develop: Float32Array // ms before each dot starts to ink in
  wave: Float32Array // 0-1 position along the theme-flip sweep
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
// a dot of ink spreads a touch past its size before it settles
const easeOutBack = (t: number) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2
const hash = (i: number) => {
  const v = Math.sin(i * 12.9898) * 43758.5453
  return v - Math.floor(v)
}

export function getHalftoneTone(
  kind: Kind,
  luminance: number,
  silhouetteEdge: number,
  alpha: number,
  shoulderFade: number,
) {
  const ink =
    kind === 'light'
      ? (1 - luminance) * 0.92 + silhouetteEdge * 0.08
      : DARK_SHADOW_INK * (1 - luminance) +
        DARK_HIGHLIGHT_INK * luminance +
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
// The print develops outward from the face on load, a theme switch re-inks
// each dot in place, and a fine pointer swells and repels dots. Touch gets
// the static print; reduced motion skips the develop and the re-ink.
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
    let last = 0
    let grid: Grid | null = null
    const images: Partial<Record<Kind, HTMLImageElement>> = {}
    const radii: Partial<Record<Kind, Float32Array>> = {}
    let developStart: number | null = null
    let developed = false
    let morph: { from: Kind; start: number } | null = null
    const pointer = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }
    let influence = 0
    let influenceTarget = 0

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const interactive =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced
    const activeKind = (): Kind =>
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'

    function loadImage(kinds: Kind[], src: string, fallback?: string) {
      if (!src) return
      const img = new window.Image()
      img.crossOrigin = 'anonymous'
      img.src = src
      const done = () => {
        for (const kind of kinds) {
          images[kind] = img
          buildRadii(kind)
        }
        wake()
      }
      if (img.complete) {
        if (img.naturalWidth > 0) done()
        else if (fallback && fallback !== src) loadImage(kinds, fallback)
      } else {
        img.addEventListener('load', done, { once: true })
        if (fallback && fallback !== src) {
          img.addEventListener('error', () => loadImage(kinds, fallback), { once: true })
        }
      }
    }

    function portraitCrop(img: HTMLImageElement) {
      const full = { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight }
      const probeSize = 160
      const probe = document.createElement('canvas')
      probe.width = probeSize
      probe.height = probeSize
      const probeCtx = probe.getContext('2d', { willReadFrequently: true })
      if (!probeCtx) return full

      probeCtx.drawImage(img, 0, 0, probeSize, probeSize)
      const alpha = probeCtx.getImageData(0, 0, probeSize, probeSize).data
      const solid = (x: number, y: number) => alpha[(y * probeSize + x) * 4 + 3] > 16
      let minX = probeSize
      let minY = probeSize
      let maxX = -1
      let maxY = -1
      for (let y = 0; y < probeSize; y++) {
        for (let x = 0; x < probeSize; x++) {
          if (!solid(x, y)) continue
          minX = Math.min(minX, x)
          minY = Math.min(minY, y)
          maxX = Math.max(maxX, x)
          maxY = Math.max(maxY, y)
        }
      }
      // no cut-out (opaque photo): use the whole frame
      if (maxX < 0 || (maxX - minX > probeSize * 0.94 && maxY - minY > probeSize * 0.94)) {
        return full
      }

      // the head band: each row's solid span; its widest span is the head width
      // and the mean of span centers is the head's own axis
      const bandEnd = Math.min(maxY, minY + Math.round((maxY - minY) * HEAD_BAND))
      let headWidth = 0
      let axisSum = 0
      let rows = 0
      for (let y = minY; y <= bandEnd; y++) {
        let left = -1
        let right = -1
        for (let x = minX; x <= maxX; x++) {
          if (!solid(x, y)) continue
          if (left < 0) left = x
          right = x
        }
        if (left < 0) continue
        headWidth = Math.max(headWidth, right - left + 1)
        axisSum += (left + right + 1) / 2
        rows++
      }
      if (!rows) return full

      const unit = img.naturalWidth / probeSize
      const side = Math.min(
        img.naturalWidth,
        img.naturalHeight,
        headWidth * unit * PORTRAIT_HEAD_WIDTHS,
      )
      const centerX = (axisSum / rows) * unit
      const top = minY * (img.naturalHeight / probeSize) - side * PORTRAIT_HEADROOM
      const x = Math.max(0, Math.min(img.naturalWidth - side, centerX - side / 2))
      const y = Math.max(0, Math.min(img.naturalHeight - side, top))

      return { x, y, width: side, height: side }
    }

    // hex screen: odd rows shift half a cell. Centers stay unsnapped: at
    // fractional DPRs snapping makes row gaps alternate and reads as banding.
    function buildGrid() {
      const cell =
        cssW < MOBILE_PRESENTATION_MAX
          ? MOBILE_CELL
          : Math.min(DESKTOP_CELL, Math.max(MIN_DEVICE_CELL / renderDpr, 1.5))
      const rowStep = cell * ROW_STEP
      const cols = Math.max(1, Math.floor(cssW / cell))
      const rows = Math.max(1, Math.floor(cssH / rowStep))
      const padX = (cssW - cols * cell) / 2
      const padY = (cssH - rows * rowStep) / 2
      const count = cols * rows
      const xs = new Float32Array(count)
      const ys = new Float32Array(count)
      const develop = new Float32Array(count)
      const wave = new Float32Array(count)
      const reach = Math.hypot(cssW * 0.5, cssH * 0.6)
      let i = 0
      for (let r = 0; r < rows; r++) {
        const shift = r % 2 ? cell * 0.75 : cell * 0.25
        for (let c = 0; c < cols; c++, i++) {
          const x = padX + c * cell + shift
          const y = padY + (r + 0.5) * rowStep
          xs[i] = x
          ys[i] = y
          develop[i] =
            (Math.hypot(x - cssW * 0.5, y - cssH * 0.4) / reach) * DEVELOP_SPREAD +
            hash(i) * DEVELOP_JITTER
          wave[i] = (x / cssW) * 0.55 + (y / cssH) * 0.45
        }
      }
      grid = { cell, count, xs, ys, develop, wave }
    }

    // sample the cover-cropped image at every grid point into dot radii
    function buildRadii(kind: Kind) {
      const img = images[kind]
      if (!img || !grid || cssW < 4) return
      const { cell, count, xs, ys } = grid
      const sw = Math.max(1, Math.round((cssW / cell) * 2))
      const sh = Math.max(1, Math.round((cssH / cell) * 2))
      const off = document.createElement('canvas')
      off.width = sw
      off.height = sh
      const octx = off.getContext('2d', { willReadFrequently: true })
      if (!octx) return
      octx.imageSmoothingQuality = 'high'
      const crop = portraitCrop(img)
      const scale = Math.max(sw / crop.width, sh / crop.height)
      const dw = crop.width * scale
      const dh = crop.height * scale
      octx.drawImage(
        img,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        (sw - dw) / 2,
        (sh - dh) / 2,
        dw,
        dh,
      )
      const data = octx.getImageData(0, 0, sw, sh).data

      const lums = new Float32Array(sw * sh)
      const alphas = new Float32Array(sw * sh)
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
      const hi = sorted[Math.floor(sorted.length * 0.995)] ?? 1
      const range = Math.max(0.05, hi - lo)
      const normalizeLum = (value: number) => clamp01((value - lo) / range)

      const maxR = cell * DOT_SCALE
      const out = new Float32Array(count)
      for (let i = 0; i < count; i++) {
        const x = xs[i]
        const y = ys[i]
        // box-average the 2x2 samples around the dot center
        const c = Math.min(sw - 2, Math.max(0, Math.floor((x / cssW) * sw - 0.5)))
        const r = Math.min(sh - 2, Math.max(0, Math.floor((y / cssH) * sh - 0.5)))
        const index = r * sw + c
        const alpha =
          (alphas[index] + alphas[index + 1] + alphas[index + sw] + alphas[index + sw + 1]) / 4
        if (alpha <= ALPHA_CUTOFF) continue
        const raw = (lums[index] + lums[index + 1] + lums[index + sw] + lums[index + sw + 1]) / 4
        // neighbours one cell away (two samples at this resolution)
        const left = r * sw + Math.max(0, c - 2)
        const right = r * sw + Math.min(sw - 1, c + 3)
        const top = Math.max(0, r - 2) * sw + c
        const bottom = Math.min(sh - 1, r + 3) * sw + c
        const localAverage = (lums[left] + lums[right] + lums[top] + lums[bottom]) / 4
        const lum = normalizeLum(raw + SHARPEN * (raw - localAverage))
        const silhouetteEdge = Math.max(
          0,
          alpha - Math.min(alphas[left], alphas[right], alphas[top], alphas[bottom]),
        )
        const shoulderT = clamp01((y / cssH - SHOULDER_FADE_START) / (1 - SHOULDER_FADE_START))
        const shoulderFade = shoulderT * shoulderT * (3 - 2 * shoulderT)
        const tone = getHalftoneTone(kind, lum, silhouetteEdge, alpha, shoulderFade)
        if (tone < 0.035) continue
        const fx = Math.min(x, cssW - x) / (cssW * EDGE_FADE)
        const fy = Math.min(y, cssH - y) / (cssH * EDGE_FADE)
        const edge = Math.min(1, fx, fy)
        if (edge <= 0) continue
        out[i] = (tone * edge) ** DOT_RESPONSE * maxR
      }
      radii[kind] = out
    }

    // paints one frame; returns true while a develop or re-ink is mid-flight
    function draw(now: number) {
      ctx.setTransform(renderDpr, 0, 0, renderDpr, 0, 0)
      ctx.clearRect(0, 0, cssW, cssH)
      const kind = activeKind()
      const to = radii[kind]
      if (!grid || !to) return false

      if (!developed && developStart === null) {
        if (reduced) developed = true
        else developStart = now
      }
      const developAt = developStart === null ? -1 : now - developStart
      const from = morph ? radii[morph.from] : undefined
      const morphAt = morph ? now - morph.start : 0
      const lens = influence > 0.001
      const { count, xs, ys, develop, wave } = grid
      let busy = false
      let painted = false

      ctx.fillStyle = kind === 'dark' ? INK_DARK : INK_LIGHT
      ctx.beginPath()
      for (let i = 0; i < count; i++) {
        let r = to[i]
        if (from) {
          const k = clamp01((morphAt - wave[i] * MORPH_SPREAD) / MORPH_MS)
          if (k < 1) busy = true
          r = from[i] + (r - from[i]) * easeOutCubic(k)
        }
        if (developAt >= 0) {
          const k = clamp01((developAt - develop[i]) / DEVELOP_MS)
          if (k < 1) busy = true
          r *= easeOutBack(k)
        }
        if (r < MIN_RADIUS) continue
        let x = xs[i]
        let y = ys[i]
        if (lens) {
          const dx = x - pointer.x
          const dy = y - pointer.y
          const distanceSquared = dx * dx + dy * dy
          if (distanceSquared < RADIUS_SQUARED) {
            const d = Math.sqrt(distanceSquared)
            const t = 1 - d / RADIUS
            const fall = t * t * (3 - 2 * t) * influence
            r *= 1 + SWELL * fall
            const push = (PUSH * fall) / (d || 1)
            x += dx * push
            y += dy * push
          }
        }
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, TAU)
        painted = true
      }
      if (painted) ctx.fill()

      if (!busy) {
        morph = null
        if (developStart !== null) {
          developStart = null
          developed = true
        }
      }
      if (painted && !wrapper.hasAttribute('data-ready')) {
        wrapper.dataset.ready = ''
      }
      return busy
    }

    function tick(now: number) {
      raf = 0
      // frame-rate independent springs for the lens position and strength
      const dt = Math.min(64, Math.max(0, now - last))
      last = now
      const follow = 1 - Math.exp(-dt / FOLLOW_MS)
      const dx = target.x - pointer.x
      const dy = target.y - pointer.y
      pointer.x += dx * follow
      pointer.y += dy * follow
      influence += (influenceTarget - influence) * (1 - Math.exp(-dt / INFLUENCE_MS))
      if (Math.abs(influenceTarget - influence) < 0.002) influence = influenceTarget

      const busy = draw(now)
      const moving = influence > 0.001 && dx * dx + dy * dy > 0.04
      if (busy || moving || influence !== influenceTarget) {
        raf = requestAnimationFrame(tick)
      }
    }

    function wake() {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
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
      buildGrid()
      buildRadii('light')
      buildRadii('dark')
      if (developed) draw(performance.now())
      else wake()
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      target.x = e.clientX - rect.left
      target.y = e.clientY - rect.top
      // entering from rest: the lens starts under the pointer, not where it left
      if (influence < 0.01) {
        pointer.x = target.x
        pointer.y = target.y
      }
      influenceTarget = 1
      wake()
    }
    const onLeave = () => {
      influenceTarget = 0
      wake()
    }

    if (interactive) {
      canvas.addEventListener('pointermove', onMove, { passive: true })
      canvas.addEventListener('pointerleave', onLeave)
    }

    if (srcLight && srcLight === srcDark) {
      loadImage(['light', 'dark'], srcLight, fallbackSrc)
    } else {
      loadImage(['light'], srcLight, fallbackSrc)
      loadImage(['dark'], srcDark, fallbackSrc)
    }

    const ro = new ResizeObserver(() => layout())
    ro.observe(canvas)

    // theme flip: every dot re-inks in place (instant under reduced motion)
    let lastKind = activeKind()
    const mo = new MutationObserver(() => {
      const nowKind = activeKind()
      if (nowKind === lastKind) return
      const from = lastKind
      lastKind = nowKind
      if (reduced || !radii[from]) {
        draw(performance.now())
        return
      }
      morph = { from, start: performance.now() }
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
      {srcDark && srcDark !== srcLight ? (
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
