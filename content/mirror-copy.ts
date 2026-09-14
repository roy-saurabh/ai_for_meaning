/**
 * Deterministic, reviewed copy for the Witnessing Mirror.
 *
 * Voice: sparse, humane, invitational. Never commands, never diagnoses, never promises an outcome.
 * Every line here is safe to show without any AI involvement.
 */

import type { PresetWeatherId } from '@/lib/mirror/weather';

export const ARRIVAL = {
  eyebrow: 'Arrival',
  title: 'How is your inner weather right now?',
  lighter: 'How is the weather?',
  note: 'There is no right answer. Any word will do, including none of these.',
};

export const MEETING: Record<PresetWeatherId | 'custom', string> = {
  tense: 'This is the weather. You are the one noticing it.',
  heavy: 'Heaviness, here for now. You are the one noticing it.',
  foggy: 'Fog is weather too. You are the one noticing it.',
  bright: 'Brightness, here for now. You are the one noticing it.',
  numb: 'Even quiet weather is weather. You are the one noticing it.',
  mixed: 'More than one thing at once. You are the one noticing it.',
  custom: 'This is the weather, in your word. You are the one noticing it.',
};

export const CONSENT = {
  eyebrow: 'Before we begin',
  title: 'How should the mirror listen?',
  note: 'The art can move with the session on its own. Nothing is sensed unless you choose it.',
};

/** Storm: an invitation to move, never a command. Breath guidance is optional and gentle. */
export const STORM_LINES = [
  'Let something move, if movement feels right.',
  'You can stay still, move, or skip this entirely.',
  'If it feels good, let the shoulders rise and drop.',
  'Shake out the hands, or simply notice them.',
  'A long, comfortable sigh is welcome. So is silence.',
  'Feel the feet. Let the floor take some of the weight.',
];

export const TRANSITION_LINES = ['Letting the movement settle, at its own pace.'];

export const STILLNESS_LINES = [
  'Nothing to improve for a moment.',
  'Weather passes through. Nothing needs to be held.',
  'Breath at its own pace.',
];

export const SONG_PROMPTS = [
  'What feels quietly alive right now?',
  'Is there anything here worth carrying into the rest of your day?',
];

export const CLOSE = {
  eyebrow: 'Close',
  title: 'Nothing needed to happen.',
  lead: 'Notice whether anything feels different. Nothing needs to have changed.',
  simpleLead: 'You can leave it here.',
  saveQuestion: 'Keep a trace in your Inner Sky?',
  saveNote: 'A trace is a few facts — the date, your weather, the movements visited — kept only in this browser.',
  wordLabel: 'One word to carry, if you like',
  wordPlaceholder: 'optional',
};

export const FADE_NOTE = 'The mirror can become quieter as it becomes familiar.';

export const PAUSED = {
  title: 'Paused.',
  note: 'Take whatever time you need. Nothing continues until you choose.',
};

/** Ground — the reviewed, deterministic grounding sequence. Never generated. */
export const GROUND = {
  eyebrow: 'Ground',
  title: 'Look around the room.',
  steps: [
    'Let the screen become ordinary again.',
    'Notice three ordinary things you can see.',
    'Feel the surface beneath you — the chair, the floor, your feet.',
    'You can end here.',
  ],
};

export const HIGH_RISK = {
  title: 'It sounds like things may be very hard right now.',
  body: [
    'The reflections have stopped. This is a moment for a person, not an app.',
    'If you might be in danger or unable to keep yourself safe, please contact your local emergency number now.',
    'You can also reach a free, confidential helpline, or someone you trust.',
  ],
};

export const TRACE_COPY = {
  none: {
    title: 'No sensing',
    status: 'recommended',
    body: 'The art responds only to the session itself and to what you choose. Nothing is sensed.',
  },
  breath: {
    title: 'Breath-trace',
    status: 'experimental',
    body: 'The orb responds to the loudness of sound near your microphone, such as a sigh or hum. It does not measure breathing. Audio is processed in this browser and never recorded, stored or sent.',
  },
  unavailable: [
    { title: 'Pulse-trace', body: 'Not yet available.' },
    { title: 'Motion-trace', body: 'Not yet available.' },
    { title: 'Voice-trace', body: 'Not yet available.' },
  ],
};

/** Pick a line deterministically by index, cycling. */
export function lineAt(lines: readonly string[], index: number): string {
  if (lines.length === 0) return '';
  const i = ((index % lines.length) + lines.length) % lines.length;
  return lines[i] ?? '';
}
