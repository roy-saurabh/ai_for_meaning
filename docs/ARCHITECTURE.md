# Architecture

## Shape of the system

```text
Browser ─────────────────────────────────────────────────────────────────────────────────────────
  Server-rendered pages (Next.js App Router, per-request CSP nonce)
  Client islands: Mirror, Inner Sky, Settings, canvases, Gathering
  Local state: IndexedDB (traces, Fade) · localStorage (settings) · sessionStorage (resume) · Cache Storage (SW)
        │  same-origin only
        ▼
Shared nginx edge (al360-nginx-prod, TLS, HSTS) ──► aiformeaning-web container (Node 24, Next standalone)
                                                     /api/health · /api/presence (in-memory) · /api/companion (optional)
                                                                                        │ only if configured
                                                                                        ▼
                                                                               Anthropic Messages API
```

There is no database, no user accounts, no queue and no analytics. The only server state is the
in-memory Gathering presence map and in-memory rate-limit counters, both of which disappear on restart.

## Directory layout (by domain)

| Path | Responsibility |
| --- | --- |
| `app/(site)/` | Editorial and utility routes with the site chrome (nav, footer) |
| `app/mirror/` | The full-screen Witnessing Mirror route (own chrome) |
| `app/api/` | `health`, `presence`, `companion` route handlers |
| `app/sw.js/` | Versioned service worker, generated per build |
| `components/mirror/` | Mirror orchestrator, steps, chrome, session controller hook |
| `components/generative/` | Canvas components and the shared canvas loop |
| `components/safety/` | Ground view |
| `components/sky/`, `settings/`, `practice/`, `gathering/`, `home/`, `science/` | Feature UI |
| `components/layout/`, `primitives/`, `brand/`, `seo/`, `pwa/` | Shared UI |
| `lib/mirror/` | Session state machine, weather, Fade (pure) |
| `lib/generative/` | Scene parameters, breath envelope, PRNG, Canvas2D renderer |
| `lib/companion/` | Provider contract, local provider, cloud adapter, output constraints |
| `lib/safety/` | Narrow text gate, help resources |
| `lib/storage/` | Schema + migrations, IndexedDB access, export/erase |
| `lib/sky/` | Deterministic constellation generation |
| `lib/presence/` | Presence store interface and in-memory implementation |
| `lib/audio/`, `lib/traces/` | Web Audio ambience, experimental Breath-trace adapter |
| `lib/settings/`, `lib/security/`, `lib/seo/`, `lib/env/`, `lib/api/`, `lib/text/` | Cross-cutting |
| `content/` | Structured copy: references, science themes, lexicon, practices, Mirror copy |
| `proxy.ts` | Per-request nonce and Content-Security-Policy |
| `deploy/` | Compose file, nginx vhosts, server scripts |
| `tests/` | `unit/`, `component/`, `e2e/`, `visual/` |

## State separation (mandatory)

The Mirror keeps six concerns apart. Nothing downstream mutates anything upstream.

1. **Domain/session state** — `lib/mirror/machine.ts`. A pure, serialisable finite-state machine:
   `transition(state, event) → state`. States: `arrival, weather, consent, storm,
   transition_to_stillness, stillness, song, close, grounding, paused, ended`. Time enters only as
   `TICK { deltaMs }`, so the machine is deterministic and pause-aware; overflow from a long tick
   carries into the next phase. Resumption after reload restores into `paused`.
2. **Controller** — `components/mirror/useMirrorSession.ts`. Owns the clock (a 250 ms interval that
   measures real elapsed time), dispatches `VISIBILITY_HIDDEN` when the tab hides, persists
   serialised state to `sessionStorage`. It contains no product logic.
3. **Animation/render state** — `lib/generative/field-renderer.ts`. Knows only a target
   `FieldParams` scene and the time. Scenes are derived with `sceneFor(phase, weather, progress)`.
   The renderer never reads or writes session state.
4. **Persistence** — `lib/storage`. Only on explicit "Keep locally"; traces are built from session
   state by a pure `traceFromSession`.
5. **Sensors** — `lib/traces/breath-trace.ts`. Exposes `value()`; the canvas polls it through a
   function prop so sensor updates never re-render React.
6. **Companion** — `lib/companion`. Called only from the Song step; never in the Ground path.
7. **Audio** — `lib/audio/ambient.ts`. Follows the visual phase through an effect; Ground silences it.

