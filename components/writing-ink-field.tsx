'use client'

import { InkShaderCanvas } from '~/components/ink-shader-canvas'
import { useHiddenShaderField } from '~/components/use-hidden-shader-field'

// Four ink strands pinned at both edges of the midline, each swaying on its
// own phase: the same figure the former Strands preset drew.
const STRANDS = `
const float TAU = 6.2831853;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float pixel = 1.0 / u_resolution.y;
  float pin = sin(3.1415927 * uv.x);
  float alpha = 0.0;

  for (int i = 0; i < 4; i++) {
    float k = float(i) / 3.0;
    float wave = sin(uv.x * 1.4 * TAU + u_time * 0.72 + k * 2.4) * (0.7 - 0.25 * k);
    float y = 0.5 + pin * (wave * 0.3 + (k - 0.5) * 0.2);
    float gap = abs(uv.y - y);
    float halfWidth = max(0.006, 0.75 * pixel);
    alpha = max(alpha, 1.0 - smoothstep(halfWidth, halfWidth + 1.5 * pixel, gap));
  }

  outColor = vec4(u_ink * alpha, alpha);
}
`

export function WritingInkField({
  onUnavailable,
  onReady,
}: {
  onUnavailable: () => void
  onReady: () => void
}) {
  const { handleReady, ink, ready } = useHiddenShaderField(
    onUnavailable,
    onReady,
  )

  return (
    <span
      className="hidden-list-shader-shell"
      data-ready={ready ? 'true' : 'false'}
    >
      <InkShaderCanvas
        className="hidden-list-shader-canvas"
        fragment={STRANDS}
        ink={ink}
        onReady={handleReady}
      />
    </span>
  )
}
