# ADR 0001 — Next.js App Router with standalone output

**Status:** accepted · 2026-09-14

## Context
The site mixes editorial content that must be server-rendered and indexable with a highly interactive,
full-screen client experience. It runs on a single small shared VPS.

## Decision
Next.js 16.3 (App Router), React 19.3, TypeScript strict, Tailwind 4, `output: 'standalone'`, run as a
Node 24 container. Server Components by default; client components only as feature islands; heavy
generative code dynamically imported.

## Consequences
- Mature, well-understood foundation beneath experimental visuals.
- Standalone output keeps the runtime image small (≈ 50 MiB RSS idle) with no dev dependencies.
- `next start` is not used in production or E2E; `scripts/prepare-standalone.mjs` completes the output.
