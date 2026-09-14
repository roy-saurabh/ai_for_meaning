# Privacy architecture

Privacy is a product feature and a safety feature. The public policy at `/privacy` must always match
this document and the code. When behaviour changes, update all three.

## Defaults

- No accounts, no cookies (tested: no `Set-Cookie`), no analytics, pixels, session replay,
  fingerprinting or advertising, no third-party scripts, fonts or CDNs.
- CSP `connect-src 'self'`: the browser can only talk to this origin.
- Microphone permission is requested only after the person enables the experimental Breath-trace in
  Settings **and** selects it before a session (tested: `getUserMedia` never called on page load).
  Camera, motion sensors and other powerful features are disabled by `Permissions-Policy`.

## Data inventory

### Browser

| Store | Key | Contents | Lifetime |
| --- | --- | --- | --- |
| IndexedDB `ai-for-meaning` / `traces` | trace id | Only on "Keep locally": `createdAt`, `endedAt`, weather id or custom word, movements visited, guidance mode, trace mode, prompts shown, ground used, optional closing word, `schemaVersion` | Until removed or erased |
| IndexedDB `meta` / `fade` | `fade` | Completed-session count, quiet-entry and prompt preferences | Until reset or erased |
| localStorage | `afm.settings.v1` | Motion, sound, length, guidance, song, accessibility, experimental flag | Until erased |
| localStorage | `afm.onboarded.v1` | `"1"` | Until reset or erased |
| sessionStorage | `afm.session.v1` | Serialised in-progress session (for reload resume) | Tab lifetime; cleared at session end |
| Cache Storage | `afm-static-*`, `afm-pages-*` | Public site files for offline use | Replaced on each deployment; cleared by erase |

Never stored: raw audio, sensor streams, camera frames, Song reflection text, companion output,
scribbles, IP addresses, identifiers.

Schema migrations are pure (`migrateTrace`, `migrateFade`) and drop unknown fields.

### Server

| Data | Where | Retention |
| --- | --- | --- |
| Gathering presence | In-memory `Map<randomUUID, expiresAt>` | ≤ 45 s after last heartbeat; lost on restart |
| Rate-limit counters | In-memory, key = salted SHA-256 of forwarded IP, truncated | ≤ 1 window (60 s); salt random per process |
| Companion request (only if enabled) | Processed in memory, forwarded to Anthropic | Not logged or stored by the app |
| Application logs | Docker json-file | The app logs startup only; no request logging |
| Edge access log | Disabled for this vhost (`access_log off`) | — |
| Edge error log | `/var/log/nginx/aiformeaning.error.log` | Errors only; may include a client address for a failed request; rotated by the edge |

## Export and erase

- **Export JSON / readable text** (`lib/storage/export.ts`): everything the browser holds for the site.
- **Remove a trace**: from the Inner Sky list.
- **Delete everything**: deletes the IndexedDB database (awaiting deletion), both localStorage keys,
  the sessionStorage resume key and all `afm-*` caches, then notifies open views. Tested in unit and
  E2E tests to confirm the data is actually gone.

## Cloud companion (optional)

Disabled by default. If enabled:

- Keys are server-only (`lib/env/server.ts` imports `server-only`; no `NEXT_PUBLIC_` prefix).
- Minimum data: stage, optional weather word, the ≤ 280 characters typed. No ids, history, timestamps
  or metadata.
- The narrow safety gate runs before any network call; high-risk text never leaves the server.
- `/privacy` and `/honest-mirror` switch their wording automatically based on configuration.
- Review the provider's data-retention terms before enabling, and update the privacy policy's
  processor description if the provider changes.

## Items requiring professional legal review

- Identity of the data controller and a working privacy contact (`CONTACT_EMAIL`).
- GDPR/UK GDPR wording, lawful-basis statements and any DPIA for the optional cloud companion.
- Terms: governing law, liability wording and consumer-law compatibility.
- Whether edge error-log retention needs a stated period.
