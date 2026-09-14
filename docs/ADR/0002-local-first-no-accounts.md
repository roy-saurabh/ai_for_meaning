# ADR 0002 — Local-first data, no accounts in v1

**Status:** accepted · 2026-09-14

## Context
Inner-life data is sensitive. Accounts add attack surface, legal obligations and friction, and pull
product design toward engagement and retention.

## Decision
No authentication. Session traces live in IndexedDB only when the person chooses "Keep locally";
settings in localStorage; export and genuine erase in Settings. The server stores no personal data.

## Consequences
- Data is lost if the browser's site data is cleared; the UI says so.
- No cross-device history. A future sync must sit behind `lib/storage`, be opt-in, and use end-to-end
  encryption with user-held keys. Traces already carry stable ids and `schemaVersion`.