The orchestrator (`MirrorExperience.tsx`) wires these together and holds UI-only state (stage,
saving, notices).

## Rendering and performance

- Server Components by default; client components are feature islands.
- Canvas code is dynamically imported (`ssr: false`) and never part of LCP. The hero shows a CSS orb
  immediately and cross-fades to the canvas after `requestIdleCallback`.
- `useCanvasLoop` caps DPR at 2, caps fps (Stillness 40, Ground 20, ambient 45), pauses when the
  document is hidden or the canvas is off-screen, and under minimal motion draws a single static
  frame on mount/resize/scene change (no hidden loop).
- Particle budgets adapt to viewport width, `hardwareConcurrency` and the reduced-density setting.
- Trails are drawn as ghost sprites; the canvas is cleared every frame (destination-out fading leaves
  8-bit residue).

## Measured performance

Lighthouse 12, mobile preset (simulated slow 4G, 4× CPU), production standalone build, 14 Sep 2026:

| Route | Performance | Accessibility | Best practices | SEO | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | 91 | 100 | 100 | 100 | 3.5 s | 36–50 ms | 0 |
| `/mirror` | 93 | 100 | 100 | 100 | 3.2 s | 74 ms | 0 |
| `/science` | 92 | 100 | 100 | 100 | 3.3 s | 89 ms | 0 |

Observed (unthrottled) first contentful paint is ≈ 150 ms. Simulated LCP is dominated by font and CSS
transfer under slow 4G. Lessons encoded in the code:

- LCP candidates (hero and page headings) must not start at `opacity: 0`; no entrance animation on them.
- Canvas islands below the fold load through `WhenVisible`, not on hydration.
- Only the upright display face and Inter are preloaded; italic and mono load on demand.
- Keep Zod out of client bundles: Zod v4 probes `new Function("")`, which the strict CSP reports as a
  violation. Browser validation uses a dependency-free guard (`isCompanionInput`); the server keeps Zod.

The brief's LCP < 2.5 s target is met on real connections but not under Lighthouse's simulated slow 4G
(≈ 3.2–3.5 s). Further gains would need self-subsetting the fonts or dropping a family.

## Rendering mode and CSP

Every page is dynamically rendered because the CSP nonce is per request (`proxy.ts`). This costs a
few milliseconds of server time per page and is appropriate for the traffic profile; see
[ADR 0004](ADR/0004-content-security-policy.md). Metadata routes (`robots.txt`, `sitemap.xml`,
`manifest.webmanifest`) are static.

## API

| Endpoint | Behaviour |
| --- | --- |
| `GET /api/health` | `{status, version, commit}` only |
| `GET /api/presence` | `{count}`; 60 req/min per client |
| `POST /api/presence` | `join` → `{id, count}`; `heartbeat {id}` → `{count}` or 404 when expired; `leave {id}`. Zod-validated, 512-byte body limit, 30 req/min |
| `POST /api/companion` | 404 unless a cloud provider is configured. Zod-validated (stage, optional weather/movement, ≤ 280-char text), 2 KB limit, 12 req/min. Never logs bodies |

Rate-limit keys are salted SHA-256 hashes of the forwarded address, held in memory for one window.
The edge additionally limits `/api/` to 60 req/min.

## The Gathering

`PresenceStore` (`join`, `heartbeat`, `leave`, `count`) is the only contract routes use.
`InMemoryPresenceStore` keeps `id → expiresAt` with a 45 s TTL (clients heartbeat every 20 s) and a
10 000-entry cap. Moving to Redis means implementing the same interface with `SET key EX 45`.

## Offline and PWA

`/sw.js` is generated per build with a `version-commit` cache name. On install it precaches
`/offline`, `/mirror`, `/`, `/ground`, `/practice` and the `/_next/static` assets referenced by them.
Static assets are cache-first; navigations are network-first (4 s timeout) with cached fallback, then
`/offline`. `/api/*` is never cached. Activation deletes every `afm-*` cache that is not current, so a
deployment can never be trapped behind stale caches. "Delete everything" also clears these caches.

## Account/sync boundary (future)

Nothing assumes identity. If sync is ever added, it belongs behind `lib/storage` (traces already have
stable ids and `schemaVersion`) with end-to-end encryption, and must keep the local-first path as the
default. See [ADR 0002](ADR/0002-local-first-no-accounts.md).
