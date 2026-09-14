import 'server-only';

/**
 * Server-side configuration. Never import this from a Client Component: the `server-only` import
 * turns any such mistake into a build error, so provider secrets cannot reach the browser bundle.
 */

export type CompanionProviderName = 'local' | 'anthropic';

export interface CompanionConfig {
  provider: CompanionProviderName;
  apiKey: string | null;
  baseUrl: string | null;
  model: string;
}

export const DEFAULT_COMPANION_MODEL = 'claude-opus-5';

export function getCompanionConfig(env: Record<string, string | undefined> = process.env): CompanionConfig {
  const requested = (env.MIRROR_COMPANION_PROVIDER ?? 'local').trim().toLowerCase();
  const apiKey = env.MIRROR_COMPANION_API_KEY?.trim() || null;
  const baseUrl = env.MIRROR_COMPANION_BASE_URL?.trim() || null;
  const model = env.MIRROR_COMPANION_MODEL?.trim() || DEFAULT_COMPANION_MODEL;
  // The cloud adapter is only enabled when explicitly selected AND a key is present.
  const provider: CompanionProviderName = requested === 'anthropic' && apiKey ? 'anthropic' : 'local';
  return { provider, apiKey, baseUrl, model };
}

export function isCloudCompanionEnabled(): boolean {
  return getCompanionConfig().provider !== 'local';
}

export function getBuildInfo(): { version: string; commit: string } {
  return {
    version: process.env.APP_VERSION || '0.0.0',
    commit: (process.env.GIT_COMMIT || 'dev').slice(0, 12),
  };
}
