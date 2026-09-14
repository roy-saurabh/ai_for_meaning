# Reference verification log

Source of truth for the entries in `content/references.ts`. Every entry was checked against the Crossref REST API (`https://api.crossref.org/works/<DOI>`), and against PubMed where the work is indexed. Abstracts were read from PubMed, Crossref/OpenAlex, or the publisher page to write interpretations.

Status key:

- **verified**: DOI, authors, year, title and venue all matched the concept document.
- **corrected**: the work exists and is verified, but the concept document's citation was incomplete or wrong. The correction is noted.
- **unverified**: the work could not be confirmed. It is set to `verified: false` and does not render.

| id | status | source checked | corrections vs concept document | date checked |
|---|---|---|---|---|
| brewer-2011 | verified | https://api.crossref.org/works/10.1073/pnas.1112029108 ; https://pubmed.ncbi.nlm.nih.gov/22114193/ | None | 2026-09-14 |
| lutz-2008 | verified | https://api.crossref.org/works/10.1016/j.tics.2008.01.005 ; https://pubmed.ncbi.nlm.nih.gov/18329323/ | None | 2026-09-14 |
| bishop-2004 | verified | https://api.crossref.org/works/10.1093/clipsy.bph077 (not in PubMed) | DOI added. 11 authors, listed as the first 6 + et al. | 2026-09-14 |
| killingsworth-gilbert-2010 | verified | https://api.crossref.org/works/10.1126/science.1192439 ; https://pubmed.ncbi.nlm.nih.gov/21071660/ | Added reference. Citation as given is correct. | 2026-09-14 |
| farb-2007 | corrected | https://api.crossref.org/works/10.1093/scan/nsm030 ; https://pubmed.ncbi.nlm.nih.gov/18985137/ | Added volume 2, issue 4, pages 313–322 and the DOI (none were in the concept document) | 2026-09-14 |
| farb-2015 | verified | https://api.crossref.org/works/10.3389/fpsyg.2015.00763 ; https://pubmed.ncbi.nlm.nih.gov/26106345/ | DOI added. 9 authors, listed as the first 6 + et al. | 2026-09-14 |
| khalsa-2018 | verified | https://api.crossref.org/works/10.1016/j.bpsc.2017.12.004 ; https://pubmed.ncbi.nlm.nih.gov/29884281/ | DOI added. 24 named authors plus the Interoception Summit 2016 participants group. | 2026-09-14 |
| craig-2009 | verified | https://api.crossref.org/works/10.1038/nrn2555 ; https://pubmed.ncbi.nlm.nih.gov/19096369/ | None | 2026-09-14 |
| mehling-2012 | verified | https://api.crossref.org/works/10.1371/journal.pone.0048230 ; https://pubmed.ncbi.nlm.nih.gov/23133619/ | None | 2026-09-14 |
| treves-2025 | corrected | https://api.crossref.org/works/10.1038/s41598-025-22661-4 ; https://pubmed.ncbi.nlm.nih.gov/41198766/ | The concept document had no exact title or venue. The work is *Scientific Reports* 15, article 38889 (6 Nov 2025), titled "A meta-analysis of the effects of mindfulness meditation training on self-reported interoception", with 10 authors. The abstract confirms g = 0.31 (95% CI 0.21–0.42) across 29 RCTs with 2,191 participants, and g = 0.41 for mindfulness-based programs. A correction (10.1038/s41598-025-32949-0) only fixes an author's name spelling. The preprint was titled "Minding the Body". | 2026-09-14 |
| keltner-haidt-2003 | verified | https://api.crossref.org/works/10.1080/02699930302297 ; https://pubmed.ncbi.nlm.nih.gov/29715721/ | None | 2026-09-14 |
| piff-2015 | verified | https://api.crossref.org/works/10.1037/pspi0000018 ; https://pubmed.ncbi.nlm.nih.gov/25984788/ | Journal name written out in full (JPSP) | 2026-09-14 |
| yaden-2017 | verified | https://api.crossref.org/works/10.1037/gpr0000102 (not in PubMed) | None | 2026-09-14 |
| yaden-2019 | corrected | https://api.crossref.org/works/10.1080/17439760.2018.1484940 (not in PubMed) | Year resolved: online 2018, print 2019. Uses 2019 with vol. 14, issue 4, pp. 474–488. Full subtitle added: "A multifactorial measure for a complex emotion". | 2026-09-14 |
| martela-steger-2016 | corrected | https://api.crossref.org/works/10.1080/17439760.2015.1137623 (not in PubMed) | Full subtitle added: "Distinguishing coherence, purpose, and significance" | 2026-09-14 |
| steger-2006 | corrected | https://api.crossref.org/works/10.1037/0022-0167.53.1.80 (not in PubMed) | Full subtitle added: "Assessing the presence of and search for meaning in life" | 2026-09-14 |
| lehrer-gevirtz-2014 | verified | https://api.crossref.org/works/10.3389/fpsyg.2014.00756 ; https://pubmed.ncbi.nlm.nih.gov/25101026/ | None | 2026-09-14 |
| zaccaro-2018 | verified | https://api.crossref.org/works/10.3389/fnhum.2018.00353 ; https://pubmed.ncbi.nlm.nih.gov/30245619/ | None | 2026-09-14 |
| porges-2007 | verified | https://api.crossref.org/works/10.1016/j.biopsycho.2006.06.009 ; https://pubmed.ncbi.nlm.nih.gov/17049418/ | None. The limitations field notes that the theory is contested. | 2026-09-14 |
| grossman-taylor-2007 | verified | https://api.crossref.org/works/10.1016/j.biopsycho.2005.11.014 ; https://pubmed.ncbi.nlm.nih.gov/17081672/ | Added as the critique of polyvagal theory: *Biological Psychology* 74(2), 263–285, the same issue as Porges | 2026-09-14 |
| kross-ayduk-2017 | verified | https://api.crossref.org/works/10.1016/bs.aesp.2016.10.002 ; first page of the chapter PDF | None. Crossref shortens the title to "Self-Distancing". The chapter's first page confirms the full title and Volume 55. | 2026-09-14 |
| pennebaker-beall-1986 | corrected | https://api.crossref.org/works/10.1037/0021-843X.95.3.274 ; https://pubmed.ncbi.nlm.nih.gov/3745650/ | Full subtitle added: "Toward an understanding of inhibition and disease". No abstract was available, so the study summary should be checked against the full text before publication. | 2026-09-14 |
| lindahl-2017 | corrected | https://api.crossref.org/works/10.1371/journal.pone.0176239 ; https://pubmed.ncbi.nlm.nih.gov/28542181/ | Full subtitle added: "A mixed-methods study of meditation-related challenges in Western Buddhists" | 2026-09-14 |
| britton-2021 | corrected | https://api.crossref.org/works/10.1177/2167702621996340 ; https://pubmed.ncbi.nlm.nih.gov/35174010/ | Added vol. 9, issue 6, pp. 1185–1204 and DOI 10.1177/2167702621996340. The abstract confirms n = 96 (three variants of 8-week MBCT), 83% with at least one meditation-related side effect, 58% with negative-valence adverse effects, 37% with a negative impact on functioning, and 6–14% with lasting bad effects. | 2026-09-14 |
| taylor-2022 | corrected | https://api.crossref.org/works/10.1007/s12671-022-01915-6 ; https://link.springer.com/article/10.1007/s12671-022-01915-6 | Issue 8 added. Not in PubMed. | 2026-09-14 |
| shneiderman-2020 | corrected | https://api.crossref.org/works/10.1080/10447318.2020.1741118 | Pages 495–504 and the DOI added | 2026-09-14 |
| shneiderman-2022 | verified | https://api.crossref.org/works/10.1093/oso/9780192845290.001.0001 ; https://academic.oup.com/book/41126 | The book exists: Oxford University Press, 13 Jan 2022, ISBN 9780192845290. Both the article and the book are included. | 2026-09-14 |
| lindgren-2021 | verified | https://api.crossref.org/works/10.1109/MIS.2020.3044944 ; https://ieeexplore.ieee.org/document/9294071/ | This entry was flagged as suspect, but it exists as cited: *IEEE Intelligent Systems* 36(2), 72–80. Five authors. Crossref indexes the third author as "Rosero, Esteban Guerrero"; it is rendered here as "Guerrero Rosero, E." | 2026-09-14 |

