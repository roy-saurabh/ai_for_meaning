/**
 * Practice library — small, reviewed, deterministic. Every step is optional and interruptible.
 * No forced breathing, breath retention, hyperventilation, extreme cold or trance induction.
 */

export type PracticeCategory = 'arrival' | 'storm' | 'stillness' | 'song' | 'grounding';

export type PracticeSurface = 'none' | 'scribble' | 'orb' | 'orb-paced';

export interface Practice {
  slug: string;
  category: PracticeCategory;
  title: string;
  duration: string;
  /** Seconds used by the step timer. */
  seconds: number;
  summary: string;
  steps: string[];
  surface: PracticeSurface;
  note?: string;
}

export const PRACTICE_CATEGORIES: Record<PracticeCategory, { name: string; body: string; color: string }> = {
  arrival: { name: 'Arrival', body: 'Arriving where you already are.', color: '#F2C14E' },
  storm: { name: 'Storm', body: 'Letting something move first.', color: '#E8935B' },
  stillness: { name: 'Stillness', body: 'Noticing, without improving.', color: '#6FD6C4' },
  song: { name: 'Song', body: 'What feels quietly alive.', color: '#9A8CFF' },
  grounding: { name: 'Grounding', body: 'Back to the room, any time.', color: '#D9C7B0' },
};

