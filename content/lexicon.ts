/**
 * The AI for Meaning lexicon — one source for the product's vocabulary. See docs/PRODUCT_LANGUAGE.md.
 */

export const COMMITMENTS = [
  {
    n: '01',
    title: 'Mirror, not Master',
    body: 'It reflects and asks. It never diagnoses, prescribes or claims authority over your inner life. You remain the only authority on your experience.',
  },
  {
    n: '02',
    title: 'Designed to fade',
    body: 'Prompts, explanations and guidance recede as the practice becomes familiar. A boat for crossing a river is meant to be left on the far bank.',
  },
  {
    n: '03',
    title: 'Body, then stillness, then song',
    body: 'Gentle movement before silence, and silence before aliveness. We do not begin with long silent sitting — the gentler path, and the safer one.',
  },
  {
    n: '04',
    title: 'Private by default',
    body: 'No account. Your session history stays in your browser. Microphone and camera are off unless you turn them on, and nothing is secretly recorded.',
  },
  {
    n: '05',
    title: 'An honest mirror',
    body: 'We say plainly what the research does and does not show, what this is not, and when a person — not an app — is what is needed.',
  },
] as const;

export const MOVEMENTS = [
  {
    id: 'storm',
    name: 'Storm',
    quality: 'Embodied release',
    body: 'Shake out the hands, let the shoulders move, stretch, scribble, hum or sigh. Let something move before trying to be still — or stay still, or skip it.',
    color: '#E8935B',
    glow: 'rgba(232,147,91,0.10)',
  },
  {
    id: 'stillness',
    name: 'Stillness',
    quality: 'Witnessing',
    body: 'Unhurried awareness of whatever is here. Nothing to improve for a moment. The guidance thins, and then the interface itself grows quiet.',
    color: '#6FD6C4',
    glow: 'rgba(111,214,196,0.10)',
  },
  {
    id: 'song',
    name: 'Song',
    quality: 'Aliveness',
    body: 'Curiosity, warmth, gratitude, awe — whatever feels quietly alive. No confetti, no scores. Sometimes a single word worth carrying.',
    color: '#9A8CFF',
    glow: 'rgba(154,140,255,0.11)',
  },
] as const;

export const TAXONOMY = [
  {
    term: 'Inner Weather',
    kicker: 'the field',
    body: 'Passing thoughts, feelings and sensations. Weather moves and changes. You are never reduced to the weather.',
  },
  {
    term: 'The Witness',
    kicker: 'the one noticing',
    body: 'A contemplative name for the noticing itself. In research language, the nearest constructs are present-moment awareness and decentering.',
  },
  {
    term: 'The Mirror',
    kicker: 'the system',
    body: 'The Resonance (responsive art and sound), the Witness-Companion (a few careful words), and the Fade (guidance that recedes).',
  },
  {
    term: 'Traces',
    kicker: 'optional inputs',
    body: 'Breath, pulse, motion, voice and word. Each needs your explicit consent, shows when it is active, and can be stopped at once. Most are not yet available.',
  },
  {
    term: 'Attunements',
    kicker: 'gentle lenses',
    body: 'Presence, Rootedness, Spaciousness, Aliveness and Meaning. Ways of looking — never scores, grades or measurements.',
  },
  {
    term: 'Depths',
    kicker: 'invitations, not levels',
    body: 'Arrival, Meeting the Weather, The Watcher, The Space Between, Song, and Open Sky — where the scaffolding has almost gone.',
  },
  {
    term: 'The Gathering',
    kicker: 'company without comparison',
    body: 'An anonymous sense of others sitting quietly at the same time. No profiles, no followers, no rankings, no history.',
  },
  {
    term: 'The Ground',
    kicker: 'safety',
    body: 'Always one tap away. Stops movement and sound, returns the room, and points to human help when that is what is needed.',
  },
] as const;

export const ATTUNEMENTS = [
  { id: 'presence', name: 'Presence', color: '#6FD6C4', body: 'Steadiness of attention; stepping back from thought.' },
  { id: 'rootedness', name: 'Rootedness', color: '#E8935B', body: 'Being in touch with the body.' },
  { id: 'spaciousness', name: 'Spaciousness', color: '#9A8CFF', body: 'Feeling part of something larger.' },
  { id: 'aliveness', name: 'Aliveness', color: '#F2C14E', body: 'Felt vitality and warmth.' },
  { id: 'meaning', name: 'Meaning', color: '#8FB7FF', body: 'A felt sense that life is coherent and matters.' },
] as const;

export const DEPTHS = [
  { name: 'Arrival', body: 'Learning to pause and name the weather.' },
  { name: 'Meeting the Weather', body: 'Feeling the body, the breath, the storm.' },
  { name: 'The Watcher', body: 'Short Stillness. Resting as the one noticing.' },
  { name: 'The Space Between', body: 'Longer Stillness, with less guidance.' },
  { name: 'Song', body: 'Awe, gratitude, meaning, creative aliveness.' },
  { name: 'Open Sky', body: 'Practice with almost no scaffolding. The Fade is nearly complete.' },
] as const;