**Summary:** 28 references, 28 verified (18 match the concept document as cited, 10 corrected), 0 unverified.

## Policy

1. **Only verified references render publicly.** UI code must use `verifiedReferences` or check `reference.verified === true`. An entry with `verified: false` may stay in the file as a working note, but it must never appear on the site.
2. **Adding a new reference:**
   - Look up the DOI on Crossref (`https://api.crossref.org/works/<DOI>`, or `https://api.crossref.org/works?query.bibliographic=<citation>&rows=3`). Copy the authors, year, title, venue, volume, issue and pages from that record, not from memory or secondary citations.
   - If the work is in PubMed, set `url` to `https://pubmed.ncbi.nlm.nih.gov/<PMID>/`. Otherwise use the official publisher URL, or leave `url` empty.
   - Read the abstract, or the full text if no abstract exists, before writing `interpretation`. Describe what *that* study found in *its* sample. Use cautious language ("was associated with", "in this study", "may"). Never write "proves", "rewires", "heals" or "treats". Neuroimaging findings must not be written as causal claims.
   - Write honest `limitations` covering sample, design, self-report, and whether the design is correlational.
   - Set `verified: true` only when DOI, authors, year, title and venue have all been confirmed against Crossref, PubMed or the publisher. Record what you checked in `verificationNote`, and add a row to the table above.
   - If a statistic from the concept document cannot be found in the source, leave it out.
3. **Britton et al. (2021) framing rule.** The figures (83% at least one meditation-related side effect, 58% negative valence, 37% negative impact on functioning, 6–14% lasting bad effects) come from **one sample of 96 participants in mindfulness-based cognitive therapy programs**, assessed with a detailed interview. Wherever they appear, they must be attributed to that study's sample, e.g. "in one study of 96 participants in mindfulness-based programs...". They must never be presented as the universal prevalence of meditation harms, or as the risk for any individual user. The authors' own conclusion should be shown alongside them: rates were similar to those for other psychological treatments.
