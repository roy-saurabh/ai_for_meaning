# Science and claims

AI for Meaning uses research to inform design decisions. It does not claim that the product produces
any clinical, psychological or wellbeing outcome, and no study of the product exists.

Persistent note, shown on `/science`, `/references` and the homepage:

> Research here informs the design; it does not establish that AI for Meaning provides clinical benefit.

## Where claims live

- `content/references.ts` — every citation, with authors, year, title, venue, volume/issue/pages, DOI,
  PubMed/official URL, constructs, a cautious interpretation, limitations, evidence type,
  `verified`, and a verification note.
- `content/science.ts` — nine themes. Each has a plain-language summary, the design implication,
  **what the evidence does not show**, and reference ids.
- Only `verified: true` references render (`getThemeReferences`, `verifiedReferences`).
- Unit tests (`tests/unit/misc.test.ts`) enforce that every cited id exists and is verified, DOIs are
  bare, forbidden claim words are absent, and the Britton figures are framed as a single study.

No scientific claim is hard-coded in JSX outside these files, except short paraphrases on `/ground`
and `/honest-mirror` that link back to the relevant theme.

## Language rules

Use: *is associated with, research suggests, in this study, may, has been linked with, in this sample.*

Avoid: *proves, rewires, heals, treats, cures, clinically proven, regulates (as a causal health claim),
evidence-based healing.*

Additional rules:

1. **Never universalise one study.** Britton et al. (2021) interviewed 96 participants in
   mindfulness-based cognitive therapy programs: 83% reported at least one meditation-related side
   effect, 58% reported effects with negative valence, 37% reported effects with a negative impact on
   functioning, and lasting bad effects occurred in 6–14%. Present these only as findings from that
   study's sample and method, never as prevalence among "meditators".
2. **Neuroscience is associational.** Say "was associated with differences in activity", not
   "quiets the default mode network".
3. **Breath pacing is not medical.** Six cycles/minute is described as an optional visual pace.
   Resonance frequency varies between people; polyvagal theory is contested (Grossman & Taylor 2007
   is cited alongside Porges 2007).
4. **Philosophy is not evidence.** Contemplative ideas (witnessing, active meditation, celebration)
   are presented on `/about` as inspiration, clearly separate from science. No invented quotations.
5. **No product efficacy claims** anywhere, including metadata and social cards.

## Adding or changing a reference

1. Look it up on Crossref (`https://api.crossref.org/works/<DOI>`) and PubMed or the publisher.
2. Add it to `content/references.ts` with `verified: false` until every field is confirmed.
3. Write the interpretation from the abstract or full text, in cautious language, and state limits.
4. Set `verified: true` and record what was checked in `verificationNote` and
   `docs/REFERENCE_VERIFICATION.md`.
5. Run `pnpm test`.

## Changes from the concept document

The concept document's reference list was verified; ten entries were corrected (see
`docs/REFERENCE_VERIFICATION.md`). Notable content changes:

- Synthetic "breath/min" and "coherence" readouts from the prototype were removed: without a real,
  validated Trace they would imply measurement.
- The Inner Sky no longer brightens "as you grow"; it composes traces without scoring.
- The Pennebaker & Beall (1986) interpretation was reduced to what verified metadata supports,
  because its abstract could not be checked.
- The Treves et al. (2025) meta-analysis was confirmed (Scientific Reports; g = 0.31, 95% CI
  0.21–0.42, 29 RCTs, n = 2,191).
