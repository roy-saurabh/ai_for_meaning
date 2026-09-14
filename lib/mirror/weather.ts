/**
 * Inner Weather — domain definitions.
 *
 * Weather is metaphor, never assessment. Nothing here classifies, scores or diagnoses. A custom word
 * the person writes is kept verbatim (trimmed, bounded) and only ever influences rendering through a
 * deterministic visual seed. It is never mapped to a psychological category.
 */

import { cleanShortText } from '@/lib/text/sanitize';

export const PRESET_WEATHER_IDS = ['tense', 'heavy', 'foggy', 'bright', 'numb', 'mixed'] as const;
export type PresetWeatherId = (typeof PRESET_WEATHER_IDS)[number];

export type WeatherChoice =
  | { kind: 'preset'; id: PresetWeatherId }
  | { kind: 'custom'; text: string };

export interface WeatherDescriptor {
  id: PresetWeatherId;
  label: string;
  /** A short, non-evaluative line about how the field will look. Describes the art, not the person. */
  visualNote: string;
}

export const WEATHER: Record<PresetWeatherId, WeatherDescriptor> = {
  tense: { id: 'tense', label: 'Tense', visualNote: 'close, quick orbits of rose and amber' },
  heavy: { id: 'heavy', label: 'Heavy', visualNote: 'slow, low drift of cobalt and slate' },
  foggy: { id: 'foggy', label: 'Foggy', visualNote: 'soft, diffuse light in mauve and grey' },
  bright: { id: 'bright', label: 'Bright', visualNote: 'a wide field of warm, sparse gold' },
  numb: { id: 'numb', label: 'Numb', visualNote: 'sparse, quiet points with open space between' },
  mixed: { id: 'mixed', label: 'Mixed', visualNote: 'two fields, moving through each other' },
};

export const CUSTOM_WEATHER_MAX_LENGTH = 40;

/**
 * Normalise a user-written weather word or phrase. Strips control characters and collapses
 * whitespace. Returns null when nothing meaningful remains. The text is only ever rendered as a
 * React text node — never as HTML.
 */
export function normaliseCustomWeather(input: string): string | null {
  const cleaned = cleanShortText(input, CUSTOM_WEATHER_MAX_LENGTH);
  return cleaned.length > 0 ? cleaned : null;
}

export function weatherLabel(choice: WeatherChoice | null): string {
  if (!choice) return 'unnamed';
  return choice.kind === 'preset' ? WEATHER[choice.id].label : choice.text;
}

export function isPresetWeatherId(value: unknown): value is PresetWeatherId {
  return typeof value === 'string' && (PRESET_WEATHER_IDS as readonly string[]).includes(value);
}
