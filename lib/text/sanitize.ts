/**
 * Text hygiene for short, person-written strings (weather words, closing words, reflections).
 * Rendering is always as React text nodes; this only removes invisible/control characters that could
 * confuse layout or reading order, and bounds length.
 */

/** C0/C1 controls, zero-width and bidirectional formatting characters, BOM. */
const INVISIBLE_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x0000, 0x001f],
  [0x007f, 0x009f],
  [0x200b, 0x200f],
  [0x202a, 0x202e],
  [0x2066, 0x2069],
  [0xfeff, 0xfeff],
];

function isInvisible(codePoint: number): boolean {
  return INVISIBLE_RANGES.some(([from, to]) => codePoint >= from && codePoint <= to);
}

export function stripControl(input: string): string {
  let out = '';
  for (const ch of input) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined && !isInvisible(cp)) out += ch;
  }
  return out;
}

/** Strip invisible characters, collapse whitespace, trim, and bound length. */
export function cleanShortText(input: string, max: number): string {
  return stripControl(input).replace(/\s+/g, ' ').trim().slice(0, max).trim();
}

const QUOTE_LIKE = new Set([0x22, 0x3c, 0x3e, 0xab, 0xbb, 0x201c, 0x201d, 0x201e]);

/** Remove quote marks and angle brackets so an echoed phrase can be safely re-quoted. */
export function stripQuotes(input: string): string {
  let out = '';
  for (const ch of input) {
    const cp = ch.codePointAt(0);
    if (cp !== undefined && !QUOTE_LIKE.has(cp)) out += ch;
  }
  return out;
}
