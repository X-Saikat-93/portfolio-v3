'use client'

import { useEffect, useRef } from 'react'

// A full-screen fragment shader drawn in the page ink. Replaces the licensed
// `shaders` package: plain WebGL2, no dependency. A browser without WebGL2
// never reports ready, so the stage's timeout falls back to the static art.

const VERTEX = `#version 300 es
in vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`

export const FRAGMENT_HEADER = `#version 300 es
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_ink;
out vec4 outColor;
`

const MAX_PIXEL_RATIO = 2

// Any CSS colour (oklch included) to 0–1 sRGB channels.
function inkChannels(color: string): [number, number, number] {
  const context = document.createElement('canvas').getContext('2d')
  if (!context) return [0, 0, 0]
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data
  return [r / 255, g / 255, b / 255]
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
}

export function InkShaderCanvas({
  fragment,
  ink,
  onReady,
  className,
  animated = true,
}: {
  /** GLSL body appended to FRAGMENT_HEADER; writes premultiplied outColor. */
  fragment: string
  ink: string
  onReady: () => void
  className?: string
  /** false draws one still frame, redrawn only on resize or theme change */
  animated?: boolean
}) {
  const hostRef = useRef<HTMLSpanElement>(null)
  const inkRef = useRef(ink)
  const onReadyRef = useRef(onReady)
  inkRef.current = ink
  onReadyRef.current = onReady

  useEffect(() => {
    // A fresh canvas per run: a context lost in cleanup stays lost on its
    // canvas, so reusing the element (React remounts effects in dev) fails.
    const host = hostRef.current
    if (!host) return
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'display:block;width:100%;height:100%'
    host.append(canvas)
    const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, antialias: false })
    if (!gl) return () => canvas.remove()

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX)
    const pixel = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_HEADER + fragment)
    const program = gl.createProgram()
    if (!vertex || !pixel || !program) return () => canvas.remove()
    gl.attachShader(program, vertex)
    gl.attachShader(program, pixel)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return () => canvas.remove()
    gl.useProgram(program)

    // one triangle that covers the viewport
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const resolution = gl.getUniformLocation(program, 'u_resolution')
    const time = gl.getUniformLocation(program, 'u_time')
    const inkUniform = gl.getUniformLocation(program, 'u_ink')

    // reduced motion draws one still frame, again only on resize or theme change
    const still = !animated || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let dirty = true
    let lastInk = ''
    let frame = 0
    let reported = false
    const start = performance.now()

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO)
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio))
      gl.viewport(0, 0, canvas.width, canvas.height)
      dirty = true
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    const draw = (now: number) => {
      if (inkRef.current !== lastInk) {
        lastInk = inkRef.current
        gl.uniform3fv(inkUniform, inkChannels(lastInk))
        dirty = true
      }
      if (still && !dirty) {
        frame = window.requestAnimationFrame(draw)
        return
      }
      dirty = false
      gl.uniform2f(resolution, canvas.width, canvas.height)
      gl.uniform1f(time, still ? 0 : (now - start) / 1000)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!reported) {
        reported = true
        onReadyRef.current()
      }
      frame = window.requestAnimationFrame(draw)
    }
    frame = window.requestAnimationFrame(draw)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      // free the context now: the stage remounts this on every visit, and
      // browsers cap live WebGL contexts
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [animated, fragment])

  return <span ref={hostRef} className={className} aria-hidden="true" />
}
