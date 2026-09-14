/**
 * Scientific reference library for AI for Meaning.
 *
 * Every entry was checked against Crossref (api.crossref.org), PubMed and/or the
 * publisher record on 2026-09-14. See docs/REFERENCE_VERIFICATION.md for the audit
 * trail. Only entries with `verified: true` should be rendered publicly.
 */

export type EvidenceType =
  | 'neuroimaging'
  | 'experimental'
  | 'cross-sectional'
  | 'experience-sampling'
  | 'psychometric'
  | 'review'
  | 'systematic-review'
  | 'meta-analysis'
  | 'qualitative'
  | 'mixed-methods'
  | 'theoretical'
  | 'book';

export type ConstructId =
  | 'self-referential-cognition'
  | 'default-mode-network'
  | 'mind-wandering'
  | 'attention-monitoring'
  | 'decentering'
  | 'self-distancing'
  | 'interoception'
  | 'narrative-experiential-self'
  | 'awe'
  | 'self-transcendence'
  | 'meaning-in-life'
  | 'slow-breathing-hrv'
  | 'meditation-challenges'
  | 'expressive-writing'
  | 'human-centred-ai';

export interface Reference {
  id: string;
  authors: string[];
  year: number;
  title: string;
  publication: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  constructs: ConstructId[];
  interpretation: string;
  limitations: string;
  evidenceType: EvidenceType;
  verified: boolean;
  verificationNote: string;
}

