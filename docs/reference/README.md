# Original design references

These files are the original concept and interactive prototype that seeded AI for Meaning. They are
kept for provenance and design reference only.

- `AI_for_Meaning_Platform_Concept.md` — the platform concept, taxonomy, safeguards and reference list.
- `aiformeaning_prototype.html` — the single-file visual prototype.

They are **not** runtime application files: the production app never loads them, they are excluded
from linting, type-checking and the Docker image, and their contents are not authoritative. Where the
production app deliberately departs from them (for example, Storm no longer uses faster breathing,
the sky shows no brightening "progress", synthetic breath/coherence readouts were removed, and the
reference list was verified and corrected), the reasons are recorded in `docs/SAFETY.md`,
`docs/SCIENCE_AND_CLAIMS.md` and `docs/REFERENCE_VERIFICATION.md`.
