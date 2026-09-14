import { error, json, readJson } from '@/lib/api/responses';
import { CloudReflectionProvider } from '@/lib/companion/cloud';
import { companionInputSchema } from '@/lib/companion/types';
import { getCompanionConfig } from '@/lib/env/server';
import { clientKey, limiter } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * The cloud Witness-Companion. Exists only when a provider is configured server-side; otherwise 404,
 * and the browser uses the local provider. Request bodies are validated and never logged.
 */
export async function POST(request: Request) {
  const config = getCompanionConfig();
  if (config.provider === 'local') return error(404, 'Not found');

  const rl = limiter('companion', 12, 60_000).check(clientKey(request.headers), Date.now());
  if (!rl.ok) return error(429, 'Too many requests', { 'Retry-After': String(rl.retryAfterSeconds) });

  const parsed = companionInputSchema.safeParse(await readJson(request, 2_048));
  if (!parsed.success) return error(400, 'Invalid request');

  const output = await new CloudReflectionProvider(config).reflect(parsed.data);
  return json(output);
}
