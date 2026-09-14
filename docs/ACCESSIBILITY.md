# Accessibility

Target: WCAG 2.2 AA across every route and every Mirror stage.

## Approach

- **Semantic DOM first.** One `h1` per page, landmarks (`header`, `nav` with labels, `main#main`,
  `footer`), lists for lists, `fieldset`/`legend` and labels for every control.
- **Canvas is decorative.** Every canvas is `aria-hidden`. Anything it depicts is available as text:
  the phase label, the guidance line, a screen-reader description of the weather visual, star buttons
  with factual labels on the Inner Sky, and a "Traces as a list" alternative.
- **Keyboard.** Everything is reachable and operable by keyboard. Skip link to `#main`. The mobile menu
  is a modal dialog with focus trap, Escape to close and focus restoration. Mirror steps move focus to
  their heading on change. Scribble and the sky are never the only way to do anything.
- **Focus** is a 2 px gold outline with offset and halo; never suppressed.
- **Touch targets** are ≥ 48 px for primary controls (44 px minimum for small pills), tested on a
  Pixel 7 viewport.
- **Announcements are sparing.** A single polite live region announces phase changes; guidance line
  rotations are not announced. Companion reflections and Gathering counts use polite updates only in
  response to the person's action.
- **Contrast.** Text colours meet AA on the night ground; `faint` was lifted from the prototype value
  for small text. High-contrast mode raises secondary text and borders further.
- **Zoom and reflow.** Fluid type with `clamp`, no fixed heights on text containers, horizontal
  overflow tested at phone width on all key routes. The Mirror content column scrolls, so 200% zoom
  never hides controls.

## Motion

- `prefers-reduced-motion: reduce` → motion `minimal`: renderers draw one static frame on mount,
  resize and scene change; no hidden timers run loops. The pre-paint `ThemeScript` applies the
  preference before first render; reveal animations and CSS orb breathing are disabled.
- Settings offer Full / Gentle / Minimal and "Disable canvas motion".
- No flashes or strobes; Storm sparks are soft, small and short; no abrupt zoom or large parallax.

## Test coverage

| Test | What it checks |
| --- | --- |
| `tests/e2e/a11y.spec.ts` | axe-core (wcag2a/aa, 2.1, 2.2 AA) — no serious or critical violations on 15 routes, all Mirror stages (onboarding → Ground) and the open mobile menu |
| `tests/e2e/resilience.spec.ts` › keyboard only | Skip link, onboarding and weather selection by keyboard, focus visible on Ground |
| `tests/e2e/resilience.spec.ts` › reduced motion | `data-motion="minimal"`, content visible, canvas pixels unchanged over time |
| `tests/e2e/mobile.spec.ts` | No horizontal overflow; controls in viewport; target sizes |
| `tests/e2e/ground.spec.ts` | Ground focus management and visibility on every stage |
| `tests/component/SiteNav.test.tsx` | Dialog semantics, Escape, focus return, `aria-current` |
| `tests/component/ReducedMotion.test.tsx` | OS and local motion preferences resolve to minimal |

## Manual checks before major releases

- VoiceOver (iOS Safari, macOS Safari) through the Mirror arc and the Inner Sky.
- 200% and 400% browser zoom on `/`, `/mirror`, `/settings`.
- Windows High Contrast / forced colours on focus indicators.
- Keyboard-only through Settings export and delete.
