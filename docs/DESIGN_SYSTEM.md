# Design system

The feeling to protect: *"I entered a quiet living place, not a wellness dashboard."*
Calm comes from doing less — fewer controls, fewer words, more space — not from decoration.

## Tokens

Defined once in `styles/globals.css` (`@theme` for Tailwind utilities, `:root` for materials).

| Token | Value | Use |
| --- | --- | --- |
| `night` | `#09091A` | Base ground |
| `night-2` | `#101028` | Raised grounds |
| `panel` | `#15152F` | Icon/glyph backgrounds |
| `ink` | `#F4F0E9` | Primary text |
| `muted` | `#ADA6C2` | Secondary text (AA on night) |
| `faint` | `#8A84AA` | Tertiary text; lifted from the prototype's `#6E6890` for contrast |
| `faint-deco` | `#6E6890` | Decorative only, never text |
| `gold` `#F2C14E` · `amber` `#E8935B` · `rose` `#E86A6A` · `teal` `#6FD6C4` · `violet` `#9A8CFF` · `blue` `#5C7BC8` · `pale-blue` `#8FB7FF` | | Accents and art |

High-contrast mode (`data-contrast="high"` on `<html>`) raises `muted`, `faint` and line opacities and
removes grain. Larger text (`data-text="large"`) scales the root font size.

## Typography

Self-hosted at build time with `next/font` (no runtime requests to Google).

| Family | Role |
| --- | --- |
| Fraunces upright (opsz axis, preloaded, fixed at `opsz 96`) | Hero, section titles |
| Fraunces italic (loaded on demand, no opsz axis) | Accents and reflective prompts (`serif-italic`) |
| Inter | Body, labels, forms |
| Space Mono 400 (not preloaded) | Eyebrows, metadata, state labels, citations |

Scale: hero `display-xl` clamps 40 → 88 px; section `display-lg` 32 → 52 px; `display-md` 24 → 34 px;
body 16–19 px (`lead`); annotations 11–13 px mono with 0.14–0.26 em tracking. Prose measure 66ch.

## Materials

- **Atmosphere**: fixed layer with three restrained radial fields (gold high-left, violet high-right,
  teal low) over night, plus a static SVG fractal-noise grain at ~3.5% opacity with `soft-light`
  blending. Never animated.
- **Membrane** (`.membrane`): 1 px `--line` border, near-transparent vertical gradient, inset
  1 px highlight, internal radial glow via `--membrane-glow`. Radii 16 / 22 / 28 px by hierarchy.
- **Pills** (`.pill`): primary actions are pills; `pill-primary` is the gold–amber gradient,
  `pill-ground` the amber safety variant, `pill-ghost` for tertiary actions. Minimum height 48 px
  (44 px for `pill-sm`).
- **Focus**: 2 px gold outline, 3 px offset, soft gold halo. Never removed.

## Layout

Marketing width 1200 px with 20–40 px gutters and safe-area insets. Sections breathe (80–112 px
vertical). The Mirror is full-bleed with `100dvh`, safe-area padding and a scrollable content column
so controls are never hidden below the fold.

## Motion discipline

- Breathing uses asymmetric raised-cosine envelopes (`lib/generative/breath.ts`), ~6 cycles/min by
  default as a *visual pacing option*.
- Transitions settle with exponential approach (time constants: 2.4 s default, 5 s into Stillness,
  0.8 s into Ground).
- No flashes, strobes, abrupt zooms or constant large parallax. Reveal-on-scroll is a 14 px rise.
- Motion levels: `full`, `gentle` (≈45% speed, 30 fps, reduced breath depth, no sparks or trails),
  `minimal` (static frames only). The OS reduced-motion preference always maps to `minimal`.

## Generative art direction

Implemented as parameter sets in `lib/generative/scenes.ts`.

| Weather | Palette | Character |
| --- | --- | --- |
| Tense | rose-softened-toward-amber + amber | compact field, fast faceted orbits, small particles, compressed pulses |
| Heavy | cobalt + slate | large particles, low lift, gravity, slow drift, darkness between |
| Foggy | mauve + slate | very soft large particles, low contrast, slow |
| Bright | gold + amber | wide field, sparse, warm glow, upward/outward tendency |
| Numb | desaturated violet-grey | sparse, minimal motion, empty rotating sectors, dim orb |
| Mixed | gold + cobalt | two interleaved fields with different speed and lift |
| Custom word | one of five gentle palettes | deterministic from the word's hash; never interpreted |

Movements transform the base: **Storm** widens, speeds and adds soft amber/rose sparks (release, not
danger); **Stillness** pulls inward over its duration, shifts to teal/violet and opens space;
**Song** expands slowly in violet/gold with twinkle — no confetti; **Ground** is sparse, nearly still,
neutral and unpaced.

The **Breath Orb** is a layered membrane: violet halo, an asymmetrically deforming outer membrane
(sum of 2nd/3rd/5th harmonics), an inner membrane, slow warm eddies, a warm core point and a faint
specular rim — expanding and releasing rather than bouncing.

**Scribble**: amber→rose strokes, velocity-sensitive width, widening/softening with age, breaking into
motes, gone within ~3 s. Nothing is kept.

**Inner Sky**: a dark field with fixed dust; Storm adds warm low points, Stillness central teal,
Song outer violet/gold, a closing word a pale-blue point with a faint link. No brightening with count.

## Brand

Typographic wordmark "AI for *Meaning*" with warm emphasis on *Meaning*. The orb/ring glyph
(`OrbMark`, `public/icons/icon.svg`) is the symbol. Icons and the OG image are generated by
`scripts/generate-brand-assets.mjs`.

## Anti-patterns

No glassmorphism everywhere, no gradient blobs, no neon, no dashboards, no badges, no progress rings,
no red warning semantics for emotional states, no stock illustration, and no essential text inside a
canvas.
