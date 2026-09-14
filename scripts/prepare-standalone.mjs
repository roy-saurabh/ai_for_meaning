/**
 * Completes Next.js standalone output: static assets and public/ are not copied by `next build`.
 * Used by the Dockerfile's equivalent COPY steps and by the E2E web server, so tests exercise the
 * same artifact that production runs.
 */
import { cp, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';

if (!existsSync('.next/standalone/server.js')) {
  console.error('No standalone build found. Run `pnpm build` first.');
  process.exit(1);
}
await rm('.next/standalone/.next/static', { recursive: true, force: true });
await cp('.next/static', '.next/standalone/.next/static', { recursive: true });
await rm('.next/standalone/public', { recursive: true, force: true });
await cp('public', '.next/standalone/public', { recursive: true });
console.log('Standalone output prepared.');