export const PRACTICES: Practice[] = [
  {
    slug: 'three-ordinary-things',
    category: 'arrival',
    title: 'Three Ordinary Things',
    duration: '1–2 min',
    seconds: 90,
    summary: 'Let your eyes rest on three neutral things in the room.',
    surface: 'none',
    steps: [
      'Look away from the screen, if that feels fine.',
      'Find one ordinary thing. Notice its colour.',
      'Find a second. Notice its edges, its shape.',
      'Find a third. Notice how the light falls on it.',
      'That is enough. You have arrived.',
    ],
  },
  {
    slug: 'feel-the-surface',
    category: 'arrival',
    title: 'Feel the Surface',
    duration: '1 min',
    seconds: 60,
    summary: 'Notice what is holding you up.',
    surface: 'none',
    steps: [
      'Notice where your body meets the chair, the floor, or the bed.',
      'Is the surface firm or soft, cool or warm?',
      'Let it take a little more of your weight, if you like.',
      'Nothing else to do.',
    ],
  },
  {
    slug: 'shake-the-day',
    category: 'storm',
    title: 'Shake the Day',
    duration: '1–2 min',
    seconds: 90,
    summary: 'Gentle shaking of the hands, arms and shoulders.',
    surface: 'orb',
    note: 'Move only in ways that feel comfortable for your body. Sitting is fine. Stop whenever you like.',
    steps: [
      'Let the hands hang loose. Begin to shake them gently.',
      'If it feels good, let the shaking travel up to the wrists and forearms.',
      'Let the shoulders join in, or rise and drop a few times.',
      'Slow the movement down, a little at a time.',
      'Let everything come to rest. Notice what tingles, what settles.',
    ],
  },
  {
    slug: 'scribble-it-out',
    category: 'storm',
    title: 'Scribble It Out',
    duration: 'as long as you like',
    seconds: 120,
    summary: 'Draw freely. Nothing is saved, judged or interpreted.',
    surface: 'scribble',
    steps: [
      'Use a finger, pen or mouse on the dark surface below.',
      'Fast, slow, messy — any line is the right line.',
      'Watch the lines soften and fade on their own.',
    ],
  },
  {
    slug: 'one-long-sound',
    category: 'storm',
    title: 'One Long Sound',
    duration: '1 min',
    seconds: 60,
    summary: 'A comfortable hum or sigh. Nothing is recorded.',
    surface: 'orb',
    note: 'The microphone is not used. Breathe comfortably throughout; there is no need to make the sound long or loud.',
    steps: [
      'Take an ordinary, comfortable breath in.',
      'Let it out as a hum, a sigh, or simply a slow exhale.',
      'Notice any vibration in the chest, the throat, the face.',
      'Repeat once or twice if you like, then let the breath be ordinary.',
    ],
  },
  {
    slug: 'one-minute-of-weather',
    category: 'stillness',
    title: 'One Minute of Weather',
    duration: '1 min',
    seconds: 60,
    summary: 'Observe whatever is here, without trying to change it.',
    surface: 'orb',
    steps: [
      'Notice the weather as it is right now.',
      'A thought, a feeling, a sensation — each can simply be noticed.',
      'Nothing to improve for a moment.',
    ],
  },
  {
    slug: 'breath-at-its-own-pace',
    category: 'stillness',
    title: 'Breath at Its Own Pace',
    duration: '2 min',
    seconds: 120,
    summary: 'Notice breathing without pacing or changing it.',
    surface: 'none',
    note: 'If attending to the breath feels uncomfortable, rest attention on the feet or the sounds in the room instead.',
    steps: [
      'Notice that breathing is already happening.',
      'There is no right speed and no need to change it.',
      'If attention wanders, that is weather too. Notice, and return.',
    ],
  },
  {
    slug: 'quiet-orb',
    category: 'stillness',
    title: 'Quiet Orb',
    duration: '2–3 min',
    seconds: 150,
    summary: 'An optional slow visual rhythm to rest your eyes on.',
    surface: 'orb-paced',
    note: 'This is a visual pacing option, not a breathing instruction. Breathe however is comfortable. Adjust the pace or stop at any time.',
    steps: ['Let your eyes rest on the orb.', 'You can breathe with it, or not at all.', 'Nothing to improve for a moment.'],
  },
  {
    slug: 'one-quietly-good-thing',
    category: 'song',
    title: 'One Quietly Good Thing',
    duration: '1 min',
    seconds: 60,
    summary: 'Notice one small thing that is good, without needing it to be big.',
    surface: 'orb',
    steps: [
      'Is there one quietly good thing here, or from today?',
      'It can be very small: warmth, a sound, a taste, a person.',
      'Stay with it for a breath or two. If nothing comes, that is fine.',
    ],
  },
  {
    slug: 'look-for-vastness',
    category: 'song',
    title: 'Look for Vastness',
    duration: '1–2 min',
    seconds: 90,
    summary: 'Let the eyes find something large, far or open.',
    surface: 'none',
    note: 'If a sense of vastness feels unsettling, look at something close and ordinary instead.',
    steps: [
      'If you can see a window, a sky, or a long view, let your eyes rest there.',
      'Otherwise, remember a large open place you have been.',
      'Notice size, distance, openness.',
      'Then come back to something near and ordinary.',
    ],
  },
  {
    slug: 'carry-one-word',
    category: 'song',
    title: 'Carry One Word',
    duration: '1 min',
    seconds: 60,
    summary: 'Choose a single word for the rest of the day.',
    surface: 'none',
    steps: [
      'Is there a word that fits this moment? Ease, curious, warm, enough…',
      'You do not need to write it down.',
      'Let it come with you, or leave it here.',
    ],
  },
  {
    slug: 'back-to-the-room',
    category: 'grounding',
    title: 'Back to the Room',
    duration: '1 min',
    seconds: 60,
    summary: 'The Ground sequence, available on its own.',
    surface: 'none',
    steps: [
      'Look around the room. Let the screen become ordinary again.',
      'Notice three ordinary things you can see.',
      'Feel the surface beneath you — the chair, the floor, your feet.',
      'You can end here.',
    ],
  },
  {
    slug: 'five-senses-gently',
    category: 'grounding',
    title: 'Five Senses, Gently',
    duration: '2 min',
    seconds: 120,
    summary: 'A slow tour of the senses. Skip any that do not suit you.',
    surface: 'none',
    steps: [
      'Something you can see.',
      'Something you can hear, near or far.',
      'Something you can feel: fabric, air, the floor.',
      'Something you can smell, or simply the air itself.',
      'Something you can taste, or the ordinary feeling of your mouth.',
    ],
  },
];

export function getPractice(slug: string): Practice | undefined {
  return PRACTICES.find((p) => p.slug === slug);
}
