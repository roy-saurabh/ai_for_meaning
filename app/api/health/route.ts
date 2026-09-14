import { getBuildInfo } from '@/lib/env/server';
import { json } from '@/lib/api/responses';

export const dynamic = 'force-dynamic';

/** Liveness and build identity. Deliberately reveals nothing about infrastructure or configuration. */
export function GET() {
  const { version, commit } = getBuildInfo();
  return json({ status: 'ok', version, commit });
}
