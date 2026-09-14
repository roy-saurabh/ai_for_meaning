/**
 * Narrow safety gate for free text.
 *
 * This is NOT a distress classifier, risk predictor or diagnostic tool, and must never be described
 * as one. It checks written text for a short, reviewed list of explicit phrases that plainly refer
 * to suicide, self-harm, or being in immediate danger. When one matches, reflective interpretation
 * stops and the deterministic Ground pathway (with human-help information) is shown instead.
 *
 * Deliberate limits (documented in docs/SAFETY.md):
 * - False negatives are expected: people express difficulty in countless ways. The Ground and human
 *   help are therefore always available regardless of this gate.
 * - False positives are acceptable: the response is gentle, non-alarming and preserves agency.
 * - It never inspects voice, prosody, timing, drawings or anything other than text the person typed.
 * - Nothing about a match is stored or transmitted.
 */

export type GateResult = { level: 'none' } | { level: 'high-risk' };

// Patterns are matched against normalised lowercase text with collapsed whitespace.
const HIGH_RISK_PATTERNS: readonly RegExp[] = [
  // English
  /\b(kill|killing|hurt|hurting|harm|harming|cut|cutting)\s+(myself|my\s*self)\b/,
  /\bsuicid(e|al)\b/,
  /\b(end|ending|take|taking)\s+my\s+(own\s+)?life\b/,
  /\b(want|wanting|going|plan|planning)\s+to\s+die\b/,
  /\bwish\s+i\s+(was|were)\s+dead\b/,
  /\bbetter\s+off\s+dead\b/,
  /\bno\s+reason\s+to\s+(live|go\s+on)\b/,
  /\bself[\s-]?harm/,
  /\boverdos(e|ing)\b/,
  /\bnot\s+safe\s+(right\s+now|with\s+myself|at\s+home)\b/,
  /\b(hurt|kill)\s+(someone|somebody|them|him|her)\b/,
  // French
  /\b(me\s+suicider|suicidaire|me\s+tuer|en\s+finir\s+avec\s+la\s+vie|envie\s+de\s+mourir|me\s+faire\s+du\s+mal)\b/,
  // Spanish
  /\b(suicidarme|matarme|quitarme\s+la\s+vida|quiero\s+morir(me)?|hacerme\s+daño)\b/,
  // German
  /\b(mich\s+umbringen|selbstmord|suizid|nicht\s+mehr\s+leben|mir\s+etwas\s+antun)\b/,
];

export function normaliseForGate(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function checkText(text: string | null | undefined): GateResult {
  if (!text) return { level: 'none' };
  const normalised = normaliseForGate(text);
  if (normalised.length === 0) return { level: 'none' };
  return HIGH_RISK_PATTERNS.some((p) => p.test(normalised)) ? { level: 'high-risk' } : { level: 'none' };
}
