export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://aiformeaning.com').replace(/\/+$/, '');
export const SITE_NAME = 'AI for Meaning';
export const SITE_TAGLINE = 'A mirror, not a master.';
export const SITE_DESCRIPTION =
  'A living mirror for noticing your inner weather — built to reflect rather than direct, and designed to become quieter. Self-awareness, private by default, not therapy.';

export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
