# AI for Meaning

Source for [aiformeaning.com](https://aiformeaning.com): a web application for self-awareness and
inner health. The core experience, the Witnessing Mirror, lets a person name their "inner weather",
watch responsive generative art reflect it, and move through three short movements — Storm,
Stillness, Song. It is local-first, needs no account, and is explicitly **not** therapy, diagnosis or
a crisis service.

The design principle is *Mirror, not Master*: the software reflects rather than directs, and gets
quieter as it becomes familiar (the Fade). Product vocabulary is defined in
[docs/PRODUCT_LANGUAGE.md](docs/PRODUCT_LANGUAGE.md).

## Stack

| Layer | Choice |
| --- | --- |
| Runtime | Node.js 24 LTS (Docker), ≥ 22.12 for local development |
| Framework | Next.js 16.3 (App Router, standalone output), React 19.3 |
| Language | TypeScript 5.9, `strict` + `noUncheckedIndexedAccess` |
| Styling | Tailwind CSS 4.3 with CSS custom-property tokens (`styles/globals.css`) |
| Visuals | Custom Canvas2D renderers (`lib/generative`), Web Audio (`lib/audio`) |
| Local data | IndexedDB via `idb` (`lib/storage`), localStorage for settings |
| Validation | Zod |
| Tests | Vitest + Testing Library, Playwright + axe-core |
| Package manager | pnpm 10 via Corepack |

There is no database, no authentication and no analytics. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Local setup

```bash
corepack enable            # provides the pinned pnpm version
pnpm install
cp .env.example .env.local # optional; defaults work without it
pnpm dev                   # http://localhost:3000
```

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Development server |
| `pnpm build` | Production build (standalone output) |
| `pnpm start` | Serve the standalone build (copies static assets first) |
| `pnpm lint` | ESLint, zero warnings allowed |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Unit and component tests (Vitest, jsdom, fake IndexedDB) |
| `pnpm test:e2e` | Playwright on Chromium desktop and Pixel 7 (needs `pnpm build` first) |
| `pnpm test:e2e:all` | All Playwright projects including Firefox/WebKit smoke and visual |
| `pnpm test:a11y` | axe-core audits of every route and every Mirror stage |
| `pnpm test:visual` | Screenshot regression at 390×844, 768×1024, 1440×1000 |
| `pnpm test:visual:update` | Regenerate visual baselines (per-platform directories) |
| `pnpm check` | lint + typecheck + unit tests + build |

Quality gate before merging: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm test:e2e`.

Visual baselines are stored per platform (`tests/visual/__screenshots__/<platform>/`). The committed
baselines are `darwin`; CI does not run the visual project until Linux baselines are generated with
`pnpm test:visual:update` on Linux.

## Environment

All variables are optional. See [.env.example](.env.example).

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | build | Canonical origin for metadata, sitemap and OG (default `https://aiformeaning.com`) |
| `MIRROR_COMPANION_PROVIDER` | server | `local` (default) or `anthropic` |
| `MIRROR_COMPANION_API_KEY` | server | Required for `anthropic`; never exposed to the browser |
| `MIRROR_COMPANION_BASE_URL` | server | Optional API base URL override |
| `MIRROR_COMPANION_MODEL` | server | Defaults to `claude-opus-5` |
| `CONTACT_EMAIL` | server | Privacy contact shown on `/privacy` |
| `HELP_RESOURCE_URL` / `HELP_RESOURCE_LABEL` | server | Override the default helpline directory (https only) |
| `APP_VERSION` / `GIT_COMMIT` | build | Reported by `/api/health`; set by CI |

## Testing notes

- **Deterministic rendering.** Tests inject `window.__AFM_TEST__` (`frozenTime`, `seed`,
  `timeScale`) so canvases are static and session timing is fast. Production visitors never have it.
- **E2E runs the production artifact** (`.next/standalone/server.js`), not the dev server.
- The offline test relies on the service worker, which registers only in production builds.

## Deployment

Production runs as a Docker container behind the shared nginx edge on the VPS. Pushing to `main`
runs CI, builds and pushes `ghcr.io/roy-saurabh/ai_for_meaning:<sha>`, and — once enabled — deploys over
SSH with a key that can only trigger a health-gated, auto-rolling-back release. Full procedure,
DNS records and the TLS steps: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Day-2 operations:
[docs/OPERATIONS.md](docs/OPERATIONS.md).

## Repository workflow

- `main` is the production branch; changes arrive by pull request from `build/*` or feature branches.
- CI (`.github/workflows/ci.yml`) must pass. The deploy workflow re-runs it before building the image.
- Commit in coherent units. Never commit `.env*` files, build output, or keys.

## Documentation

| Document | Contents |
| --- | --- |
| [ARCHITECTURE](docs/ARCHITECTURE.md) | Domains, state separation, data flow, rendering, API |
| [DESIGN_SYSTEM](docs/DESIGN_SYSTEM.md) | Tokens, type, materials, motion, generative art direction |
| [PRODUCT_LANGUAGE](docs/PRODUCT_LANGUAGE.md) | Lexicon and voice rules |
| [SCIENCE_AND_CLAIMS](docs/SCIENCE_AND_CLAIMS.md) | How research is used and the claim rules |
| [REFERENCE_VERIFICATION](docs/REFERENCE_VERIFICATION.md) | Per-reference verification log |
| [SAFETY](docs/SAFETY.md) | Ground, the narrow safety gate, companion constraints |
| [PRIVACY_ARCHITECTURE](docs/PRIVACY_ARCHITECTURE.md) | What is stored where, and what is not |
| [ACCESSIBILITY](docs/ACCESSIBILITY.md) | WCAG 2.2 AA approach and test coverage |
| [DEPLOYMENT](docs/DEPLOYMENT.md) | Image, VPS, edge, DNS, TLS, CI/CD, hardening |
| [OPERATIONS](docs/OPERATIONS.md) | Runbook: deploy, rollback, logs, renewals, incidents |
| [ADR](docs/ADR/) | Architecture decision records |
| [reference/](docs/reference/) | The original concept document and prototype (not runtime files) |
