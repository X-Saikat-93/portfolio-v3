# Design

This file is the product-level design contract for the portfolio. The
implementation-level tokens and motion values live in
[`docs/design-language.md`](docs/design-language.md); CSS comments already
reference that file as the design-language source.

## Product intent

The public site is an English-first, tactile reading surface for Saikat's
real work. It should feel closer to a working paper or a quiet editorial
archive than to a dashboard or a marketing template.

## Visual principles

1. **Paper before polish.** Use warm surfaces, hairlines, restrained shadows,
   and a small signal accent. Decoration should reinforce hierarchy, not
   compete with content.
2. **Type does the organizing.** Use the established font stack, clear
   metadata scale, and deliberate whitespace before adding containers or
   ornament.
3. **One signal per view.** The accent color is a navigational or state mark,
   not a replacement for readable text contrast.
4. **Motion is information.** Shared-element transitions, portrait reveals,
   and preview timing should explain route or content relationships. They must
   degrade to a usable instant navigation path.
5. **Empty is honest.** A collection with no real records should render a
   composed empty state, never synthetic examples.

## Interaction contracts

- Public navigation lives under `/en`; `/` redirects there.
- The halftone portrait and its hidden topographic field remain interactive,
  bounded, and usable with `prefers-reduced-motion` enabled.
- The dock exposes navigation and preferences without obscuring the reading
  column or trapping keyboard focus.
- Route transitions are progressive enhancement. Browsers without the View
  Transitions API still receive a complete page navigation.
- `/admin` shares the paper language but remains a private owner workspace;
  admin chrome must not leak into public metadata or social previews.

## Typography and layout

- Geist is the Latin interface font.
- Frex Sans GB is registered for locale and OG rendering support.
- Monospace is reserved for technical metadata, identifiers, and data-like
  marks.
- Prefer a readable central column, hairline separators, and a small number of
  surface elevations over dense card grids.
- Preserve focus visibility, semantic headings, text alternatives, and usable
  contrast when tuning the visual system.

## Content boundary

Visual treatment cannot manufacture content. New copy, images, books, music,
photographs, testimonials, or resume claims require real owner-supplied
material. Cloudinary is the published media boundary; Neon is the record
boundary for actual CMS, collection, media, and contact data.

## Review checklist

Before merging a visual change, verify:

- public copy stays English and under `/en`;
- the no-content state remains intentional;
- reduced motion and keyboard paths still work;
- the interaction does not cross the public/admin boundary;
- `pnpm typecheck`, `pnpm test:unit`, and `pnpm build` pass for significant
  changes.
