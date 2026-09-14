'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import type { MotionLevel } from '@/lib/generative/field-renderer';
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  effectiveMotion,
  readSettings,
  writeSettings,
  type Settings,
} from '@/lib/settings/settings';

function subscribe(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === SETTINGS_KEY || e.key === null) callback();
  };
  const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  window.addEventListener('afm:settings', callback);
  window.addEventListener('afm:erased', callback);
  window.addEventListener('storage', onStorage);
  media?.addEventListener('change', callback);
  return () => {
    window.removeEventListener('afm:settings', callback);
    window.removeEventListener('afm:erased', callback);
    window.removeEventListener('storage', onStorage);
    media?.removeEventListener('change', callback);
  };
}

// Snapshot must be referentially stable between changes.
let cachedRaw: string | null | undefined;
let cachedSettings: Settings = DEFAULT_SETTINGS;
function getSnapshot(): Settings {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(SETTINGS_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedSettings = readSettings();
  }
  return cachedSettings;
}
const getServerSnapshot = () => DEFAULT_SETTINGS;

export function useSettings(): [Settings, (patch: Partial<Settings>) => void] {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const update = useCallback((patch: Partial<Settings>) => {
    writeSettings({ ...readSettings(), ...patch });
  }, []);
  return [settings, update];
}

/** The motion level renderers should use. 'minimal' on the server and before hydration. */
export function useMotion(): MotionLevel {
  const [settings] = useSettings();
  const [osTick, setOsTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client mount flag
    setMounted(true);
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const onChange = () => setOsTick((n) => n + 1);
    media?.addEventListener('change', onChange);
    return () => media?.removeEventListener('change', onChange);
  }, []);
  void osTick;
  return mounted ? effectiveMotion(settings) : 'minimal';
}
