# Design language

This is the implementation-level reference for the visual system used by the
public site and the owner workspace. The token definitions live in
[`app/globals.css`](../app/globals.css); update this document when a design
decision changes so the code and the rationale stay aligned.

## Color roles

| Role | Token or implementation rule |
| --- | --- |
| Paper | `--paper` and the warm `.public-site` gray ramp |
| Ink | `--foreground`, `--paper-ink`, and the dark primary ramp |
| Surfaces | `--surface-1` through `--surface-8`, each a small elevation step |
| Signal | `--signal`, used sparingly for state or navigation marks |
| Borders | `--border` and `--border-hairline` for quiet separation |
| Focus | `--focus-ring` and the shared ring utility |

The accent is a signal, not a body-text color. Prefer semantic tokens and
surface roles over new hex values or one-off shadows. The dark mode palette
keeps the same roles while lifting surfaces from the paper rather than
introducing a separate visual language.

## Type and composition

- `--font-sans` resolves to Geist for Latin text and the registered Frex Sans
  GB fallback where locale or OG rendering requires it.
- `--font-mono` is for identifiers, measurements, technical metadata, and
  data-like marks.
- Use the existing weight tokens: 400 normal, 500 medium, and 600 semibold.
- Use a readable central column, a small number of surface elevations, and
  hairlines before adding card chrome.

## Motion

The motion contract is deliberately small:

| Token | Purpose |
| --- | --- |
| `--ease-swift` | Route and interface movement that should settle quickly |
| `--ease-spring` | Small expressive reveals with a controlled overshoot |
| `--duration-route-morph` | Shared route/cover transition timing |
| `--duration-post-meta` | Metadata staging timing |
| `--delay-post-body` | Delayed post-body reveal |

Every motion path must have a useful reduced-motion outcome. Use the existing
`prefers-reduced-motion` rules as the default and avoid introducing animation
that carries required information by itself.

## Layering and density

The established z-index contract is `--z-nav`, `--z-card`, and `--z-toast`.
Do not add a new stacking context to solve a local visual issue without
checking the route shell, dock, and toast layers first. Keep interactions in
the reading column unless the component is explicitly part of navigation or
feedback.

## Interaction invariants

- The halftone portrait is a progressive enhancement, not the only source of
  identity or meaning.
- Route motion is optional; a browser without View Transitions still gets a
  complete navigation.
- The dock remains keyboard reachable and must not cover essential content.
- Empty collections remain visually intentional and never render fabricated
  examples.
- Public and owner-admin chrome may share tokens but not trust assumptions.

## Review checklist

When changing the visual language, verify contrast, keyboard focus, reduced
motion, narrow viewport behavior, light/dark surfaces, and empty states. Run
the unit suite for interaction changes and use `pnpm build` for significant
route or asset changes.