export const references: Reference[] = [
  // ---------------------------------------------------------------------------
  // Witnessing / quiet mind
  // ---------------------------------------------------------------------------
  {
    id: 'brewer-2011',
    authors: [
      'Brewer, J. A.',
      'Worhunsky, P. D.',
      'Gray, J. R.',
      'Tang, Y.-Y.',
      'Weber, J.',
      'Kober, H.',
    ],
    year: 2011,
    title:
      'Meditation experience is associated with differences in default mode network activity and connectivity',
    publication: 'Proceedings of the National Academy of Sciences',
    volume: '108',
    issue: '50',
    pages: '20254–20259',
    doi: '10.1073/pnas.1112029108',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22114193/',
    constructs: ['default-mode-network', 'self-referential-cognition', 'mind-wandering'],
    interpretation:
      'In this fMRI study, experienced meditators showed relatively lower activity in main default mode network nodes (medial prefrontal and posterior cingulate cortices) across three meditation types than meditation-naive controls. Meditators also showed stronger coupling between posterior cingulate, dorsal anterior cingulate and dorsolateral prefrontal regions, a pattern the authors describe as consistent with less mind-wandering.',
    limitations:
      'Small cross-sectional group comparison of experienced meditators and controls, so differences cannot be attributed to meditation practice itself. Mind-wandering was inferred from brain activity patterns rather than measured directly.',
    evidenceType: 'neuroimaging',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 22114193): DOI, six authors, title, PNAS 108(50), 20254–20259 all match the concept document. Issue date 13 Dec 2011 (online 23 Nov 2011).',
  },
  {
    id: 'lutz-2008',
    authors: ['Lutz, A.', 'Slagter, H. A.', 'Dunne, J. D.', 'Davidson, R. J.'],
    year: 2008,
    title: 'Attention regulation and monitoring in meditation',
    publication: 'Trends in Cognitive Sciences',
    volume: '12',
    issue: '4',
    pages: '163–169',
    doi: '10.1016/j.tics.2008.01.005',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18329323/',
    constructs: ['attention-monitoring'],
    interpretation:
      'This review distinguishes two commonly studied styles of meditation: focused attention (voluntarily holding attention on a chosen object) and open monitoring (non-reactive monitoring of moment-to-moment experience). The authors propose that these practices may train distinct attentional and emotional regulatory functions.',
    limitations:
      'A conceptual review rather than new data; the two-style framework is a simplification of diverse practices, and the long-term brain and behavioural effects it discusses were proposed rather than established.',
    evidenceType: 'review',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 18329323): DOI, four authors, title, Trends in Cognitive Sciences 12(4), 163–169 match the concept document.',
  },
  {
    id: 'bishop-2004',
    authors: [
      'Bishop, S. R.',
      'Lau, M.',
      'Shapiro, S.',
      'Carlson, L.',
      'Anderson, N. D.',
      'Carmody, J.',
      'et al.',
    ],
    year: 2004,
    title: 'Mindfulness: A proposed operational definition',
    publication: 'Clinical Psychology: Science and Practice',
    volume: '11',
    issue: '3',
    pages: '230–241',
    doi: '10.1093/clipsy.bph077',
    constructs: ['attention-monitoring', 'decentering'],
    interpretation:
      'Drawing on consensus meetings, this paper proposes a two-component operational model of mindfulness: self-regulation of attention toward immediate experience, and an orientation toward that experience characterised by curiosity, openness and acceptance. It was intended to make mindfulness more testable in research.',
    limitations:
      'A consensus-based theoretical proposal rather than an empirical study; other definitions of mindfulness exist and the model has been debated since publication.',
    evidenceType: 'theoretical',
    verified: true,
    verificationNote:
      'Crossref (and OpenAlex abstract): DOI, title, Clinical Psychology: Science and Practice 11(3), 230–241 match. Crossref lists 11 authors, so the list is truncated to the first six plus et al. Not indexed in PubMed, so no PubMed URL.',
  },
  {
    id: 'killingsworth-gilbert-2010',
    authors: ['Killingsworth, M. A.', 'Gilbert, D. T.'],
    year: 2010,
    title: 'A wandering mind is an unhappy mind',
    publication: 'Science',
    volume: '330',
    issue: '6006',
    pages: '932',
    doi: '10.1126/science.1192439',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21071660/',
    constructs: ['mind-wandering'],
    interpretation:
      'Using a smartphone experience-sampling method, this study found that people were thinking about something other than what they were doing almost as often as they were attending to the present activity. In this sample, mind-wandering moments were associated with lower reported happiness.',
    limitations:
      'Participants were self-selected smartphone users, and happiness and mind-wandering were both self-reported. The design is correlational, so it cannot establish that mind-wandering causes unhappiness.',
    evidenceType: 'experience-sampling',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 21071660): DOI, authors, title, Science 330(6006), 932 match the concept document (added reference).',
  },
  {
    id: 'farb-2007',
    authors: [
      'Farb, N. A. S.',
      'Segal, Z. V.',
      'Mayberg, H.',
      'Bean, J.',
      'McKeon, D.',
      'Fatima, Z.',
      'Anderson, A. K.',
    ],
    year: 2007,
    title:
      'Attending to the present: mindfulness meditation reveals distinct neural modes of self-reference',
    publication: 'Social Cognitive and Affective Neuroscience',
    volume: '2',
    issue: '4',
    pages: '313–322',
    doi: '10.1093/scan/nsm030',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18985137/',
    constructs: ['narrative-experiential-self', 'self-referential-cognition', 'interoception'],
    interpretation:
      'This fMRI study compared a narrative focus (monitoring enduring traits) with an experiential focus (monitoring momentary experience). In participants who had completed an 8-week mindfulness course, experiential focus was associated with larger reductions in medial prefrontal activity and greater engagement of a right-lateralised network including the insula, compared with novices. The authors interpret this as suggesting two neurally dissociable modes of self-reference.',
    limitations:
      'Modest sample and group comparison; brain activity differences are correlational and depend on task instructions, so they do not show what participants experienced or that the course alone produced the differences.',
    evidenceType: 'neuroimaging',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 18985137): DOI, seven authors, title, SCAN 2(4), 313–322 confirmed. Concept document omitted volume/issue/pages; these were added.',
  },

  // ---------------------------------------------------------------------------
  // Body / interoception
  // ---------------------------------------------------------------------------
  {
    id: 'farb-2015',
    authors: [
      'Farb, N.',
      'Daubenmier, J.',
      'Price, C. J.',
      'Gard, T.',
      'Kerr, C.',
      'Dunn, B. D.',
      'et al.',
    ],
    year: 2015,
    title: 'Interoception, contemplative practice, and health',
    publication: 'Frontiers in Psychology',
    volume: '6',
    pages: '763',
    doi: '10.3389/fpsyg.2015.00763',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26106345/',
    constructs: ['interoception'],
    interpretation:
      'This interdisciplinary review proposes an expanded taxonomy of interoceptive processes and links them to a predictive coding model of mind-body integration. The authors suggest that maladaptive interpretation of bodily sensations may contribute to various conditions and that contemplative practices may reduce such interpretive biases.',
    limitations:
      'A narrative, integrative review; its proposals about contemplative practice and health are hypotheses to be tested rather than established findings.',
    evidenceType: 'review',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 26106345): DOI, title, Frontiers in Psychology 6, article 763 match. Nine authors, so truncated to first six plus et al.',
  },
  {
    id: 'khalsa-2018',
    authors: [
      'Khalsa, S. S.',
      'Adolphs, R.',
      'Cameron, O. G.',
      'Critchley, H. D.',
      'Davenport, P. W.',
      'Feinstein, J. S.',
      'et al.',
    ],
    year: 2018,
    title: 'Interoception and mental health: A roadmap',
    publication: 'Biological Psychiatry: Cognitive Neuroscience and Neuroimaging',
    volume: '3',
    issue: '6',
    pages: '501–513',
    doi: '10.1016/j.bpsc.2017.12.004',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29884281/',
    constructs: ['interoception'],
    interpretation:
      'This consensus review from the 2016 Interoception Summit defines interoception as how the nervous system senses, interprets and integrates signals from within the body. It summarises evidence that altered interoception is increasingly recognised as a component of several mental health conditions and sets out priorities for assessment and research.',
    limitations:
      'An expert consensus overview rather than a systematic review or new data; it highlights conceptual and methodological challenges that remain unresolved in measuring interoception.',
    evidenceType: 'review',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 29884281): DOI, title, journal, 3(6), 501–513 match. PubMed lists 24 named authors plus the Interoception Summit 2016 participants group; truncated to first six plus et al.',
  },
  {
    id: 'craig-2009',
    authors: ['Craig, A. D.'],
    year: 2009,
    title: 'How do you feel — now? The anterior insula and human awareness',
    publication: 'Nature Reviews Neuroscience',
    volume: '10',
    issue: '1',
    pages: '59–70',
    doi: '10.1038/nrn2555',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19096369/',
    constructs: ['interoception'],
    interpretation:
      'This review discusses evidence implicating the anterior insular cortex in a wide range of conditions and behaviours, and proposes that its re-representation of interoceptive signals may offer a basis for subjective feelings and awareness.',
    limitations:
      'A theoretical synthesis; the proposal that the anterior insula is a neural correlate of awareness is one influential hypothesis and remains debated.',
    evidenceType: 'review',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 19096369): DOI, single author, title, Nature Reviews Neuroscience 10(1), 59–70 match the concept document. Crossref renders the author as A. D. (Bud) Craig.',
  },
  {
    id: 'mehling-2012',
    authors: [
      'Mehling, W. E.',
      'Price, C.',
      'Daubenmier, J. J.',
      'Acree, M.',
      'Bartmess, E.',
      'Stewart, A.',
    ],
    year: 2012,
    title: 'The Multidimensional Assessment of Interoceptive Awareness (MAIA)',
    publication: 'PLOS ONE',
    volume: '7',
    issue: '11',
    pages: 'e48230',
    doi: '10.1371/journal.pone.0048230',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23133619/',
    constructs: ['interoception'],
    interpretation:
      'This paper describes the development of the MAIA, a 32-item self-report questionnaire assessing eight aspects of interoceptive body awareness, through literature review, focus groups, cognitive testing and field testing. The authors present it as a starting point for research and further refinement.',
    limitations:
      'Field-tested largely with students and instructors of mind-body approaches, which may limit generalisability; self-report measures of interoception do not necessarily align with performance-based measures.',
    evidenceType: 'psychometric',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 23133619): DOI, six authors, title, PLOS ONE 7(11), e48230 match the concept document.',
  },
  {
    id: 'treves-2025',
    authors: [
      'Treves, I. N.',
      'Chen, Y.-Y.',
      'Wilson, C. L.',
      'Verdonk, C.',
      'Qina`au, J.',
      'Pustejovsky, J. E.',
      'et al.',
    ],
    year: 2025,
    title:
      'A meta-analysis of the effects of mindfulness meditation training on self-reported interoception',
    publication: 'Scientific Reports',
    volume: '15',
    issue: '1',
    pages: '38889',
    doi: '10.1038/s41598-025-22661-4',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41198766/',
    constructs: ['interoception'],
    interpretation:
      'This pre-registered meta-analysis of 29 randomised controlled trials (2,191 participants) found a small-to-medium positive effect of mindfulness interventions on self-reported interoception (g = 0.31, 95% CI 0.21 to 0.42), with the largest effects for mindfulness-based programs (g = 0.41). Improvements in self-reported interoception were related to improvements in psychological distress.',
    limitations:
      'Outcomes were self-report interoception scales (most often the MAIA), which may partly reflect expectations or changes in how people describe their bodies; the pooled sample was 77.8% female.',
    evidenceType: 'meta-analysis',
    verified: true,
    verificationNote:
      'Confirmed via Crossref and PubMed (PMID 41198766). Concept document gave no venue/DOI: it is Scientific Reports 15, article 38889 (published 6 Nov 2025), 10 authors. Effect size g = 0.31 confirmed from the abstract. A June 2025 Research Square preprint had the title Minding the Body. A correction (10.1038/s41598-025-32949-0) only fixes the spelling of author Joanne Qina`au and does not change results.',
  },

  // ---------------------------------------------------------------------------
  // Awe / self-transcendence
  // ---------------------------------------------------------------------------
  {
    id: 'keltner-haidt-2003',
    authors: ['Keltner, D.', 'Haidt, J.'],
    year: 2003,
    title: 'Approaching awe, a moral, spiritual, and aesthetic emotion',
    publication: 'Cognition and Emotion',
    volume: '17',
    issue: '2',
    pages: '297–314',
    doi: '10.1080/02699930302297',
    url: 'https://pubmed.ncbi.nlm.nih.gov/29715721/',
    constructs: ['awe'],
    interpretation:
      'This paper proposes a prototype model of awe in which two appraisals are central: perceived vastness and a need for accommodation (difficulty assimilating an experience into existing mental structures). Additional appraisals such as threat, beauty or virtue are proposed to shape the tone of awe experiences.',
    limitations:
      'A theoretical account derived from literature in religion, philosophy, sociology and psychology; it does not present new empirical data.',
    evidenceType: 'theoretical',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 29715721): DOI, authors, title, Cognition and Emotion 17(2), 297–314 match the concept document.',
  },
  {
    id: 'piff-2015',
    authors: ['Piff, P. K.', 'Dietze, P.', 'Feinberg, M.', 'Stancato, D. M.', 'Keltner, D.'],
    year: 2015,
    title: 'Awe, the small self, and prosocial behavior',
    publication: 'Journal of Personality and Social Psychology',
    volume: '108',
    issue: '6',
    pages: '883–899',
    doi: '10.1037/pspi0000018',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25984788/',
    constructs: ['awe', 'self-transcendence'],
    interpretation:
      'Across five studies (N = 2,078), dispositional awe was associated with greater generosity, and brief awe inductions increased ethical decision-making, generosity and prosocial values relative to control conditions. Mediation analyses suggested these effects were partly explained by feelings of a small self.',
    limitations:
      'Mostly short laboratory or field inductions with immediate outcomes, so durability is unknown; mediation analyses are statistical and do not by themselves establish causal mechanisms.',
    evidenceType: 'experimental',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 25984788): DOI, five authors, title, JPSP 108(6), 883–899 match the concept document.',
  },
  {
    id: 'yaden-2017',
    authors: ['Yaden, D. B.', 'Haidt, J.', 'Hood, R. W.', 'Vago, D. R.', 'Newberg, A. B.'],
    year: 2017,
    title: 'The varieties of self-transcendent experience',
    publication: 'Review of General Psychology',
    volume: '21',
    issue: '2',
    pages: '143–160',
    doi: '10.1037/gpr0000102',
    constructs: ['self-transcendence', 'awe'],
    interpretation:
      'This integrative review defines self-transcendent experiences as transient states marked by decreased self-salience and increased feelings of connectedness, and groups related constructs such as mindfulness, flow, peak and mystical-type experiences, and awe. It proposes possible psychological and neurobiological mechanisms and directions for research.',
    limitations:
      'A narrative, integrative review; the proposed mechanisms are provisional and draw on heterogeneous literatures of varying quality.',
    evidenceType: 'review',
    verified: true,
    verificationNote:
      'Crossref (abstract included): DOI, five authors, title, Review of General Psychology 21(2), 143–160 match. Not indexed in PubMed.',
  },
  {
    id: 'yaden-2019',
    authors: [
      'Yaden, D. B.',
      'Kaufman, S. B.',
      'Hyde, E.',
      'Chirico, A.',
      'Gaggioli, A.',
      'Zhang, J. W.',
      'Keltner, D.',
    ],
    year: 2019,
    title:
      'The development of the Awe Experience Scale (AWE-S): A multifactorial measure for a complex emotion',
    publication: 'The Journal of Positive Psychology',
    volume: '14',
    issue: '4',
    pages: '474–488',
    doi: '10.1080/17439760.2018.1484940',
    constructs: ['awe', 'self-transcendence'],
    interpretation:
      'In this scale-development work, participants recalled an intense awe experience and completed survey items; factor analyses supported six factors (altered time perception, self-diminishment, connectedness, perceived vastness, physical sensations, need for accommodation) in a first sample (N = 501), confirmed in a second (N = 636).',
    limitations:
      'Relies on retrospective self-report of a recalled awe experience, which may be shaped by memory and by how participants interpret the word awe; further validation across contexts is needed.',
    evidenceType: 'psychometric',
    verified: true,
    verificationNote:
      'Crossref (OpenAlex abstract): published online 18 Jul 2018, in print 2019 as Journal of Positive Psychology 14(4), 474–488. Correction vs concept document: year resolved to 2019 (print), volume/issue/pages added, full subtitle added. Seven authors.',
  },

  // ---------------------------------------------------------------------------
  // Meaning
  // ---------------------------------------------------------------------------
  {
    id: 'martela-steger-2016',
    authors: ['Martela, F.', 'Steger, M. F.'],
    year: 2016,
    title:
      'The three meanings of meaning in life: Distinguishing coherence, purpose, and significance',
    publication: 'The Journal of Positive Psychology',
    volume: '11',
    issue: '5',
    pages: '531–545',
    doi: '10.1080/17439760.2015.1137623',
    constructs: ['meaning-in-life'],
    interpretation:
      'This theoretical article distinguishes three facets of meaning in life: coherence (life making sense), purpose (core goals and direction) and significance (a sense that life is inherently valuable and worth living). The authors argue research may benefit from examining these facets separately.',
    limitations:
      'A conceptual overview without new data; the three-facet structure was proposed here and has been examined empirically only in later work.',
    evidenceType: 'theoretical',
    verified: true,
    verificationNote:
      'Crossref (OpenAlex abstract): DOI, authors, JPP 11(5), 531–545 match. Correction vs concept document: full published title includes the subtitle Distinguishing coherence, purpose, and significance. Online Jan 2016.',
  },
  {
    id: 'steger-2006',
    authors: ['Steger, M. F.', 'Frazier, P.', 'Oishi, S.', 'Kaler, M.'],
    year: 2006,
    title:
      'The Meaning in Life Questionnaire: Assessing the presence of and search for meaning in life',
    publication: 'Journal of Counseling Psychology',
    volume: '53',
    issue: '1',
    pages: '80–93',
    doi: '10.1037/0022-0167.53.1.80',
    constructs: ['meaning-in-life'],
    interpretation:
      'Across three studies, this paper reports evidence for the internal consistency, temporal stability, factor structure and validity of the Meaning in Life Questionnaire, a 10-item measure with separate subscales for the presence of and search for meaning in life.',
    limitations:
      'Validation relied on a limited set of samples, and the measure captures self-reported perceptions of meaning rather than any external criterion.',
    evidenceType: 'psychometric',
    verified: true,
    verificationNote:
      'Crossref (OpenAlex abstract): DOI, four authors, JCP 53(1), 80–93 match. Correction vs concept document: full title includes subtitle Assessing the presence of and search for meaning in life. Not indexed in PubMed.',
  },

  // ---------------------------------------------------------------------------
  // Breath
  // ---------------------------------------------------------------------------
  {
    id: 'lehrer-gevirtz-2014',
    authors: ['Lehrer, P. M.', 'Gevirtz, R.'],
    year: 2014,
    title: 'Heart rate variability biofeedback: How and why does it work?',
    publication: 'Frontiers in Psychology',
    volume: '5',
    pages: '756',
    doi: '10.3389/fpsyg.2014.00756',
    url: 'https://pubmed.ncbi.nlm.nih.gov/25101026/',
    constructs: ['slow-breathing-hrv'],
    interpretation:
      'This review discusses possible mechanisms for heart rate variability biofeedback, which typically involves slow breathing near a resonance frequency. The authors identify strengthening of baroreflex-mediated homeostasis as the best-supported mechanism and discuss a proposed vagal afferent pathway to frontal cortical areas.',
    limitations:
      'A mechanistic review by researchers active in the field rather than a systematic evaluation; several proposed mechanisms are still hypotheses.',
    evidenceType: 'review',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 25101026): DOI, authors, title, Frontiers in Psychology 5, article 756 match the concept document.',
  },
  {
    id: 'zaccaro-2018',
    authors: [
      'Zaccaro, A.',
      'Piarulli, A.',
      'Laurino, M.',
      'Garbella, E.',
      'Menicucci, D.',
      'Neri, B.',
      'Gemignani, A.',
    ],
    year: 2018,
    title:
      'How breath-control can change your life: A systematic review on psycho-physiological correlates of slow breathing',
    publication: 'Frontiers in Human Neuroscience',
    volume: '12',
    pages: '353',
    doi: '10.3389/fnhum.2018.00353',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30245619/',
    constructs: ['slow-breathing-hrv'],
    interpretation:
      'This systematic review of 15 studies in healthy participants found that slow breathing techniques (under 10 breaths per minute) were associated with increased heart rate variability and respiratory sinus arrhythmia, EEG changes, and psychological reports such as greater relaxation and alertness and reduced anxiety, anger and confusion.',
    limitations:
      'Only 15 heterogeneous studies met criteria, with small samples and varied protocols and outcomes; there was no meta-analysis, and results in healthy participants may not generalise to clinical populations.',
    evidenceType: 'systematic-review',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 30245619): DOI, seven authors, title, Frontiers in Human Neuroscience 12, article 353 match the concept document.',
  },
  {
    id: 'porges-2007',
    authors: ['Porges, S. W.'],
    year: 2007,
    title: 'The polyvagal perspective',
    publication: 'Biological Psychology',
    volume: '74',
    issue: '2',
    pages: '116–143',
    doi: '10.1016/j.biopsycho.2006.06.009',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17049418/',
    constructs: ['slow-breathing-hrv'],
    interpretation:
      'This paper gives an explicit statement of polyvagal theory, which relates autonomic nervous system function to behaviour through proposed phylogenetic shifts in the neural regulation of two vagal systems. It is best read as an influential theoretical framework rather than settled physiology.',
    limitations:
      'Theoretical rather than empirical; key physiological and evolutionary claims of polyvagal theory are contested in the literature (see Grossman & Taylor, 2007, in the same journal issue).',
    evidenceType: 'theoretical',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 17049418): DOI, author, title, Biological Psychology 74(2), 116–143 match the concept document.',
  },
  {
    id: 'grossman-taylor-2007',
    authors: ['Grossman, P.', 'Taylor, E. W.'],
    year: 2007,
    title:
      'Toward understanding respiratory sinus arrhythmia: Relations to cardiac vagal tone, evolution and biobehavioral functions',
    publication: 'Biological Psychology',
    volume: '74',
    issue: '2',
    pages: '263–285',
    doi: '10.1016/j.biopsycho.2005.11.014',
    url: 'https://pubmed.ncbi.nlm.nih.gov/17081672/',
    constructs: ['slow-breathing-hrv'],
    interpretation:
      'This review sets out caveats in treating respiratory sinus arrhythmia as a direct index of cardiac vagal tone, such as confounding by breathing parameters and physical activity. The authors present evidence that polyvagal theory does not accurately depict the evolution of vagal control of heart rate variability.',
    limitations:
      'A critical review and argument rather than new experimental data; the debate with proponents of polyvagal theory is ongoing.',
    evidenceType: 'review',
    verified: true,
    verificationNote:
      'Added as the polyvagal critique. Crossref and PubMed (PMID 17081672): DOI, authors, title, Biological Psychology 74(2), 263–285 confirmed, same issue as Porges (2007).',
  },

  // ---------------------------------------------------------------------------
  // Decentering
  // ---------------------------------------------------------------------------
  {
    id: 'kross-ayduk-2017',
    authors: ['Kross, E.', 'Ayduk, O.'],
    year: 2017,
    title: 'Self-distancing: Theory, research, and current directions',
    publication: 'Advances in Experimental Social Psychology',
    volume: '55',
    pages: '81–136',
    doi: '10.1016/bs.aesp.2016.10.002',
    constructs: ['self-distancing', 'decentering'],
    interpretation:
      'This chapter reviews a research programme on self-distancing, such as reflecting on experiences from a distanced perspective or using distanced self-talk. The authors summarise evidence that, in many studies, distanced reflection was associated with less emotional reactivity and more adaptive meaning-making than immersed reflection.',
    limitations:
      'A review written largely by the researchers who developed the paradigm; many included studies are short-term laboratory experiments, so effects in everyday life and over time need further testing.',
    evidenceType: 'review',
    verified: true,
    verificationNote:
      'Crossref: DOI, authors, 2017, pages 81–136 match; Crossref metadata abbreviates the title to Self-Distancing. The chapter PDF first page confirms the full title and Advances in Experimental Social Psychology, Volume 55. Not in PubMed.',
  },

  // ---------------------------------------------------------------------------
  // Expressive writing
  // ---------------------------------------------------------------------------
  {
    id: 'pennebaker-beall-1986',
    authors: ['Pennebaker, J. W.', 'Beall, S. K.'],
    year: 1986,
    title: 'Confronting a traumatic event: Toward an understanding of inhibition and disease',
    publication: 'Journal of Abnormal Psychology',
    volume: '95',
    issue: '3',
    pages: '274–281',
    doi: '10.1037/0021-843X.95.3.274',
    url: 'https://pubmed.ncbi.nlm.nih.gov/3745650/',
    constructs: ['expressive-writing'],
    interpretation:
      'An early experiment comparing writing about difficult personal experiences with writing about neutral topics. It is widely credited with launching research on expressive writing; AI for Meaning cites it only as the origin of that line of research, not for any specific effect.',
    limitations:
      'A small student sample in a single study; subsequent research and meta-analyses suggest expressive writing effects are generally modest and variable, and it is not a substitute for professional support after trauma.',
    evidenceType: 'experimental',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 3745650): DOI, authors, title, Journal of Abnormal Psychology 95(3), 274–281 match. Correction vs concept document: full title includes subtitle Toward an understanding of inhibition and disease. PubMed, Crossref and Semantic Scholar expose no abstract, so the study summary in the interpretation (design and health-centre-visit finding) could not be checked against an abstract and should be reviewed against the full text before publication. Metadata itself is verified.',
  },

  // ---------------------------------------------------------------------------
  // Safety
  // ---------------------------------------------------------------------------
  {
    id: 'lindahl-2017',
    authors: ['Lindahl, J. R.', 'Fisher, N. E.', 'Cooper, D. J.', 'Rosen, R. K.', 'Britton, W. B.'],
    year: 2017,
    title:
      'The varieties of contemplative experience: A mixed-methods study of meditation-related challenges in Western Buddhists',
    publication: 'PLOS ONE',
    volume: '12',
    issue: '5',
    pages: 'e0176239',
    doi: '10.1371/journal.pone.0176239',
    url: 'https://pubmed.ncbi.nlm.nih.gov/28542181/',
    constructs: ['meditation-challenges'],
    interpretation:
      'Through interviews with Western Buddhist meditation practitioners and teachers in Theravāda, Zen and Tibetan traditions, this study developed a taxonomy of 59 meditation-related experiences across seven domains and 26 categories of influencing factors. Experiences ranged from very positive to very negative, and associated distress or impairment ranged from minimal and transient to severe and enduring.',
    limitations:
      'The interview study focused on challenging experiences in a specific population of Western Buddhist practitioners, so it describes the range of such experiences rather than how common they are.',
    evidenceType: 'mixed-methods',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 28542181): DOI, five authors, PLOS ONE 12(5), e0176239 match. Correction vs concept document: full title includes subtitle A mixed-methods study of meditation-related challenges in Western Buddhists.',
  },
  {
    id: 'britton-2021',
    authors: ['Britton, W. B.', 'Lindahl, J. R.', 'Cooper, D. J.', 'Canby, N. K.', 'Palitsky, R.'],
    year: 2021,
    title: 'Defining and measuring meditation-related adverse effects in mindfulness-based programs',
    publication: 'Clinical Psychological Science',
    volume: '9',
    issue: '6',
    pages: '1185–1204',
    doi: '10.1177/2167702621996340',
    url: 'https://pubmed.ncbi.nlm.nih.gov/35174010/',
    constructs: ['meditation-challenges'],
    interpretation:
      'In this study, an independent assessor interviewed 96 participants after three variants of an 8-week mindfulness-based cognitive therapy program. In this sample, 83% reported at least one meditation-related side effect, 58% reported meditation-related adverse effects with negative valence, and 37% reported effects with a negative impact on functioning; lasting bad effects occurred in 6–14% of this sample. These are findings from one sample of program participants, not population prevalence estimates, and the authors concluded the rates were similar to those for other psychological treatments.',
    limitations:
      'A single sample of 96 participants in one program type, assessed by a detailed interview that may capture more (including mild and transient) effects than routine monitoring; rates may not generalise to other populations, practices, apps or settings.',
    evidenceType: 'psychometric',
    verified: true,
    verificationNote:
      'Crossref and PubMed (PMID 35174010): DOI, five authors, title, Clinical Psychological Science 9(6), 1185–1204 (online 18 May 2021). Concept document lacked volume/issue/pages/DOI; added. Abstract figures confirmed verbatim: n = 96; 83% at least one MRSE; 58% negative valence; 37% negative impact on functioning; lasting bad effects 6–14%.',
  },
  {
    id: 'taylor-2022',
    authors: [
      'Taylor, G. B.',
      'Vasquez, T. S.',
      'Kastrinos, A.',
      'Fisher, C. L.',
      'Puig, A.',
      'Bylund, C. L.',
    ],
    year: 2022,
    title:
      'The adverse effects of meditation-interventions and mind–body practices: A systematic review',
    publication: 'Mindfulness',
    volume: '13',
    issue: '8',
    pages: '1839–1856',
    doi: '10.1007/s12671-022-01915-6',
    url: 'https://link.springer.com/article/10.1007/s12671-022-01915-6',
    constructs: ['meditation-challenges'],
    interpretation:
      'This systematic review identified 61 studies reporting adverse effects of meditation interventions and mind–body practices. Mental-distress-related effects were reported far more often than physical symptoms, and meditation interventions were the most frequently studied practice.',
    limitations:
      'Randomised controlled trials were excluded and findings were synthesised narratively, so the review describes the kinds of adverse effects reported rather than their frequency or risk relative to control conditions.',
    evidenceType: 'systematic-review',
    verified: true,
    verificationNote:
      'Crossref and Springer article page: DOI, six authors, title, Mindfulness 13(8), 1839–1856 match; issue 8 added. Not indexed in PubMed, so the official Springer URL is used.',
  },

  // ---------------------------------------------------------------------------
  // Human-centred AI
  // ---------------------------------------------------------------------------
  {
    id: 'shneiderman-2020',
    authors: ['Shneiderman, B.'],
    year: 2020,
    title: 'Human-centered artificial intelligence: Reliable, safe & trustworthy',
    publication: 'International Journal of Human–Computer Interaction',
    volume: '36',
    issue: '6',
    pages: '495–504',
    doi: '10.1080/10447318.2020.1741118',
    constructs: ['human-centred-ai'],
    interpretation:
      'This article proposes the Human-Centered AI framework, arguing that designs can combine high levels of human control with high levels of computer automation, and that such designs are more likely to be reliable, safe and trustworthy while supporting human self-efficacy and responsibility.',
    limitations:
      'A design framework and position paper rather than an empirical evaluation; its claims about performance and adoption are arguments, not tested outcomes.',
    evidenceType: 'theoretical',
    verified: true,
    verificationNote:
      'Crossref (OpenAlex abstract): DOI, author, title, IJHCI 36(6), 495–504 (online Mar 2020). Pages 495–504 added vs concept document.',
  },
  {
    id: 'shneiderman-2022',
    authors: ['Shneiderman, B.'],
    year: 2022,
    title: 'Human-centered AI',
    publication: 'Oxford University Press',
    doi: '10.1093/oso/9780192845290.001.0001',
    url: 'https://academic.oup.com/book/41126',
    constructs: ['human-centred-ai'],
    interpretation:
      'This book expands the Human-Centered AI framework, arguing that AI design should aim to empower people and keep humans in meaningful control rather than replace them, and offers strategies for design, testing and governance.',
    limitations:
      'A single-author book presenting a perspective and design guidance; it is not a systematic review of evidence on AI outcomes.',
    evidenceType: 'book',
    verified: true,
    verificationNote:
      'Crossref: Oxford University Press, published 13 Jan 2022, ISBN 9780192845290, DOI 10.1093/oso/9780192845290.001.0001, Oxford Academic page book/41126. Both the 2020 article and the 2022 book exist.',
  },
  {
    id: 'lindgren-2021',
    authors: [
      'Lindgren, H.',
      'Kampik, T.',
      'Guerrero Rosero, E.',
      'Blusi, M.',
      'Nieves, J. C.',
    ],
    year: 2021,
    title: 'Argumentation-based health information systems: A design methodology',
    publication: 'IEEE Intelligent Systems',
    volume: '36',
    issue: '2',
    pages: '72–80',
    doi: '10.1109/MIS.2020.3044944',
    url: 'https://ieeexplore.ieee.org/document/9294071/',
    constructs: ['human-centred-ai'],
    interpretation:
      'This article presents a design methodology for health information systems that use formal argumentation, covering requirements for reasoning behaviour, knowledge and user models, and system-type considerations for clinical decision support, patient-facing and administrative systems. It outlines open challenges and mitigation strategies.',
    limitations:
      'A methodological proposal without an empirical evaluation of user outcomes; its applicability to non-clinical, reflective applications is an extrapolation.',
    evidenceType: 'theoretical',
    verified: true,
    verificationNote:
      'Crossref (OpenAlex abstract): exists as cited: IEEE Intelligent Systems 36(2), 72–80, 2021, DOI 10.1109/MIS.2020.3044944, five authors. Crossref indexes the third author with family name Rosero and given names Esteban Guerrero; rendered here as Guerrero Rosero, E.',
  },
];

export const verifiedReferences = references.filter((r) => r.verified);

export function getReference(id: string): Reference | undefined {
  return references.find((r) => r.id === id);
}
