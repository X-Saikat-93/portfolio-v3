'use client'

import { InkShaderCanvas } from '~/components/ink-shader-canvas'
import { useHiddenShaderField } from '~/components/use-hidden-shader-field'

// Graph paper ruled by hand in pencil: a still drawing, not a moving one.
// Each line wanders a pixel or so, presses lighter and heavier along its
// length, and carries graphite grain; every fourth line is ruled heavier.
const BLUEPRINT = `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// One family of parallel lines: coverage of the nearest line at position
// across, for a pixel at position along it.
float ruled(float across, float along, float cell, float seed) {
  float index = floor(across / cell + 0.5);
  float wander = (noise(vec2(along / 140.0, index * 7.13 + seed)) - 0.5) * 2.4;
  float gap = abs(across - (index * cell + wander));
  bool major = mod(index, 4.0) == 0.0;
  float halfWidth = major ? 0.7 : 0.4;
  float pressure = mix(0.55, 1.0, noise(vec2(along / 60.0, index * 3.1 + seed + 40.0)));
  float line = 1.0 - smoothstep(halfWidth, halfWidth + 1.0, gap);
  return line * pressure * (major ? 1.0 : 0.5);
}

void main() {
  vec2 px = gl_FragCoord.xy;
  float cell = u_resolution.x / 40.0;
  float alpha = max(ruled(px.x, px.y, cell, 0.0), ruled(px.y, px.x, cell, 19.0));
  alpha *= mix(0.45, 1.0, noise(px * 0.7));
  outColor = vec4(u_ink * alpha, alpha);
}
`

export function ProjectsBlueprintField({
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
        fragment={BLUEPRINT}
        ink={ink}
        animated={false}
        onReady={handleReady}
      />
    </span>
  )
}
