/**
 * Output constraints for any Witness-Companion text, local or cloud.
 *
 * Cloud output is untrusted: it is checked here and replaced by a local reflection if it breaks any
 * rule. Local templates are unit-tested against the same rules, so the constraint set is the single
 * written definition of what the companion is not allowed to say.
 */

import { COMPANION_TEXT_MAX } from './types';

export interface ConstraintViolation {
  rule: string;
}

const FORBIDDEN: ReadonlyArray<{ rule: string; pattern: RegExp }> = [
  // Diagnosis and clinical labelling
  { rule: 'no-diagnosis', pattern: /\b(diagnos\w*|disorder|syndrome|symptom\w*|patholog\w*|clinical(ly)?)\b/i },
  { rule: 'no-clinical-labels', pattern: /\b(depress(ion|ed)|anxiety|ptsd|adhd|bipolar|psychos[ie]s|dissociat\w*|panic attack)\b/i },
  // Prescribing, advice, treatment
  { rule: 'no-prescription', pattern: /\byou (should|must|need to|have to|ought to)\b/i },
  { rule: 'no-treatment-language', pattern: /\b(treat(ment|ing)?|therap(y|ist|eutic)|heal(ing|s)?|cure[sd]?|medicat\w*|dosage|prescri\w*)\b/i },
  { rule: 'no-nervous-system-claims', pattern: /\b(nervous system|vagus|vagal|cortisol|dopamine|serotonin|regulat(e|ion))\b/i },
  // Interpretation and hidden knowledge
  { rule: 'no-causal-interpretation', pattern: /\b(is|are) (caused|driven) by\b|\bbecause (of )?your (past|childhood|trauma)\b/i },
  { rule: 'no-trauma-interpretation', pattern: /\btrauma\w*\b/i },
  { rule: 'no-hidden-knowledge', pattern: /\b(subconscious|unconscious(ly)?|deep down|repress\w*|suppress\w*)\b/i },
  { rule: 'no-mind-reading', pattern: /\bI (can )?(tell|sense|know|see|feel) (that )?(you|your)\b/i },
  { rule: 'no-emotion-meaning', pattern: /\b(this|that|it|your \w+) (really )?means (that )?you\b/i },
  // Authority, consciousness, dependence
  { rule: 'no-ai-consciousness', pattern: /\bI (am|'m) (conscious|aware|here for you|always here|your (guide|teacher|friend))\b/i },
  { rule: 'no-dependency', pattern: /\b(come back (tomorrow|every)|every (day|morning|night)|don't forget to|streak|daily practice)\b/i },
  { rule: 'no-guru-authority', pattern: /\b(enlighten\w*|awaken(ed|ing)?|higher self|spiritual (level|progress))\b/i },
  { rule: 'no-promises', pattern: /\b(will (make you|help you feel)|guarantee\w*|proven)\b/i },
  // Format
  { rule: 'no-markup', pattern: /[<>{}[\]#*_`]|https?:\/\//i },
];

export function checkCompanionText(text: string): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  const trimmed = text.trim();
  if (trimmed.length === 0) violations.push({ rule: 'non-empty' });
  if (trimmed.length > COMPANION_TEXT_MAX) violations.push({ rule: 'max-length' });
  const sentences = trimmed.split(/(?<=[.?!])\s+/).filter(Boolean);
  if (sentences.length > 2) violations.push({ rule: 'max-two-sentences' });
  for (const { rule, pattern } of FORBIDDEN) {
    if (pattern.test(trimmed)) violations.push({ rule });
  }
  return violations;
}

export function isAllowedCompanionText(text: string): boolean {
  return checkCompanionText(text).length === 0;
}
