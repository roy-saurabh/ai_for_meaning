/**
 * Browser-side companion access. Uses the local provider unless the server reports a configured cloud
 * companion; any failure, slowness or offline state falls back to the local provider immediately.
 */

import { localReflect } from './local';
import { isCompanionInput, type CompanionInput, type CompanionOutput } from './types';

const CLIENT_TIMEOUT_MS = 9_000;

export async function requestReflection(input: CompanionInput, cloudEnabled: boolean): Promise<CompanionOutput> {
  const candidate: unknown = input;
  if (!isCompanionInput(candidate)) return localReflect({ stage: input.stage });
  const local = localReflect(input);
  // Safety and offline paths never need the network.
  if (!cloudEnabled || local.kind === 'ground' || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return local;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch('/api/companion', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!res.ok) return local;
    const data = (await res.json()) as Partial<CompanionOutput>;
    if (
      (data.kind === 'reflection' || data.kind === 'question' || data.kind === 'pointer' || data.kind === 'ground') &&
      typeof data.text === 'string'
    ) {
      return { kind: data.kind, text: data.text, source: data.source === 'cloud' ? 'cloud' : 'local' };
    }
    return local;
  } catch {
    return local;
  } finally {
    clearTimeout(timer);
  }
}
