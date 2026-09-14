import { NextResponse } from 'next/server';

const NO_STORE = { 'Cache-Control': 'no-store' };

export function json(data: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  return NextResponse.json(data, { status: init.status ?? 200, headers: { ...NO_STORE, ...init.headers } });
}

export function error(status: number, message: string, headers: Record<string, string> = {}) {
  return json({ error: message }, { status, headers });
}

/** Reads a JSON body with a hard byte limit. Returns undefined for invalid or oversized bodies. */
export async function readJson(request: Request, maxBytes: number): Promise<unknown> {
  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > maxBytes) return undefined;
  const type = request.headers.get('content-type') ?? '';
  if (!type.includes('application/json')) return undefined;
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > maxBytes) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}
