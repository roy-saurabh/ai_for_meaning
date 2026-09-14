import { THEME_SCRIPT } from '@/lib/settings/settings';

/**
 * Applies local accessibility preferences (motion, contrast, text size, density) before first paint,
 * so there is no flash of animated or low-contrast content. Carries the per-request CSP nonce.
 */
export function ThemeScript({ nonce }: { nonce: string | undefined }) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
