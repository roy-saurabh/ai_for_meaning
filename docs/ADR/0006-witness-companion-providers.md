# ADR 0006 — Deterministic local companion by default; constrained optional cloud adapter

**Status:** accepted · 2026-09-14

## Context
The product must be valuable without cloud AI, work offline, and never let a model diagnose, advise,
interpret or act as an authority. Safety pathways must be deterministic.

## Decision
`MirrorCompanionProvider` with two implementations:
- `LocalReflectionProvider` (default): reviewed templates that echo the person's own words, ask one
  open question or give a pointer; deterministic by input hash.
- `CloudReflectionProvider` (opt-in via server env): the official Anthropic TypeScript SDK, default
  model `claude-opus-5`, low effort, JSON-schema output, 8 s timeout, one retry, server-side refusal
  fallbacks. The safety gate runs before the call; outputs are re-checked by the same constraint set as
  the templates; any failure falls back to local.

No conversational interface, no history, no Ground content from a model.

## Consequences
- Offline and default deployments involve no third party.
- Enabling the cloud adapter requires privacy-policy review and a provider key on the server only.
