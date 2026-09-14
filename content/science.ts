/**
 * Science content, structured. Each theme names research constructs in plain language, links to
 * verified references by id, and states what the evidence does not show. Only verified references are
 * rendered (see getThemeReferences).
 *
 * Language rules (docs/SCIENCE_AND_CLAIMS.md): "is associated with", "research suggests", "in this
 * study", "may". Never "proves", "rewires", "heals", "treats", "clinically proven".
 */

import { getReference, type Reference } from './references';

export const RESEARCH_NOTE =
  'Research here informs the design; it does not establish that AI for Meaning provides clinical benefit.';

export interface ScienceTheme {
  id: string;
  lens: string;
  title: string;
  construct: string;
  summary: string;
  designImplication: string;
  doesNotShow: string;
  referenceIds: string[];
}

export const SCIENCE_THEMES: ScienceTheme[] = [
  {
    id: 'self-referential',
    lens: 'Presence',
    title: 'The wandering, story-making mind',
    construct: 'Mind-wandering, self-referential cognition, the default mode network',
    summary:
      'In a large experience-sampling study, people reported being less happy when their minds wandered than when they did not. Neuroimaging research has associated meditation experience with differences in activity and connectivity of the default mode network, a set of brain regions linked with self-referential thought.',
    designImplication:
      'The Mirror does not try to stop thinking. It offers a few moments to notice thought as weather — with less narration from the software, not more.',
    doesNotShow:
      'These are associations from specific samples. They do not show that any app changes brain activity, or that fewer thoughts means better wellbeing for any given person.',
    referenceIds: ['killingsworth-gilbert-2010', 'brewer-2011', 'lutz-2008'],
  },
  {
    id: 'decentering',
    lens: 'Presence',
    title: 'Stepping back from experience',
    construct: 'Decentering, self-distancing, present-moment awareness',
    summary:
      'Operational definitions of mindfulness describe attention to present experience with an attitude of curiosity and acceptance. Research on self-distancing suggests that reflecting on experience from a slightly more distanced perspective is associated with less emotional reactivity for many people.',
    designImplication:
      'The core line — “This is the weather. You are the one noticing it.” — is a gentle invitation to notice from a step back, never an instruction to detach from feeling.',
    doesNotShow:
      'Decentering is not avoidance, and research on it does not suggest that difficult feelings should be pushed away or that stepping back suits every moment.',
    referenceIds: ['bishop-2004', 'kross-ayduk-2017', 'lutz-2008'],
  },
  {
    id: 'interoception',
    lens: 'Rootedness',
    title: 'Noticing the body from the inside',
    construct: 'Interoception, interoceptive awareness, narrative and experiential self-reference',
    summary:
      'Interoception refers to sensing the internal state of the body. Researchers have developed multidimensional self-report measures of interoceptive awareness, and a recent meta-analysis of randomised trials found a small-to-moderate positive effect of mindfulness training on self-reported interoception. Earlier neuroimaging work described distinct “narrative” and “experiential” modes of self-reference.',
    designImplication:
      'Storm begins with the body — shaking, stretching, sighing, feeling the feet — before any invitation to be still.',
    doesNotShow:
      'Self-reported interoception is not the same as physiological accuracy, and more body attention is not helpful for everyone; for some people it can intensify distress.',
    referenceIds: ['farb-2007', 'farb-2015', 'mehling-2012', 'treves-2025', 'craig-2009', 'khalsa-2018'],
  },
  {
    id: 'awe',
    lens: 'Spaciousness',
    title: 'Vastness and the small self',
    construct: 'Awe, self-transcendent experience',
    summary:
      'Awe has been described as a response to perceived vastness that challenges existing mental frames. In a series of studies, experiences of awe were associated with a sense of a “smaller self” and with more prosocial behaviour. Researchers have also mapped varieties of self-transcendent experience and developed a multifactor measure of awe.',
    designImplication:
      'Song widens the field slowly and asks one open question. Expansion is always paired with an easy way back to the room.',
    doesNotShow:
      'Awe research does not show that an app can reliably produce awe, and a felt loss of self-boundaries can be unsettling for some people — which is why Ground is always available.',
    referenceIds: ['keltner-haidt-2003', 'piff-2015', 'yaden-2017', 'yaden-2019'],
  },
  {
    id: 'meaning',
    lens: 'Meaning',
    title: 'Coherence, purpose, significance',
    construct: 'Meaning in life',
    summary:
      'Meaning in life has been usefully distinguished into three facets: coherence (life makes sense), purpose (direction) and significance (life matters). Validated questionnaires distinguish the presence of meaning from the search for it.',
    designImplication:
      'The closing invitation — a word worth carrying — leaves meaning entirely to the person. The Mirror never tells anyone what their experience meant.',
    doesNotShow:
      'We do not measure meaning, and the Inner Sky is not a meaning score. Nothing here suggests meaning can be installed by software.',
    referenceIds: ['martela-steger-2016', 'steger-2006'],
  },
  {
    id: 'breath',
    lens: 'The Resonance',
    title: 'Slow breathing, gently and optionally',
    construct: 'Slow breathing, heart rate variability',
    summary:
      'A systematic review of studies in healthy participants found that slow-breathing techniques were associated with increased heart rate variability and with psychological reports such as greater relaxation. Heart-rate-variability biofeedback research has proposed mechanisms involving breathing near an individual resonance frequency, often around six breaths per minute in adults.',
    designImplication:
      'The orb can move at a slow visual pace of about six cycles per minute. It is labelled as a pacing option, can be adjusted or stopped, and is never required. There is no hyperventilation, breath-holding or forced breathing anywhere.',
    doesNotShow:
      'Resonance frequency varies between people, study protocols differ widely, and none of this establishes a medically optimal breathing rate. Polyvagal theory, sometimes cited here, is actively contested.',
    referenceIds: ['zaccaro-2018', 'lehrer-gevirtz-2014', 'porges-2007', 'grossman-taylor-2007'],
  },
  {
    id: 'writing',
    lens: 'Word-trace',
    title: 'Putting experience into words',
    construct: 'Expressive writing',
    summary:
      'A line of research beginning in the 1980s has studied writing about personal experience. Effects reported in later research are generally modest and vary between people and settings.',
    designImplication:
      'Writing is always optional and very short — a word or a phrase. It is reflected back in your own language, never interpreted.',
    doesNotShow:
      'Brief reflection is not a substitute for support after difficult or traumatic experiences.',
    referenceIds: ['pennebaker-beall-1986'],
  },
  {
    id: 'challenges',
    lens: 'The Ground',
    title: 'Why we stay gentle',
    construct: 'Meditation-related challenges and adverse effects',
    summary:
      'Contemplative practice can bring difficult experiences as well as helpful ones. A qualitative study of Western Buddhist practitioners documented a wide range of challenging meditation-related experiences. In one structured-interview study of 96 participants in mindfulness-based programs, 83% reported at least one meditation-related side effect, 58% reported effects with negative valence, and 37% reported effects with a negative impact on functioning. Experiences varied greatly in intensity and duration. A systematic review has also examined adverse effects across meditation interventions and mind–body practices.',
    designImplication:
      'Short sessions, movement before stillness, no forced breathing, every stage skippable, Ground one tap away, and plain signposting to human help.',
    doesNotShow:
      'The figures above come from one study with its own sample and interview method; they are not a prevalence estimate for all meditators, and they do not predict any individual’s experience.',
    referenceIds: ['lindahl-2017', 'britton-2021', 'taylor-2022'],
  },
  {
    id: 'hcai',
    lens: 'The design ethic',
    title: 'Technology that supports human agency',
    construct: 'Human-centred artificial intelligence',
    summary:
      'Human-centred AI frameworks argue for systems that combine high levels of automation with high levels of human control, and that support rather than replace human judgement.',
    designImplication:
      'Mirror, not Master: the software reflects and asks; the person decides. The Fade exists so that dependence decreases over time.',
    doesNotShow:
      'Design frameworks are normative guidance, not evidence that any particular product achieves those aims.',
    referenceIds: ['shneiderman-2020', 'shneiderman-2022', 'lindgren-2021'],
  },
];

export function getThemeReferences(theme: ScienceTheme): Reference[] {
  return theme.referenceIds
    .map((id) => getReference(id))
    .filter((r): r is Reference => r !== undefined && r.verified);
}

export function shortCitation(r: Reference): string {
  const first = r.authors[0]?.split(',')[0] ?? 'Unknown';
  const etAl = r.authors.length > 2 ? ' et al.' : r.authors.length === 2 ? ` & ${r.authors[1]?.split(',')[0]}` : '';
  return `${first}${etAl}, ${r.year}`;
}
