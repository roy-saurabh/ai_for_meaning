'use client';

import Link from 'next/link';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { useSettings } from '@/components/settings/useSettings';
import { resetFade } from '@/lib/storage/traces';
import { buildExport, buildReadableExport, downloadFile, eraseEverything } from '@/lib/storage/export';
import { setOnboarded, type Settings } from '@/lib/settings/settings';

function Group({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="membrane membrane-lg p-6 md:p-8" id={id}>
      <h2 id={`${id}-title`} className="text-[1.7rem]">
        {title}
      </h2>
      {description && <p className="mt-2 max-w-[62ch] text-[0.95rem] text-muted">{description}</p>}
      <div className="mt-6 divide-y divide-[var(--line)]">{children}</div>
    </section>
  );
}

function Row({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between md:gap-10">
      <div className="max-w-[48ch]">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="font-medium">
            {label}
          </label>
        ) : (
          <p className="font-medium">{label}</p>
        )}
        {hint && <p className="mt-1 text-[0.88rem] text-muted">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Segmented<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-full border border-[var(--line)] p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={`min-h-10 rounded-full px-4 font-mono text-[0.75rem] tracking-[0.04em] transition-colors ${value === o.value ? 'bg-ink text-night' : 'text-muted hover:text-ink'}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 items-center rounded-full border transition-colors ${checked ? 'border-gold bg-gold/80' : 'border-[var(--line-2)] bg-white/5'}`}
    >
      <span className={`inline-block h-6 w-6 rounded-full bg-ink shadow transition-transform ${checked ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  );
}

type MicPermission = 'granted' | 'denied' | 'prompt' | 'unknown';

export function SettingsPanel() {
  const [settings, update] = useSettings();
  const ids = useId();
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [mic, setMic] = useState<MicPermission>('unknown');

  useEffect(() => {
    let status: PermissionStatus | null = null;
    const read = () => setMic((status?.state as MicPermission | undefined) ?? 'unknown');
    navigator.permissions
      ?.query({ name: 'microphone' as PermissionName })
      .then((s) => {
        status = s;
        read();
        s.addEventListener('change', read);
      })
      .catch(() => setMic('unknown'));
    return () => status?.removeEventListener('change', read);
  }, []);

  const set = <K extends keyof Settings>(key: K) => (value: Settings[K]) => update({ [key]: value } as Partial<Settings>);

  const say = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice((m) => (m === message ? null : m)), 6000);
  };

  return (
    <div className="grid gap-6">
      <p role="status" aria-live="polite" className={`sticky top-[calc(var(--nav-h)+12px)] z-10 rounded-full border border-[var(--line-2)] bg-[rgba(9,9,26,0.92)] px-5 py-3 text-center text-[0.9rem] transition-opacity ${notice ? 'opacity-100' : 'pointer-events-none opacity-0'}`} data-testid="settings-notice">
        {notice ?? ''}
      </p>

      <Group id="experience" title="Experience">
        <Row label="Motion" hint="Minimal shows still images instead of animation. Your device’s reduced-motion setting is always respected.">
          <Segmented label="Motion" value={settings.motion} onChange={set('motion')} options={[{ value: 'full', label: 'Full' }, { value: 'gentle', label: 'Gentle' }, { value: 'minimal', label: 'Minimal' }]} />
        </Row>
        <Row label="Sound" hint="Soft generative ambience. Always starts silent until you turn it on in a session." htmlFor={`${ids}-sound`}>
          <Toggle id={`${ids}-sound`} checked={settings.sound} onChange={set('sound')} label="Sound" />
        </Row>
        <Row label="Default session length" hint="Roughly 3, 5½ or 10 minutes across Storm, Stillness and Song.">
          <Segmented label="Default session length" value={settings.sessionLength} onChange={set('sessionLength')} options={[{ value: 'short', label: 'Short' }, { value: 'standard', label: 'Standard' }, { value: 'long', label: 'Long' }]} />
        </Row>
        <Row label="Song invitations" hint="Whether sessions include the Song movement and its one question." htmlFor={`${ids}-song`}>
          <Toggle id={`${ids}-song`} checked={settings.songInvitations} onChange={set('songInvitations')} label="Song invitations" />
        </Row>
        <Row label="Guidance" hint="Quiet uses fewer words and lets the interface recede sooner.">
          <Segmented label="Guidance" value={settings.guidance} onChange={set('guidance')} options={[{ value: 'full', label: 'Full' }, { value: 'quiet', label: 'Quiet' }]} />
        </Row>
        <Row label="The Fade" hint="The Mirror becomes quieter as it becomes familiar, using a count of completed sessions kept in this browser. Reset to begin with full guidance again.">
          <button
            type="button"
            className="pill pill-sm"
            onClick={async () => {
              await resetFade();
              say('Guidance has been reset to full.');
            }}
          >
            Reset guidance
          </button>
        </Row>
        <Row label="Introduction" hint="See the four-screen introduction next time you enter the Mirror.">
          <button
            type="button"
            className="pill pill-sm"
            onClick={() => {
              setOnboarded(false);
              say('The introduction will show next time you enter the Mirror.');
            }}
          >
            Show introduction again
          </button>
        </Row>
      </Group>

      <Group id="privacy" title="Privacy" description="Everything below is stored only in this browser. There is no account and no server copy. Nothing is sent anywhere unless you choose to sit with the Gathering, which shares only an anonymous, temporary presence.">
        <Row label="Export your data" hint="Everything this site stored in this browser: kept traces, preferences, and the Fade count.">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="pill pill-sm"
              onClick={async () => {
                const data = await buildExport();
                downloadFile(`ai-for-meaning-export-${data.exportedAt.slice(0, 10)}.json`, JSON.stringify(data, null, 2), 'application/json');
                say('Exported as JSON.');
              }}
              data-testid="export-json"
            >
              Export JSON
            </button>
            <button
              type="button"
              className="pill pill-sm"
              onClick={async () => {
                const data = await buildExport();
                downloadFile(`ai-for-meaning-export-${data.exportedAt.slice(0, 10)}.txt`, buildReadableExport(data), 'text/plain;charset=utf-8');
                say('Exported as readable text.');
              }}
              data-testid="export-text"
            >
              Readable text
            </button>
          </div>
        </Row>
        <Row label="Delete everything" hint="Permanently erases your Inner Sky, preferences, the Fade count and cached pages from this browser. This cannot be undone.">
          {confirming ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="pill pill-sm pill-ground"
                onClick={async () => {
                  await eraseEverything();
                  setConfirming(false);
                  say('Everything has been deleted from this browser.');
                }}
                data-testid="confirm-delete"
              >
                Yes, delete everything
              </button>
              <button type="button" className="pill pill-sm pill-ghost" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" className="pill pill-sm pill-ground" onClick={() => setConfirming(true)} data-testid="delete-everything">
              Delete everything…
            </button>
          )}
        </Row>
        <Row label="Microphone permission" hint="Used only by the experimental Breath-trace, and only after you choose it. You can revoke it in your browser’s site settings at any time.">
          <span className="label-mono flex items-center gap-2 normal-case tracking-[0.04em]">
            <span className="status-dot" data-state={mic === 'granted' ? 'on' : mic === 'denied' ? 'warn' : undefined} aria-hidden="true" />
            {mic === 'granted' ? 'Allowed for this site' : mic === 'denied' ? 'Blocked for this site' : mic === 'prompt' ? 'Not granted (will ask)' : 'Not granted'}
          </span>
        </Row>
        <Row label="Camera and motion sensors" hint="Not used. Camera and sensors are blocked for this site by its Permissions-Policy.">
          <span className="label-mono normal-case tracking-[0.04em]">Never requested</span>
        </Row>
      </Group>

      <Group id="accessibility" title="Accessibility">
        <Row label="Reduced visual density" hint="Fewer particles and no grain texture." htmlFor={`${ids}-density`}>
          <Toggle id={`${ids}-density`} checked={settings.reducedDensity} onChange={set('reducedDensity')} label="Reduced visual density" />
        </Row>
        <Row label="High contrast" hint="Brighter secondary text and stronger outlines." htmlFor={`${ids}-contrast`}>
          <Toggle id={`${ids}-contrast`} checked={settings.highContrast} onChange={set('highContrast')} label="High contrast" />
        </Row>
        <Row label="Larger text" hint="Increases the base text size across the site. Browser zoom works too." htmlFor={`${ids}-text`}>
          <Toggle id={`${ids}-text`} checked={settings.largerText} onChange={set('largerText')} label="Larger text" />
        </Row>
        <Row label="Disable canvas motion" hint="The same as Motion: Minimal. Visuals become still images; every state is also described in text." htmlFor={`${ids}-canvas`}>
          <Toggle id={`${ids}-canvas`} checked={settings.motion === 'minimal'} onChange={(v) => update({ motion: v ? 'minimal' : 'full' })} label="Disable canvas motion" />
        </Row>
      </Group>

      <Group id="experimental" title="Experimental" description="Only genuinely working experiments appear here. Other Traces — pulse, motion, voice — are not yet available and are not offered.">
        <Row label="Breath-trace" hint="Lets the orb respond to the loudness of sound near your microphone, such as a sigh or hum. It does not measure breathing." htmlFor={`${ids}-breath`}>
          <Toggle id={`${ids}-breath`} checked={settings.experimentalBreathTrace} onChange={set('experimentalBreathTrace')} label="Offer Breath-trace in the Mirror" />
        </Row>
        <dl className="grid gap-4 py-5 text-[0.9rem] sm:grid-cols-3">
          <div>
            <dt className="label-mono text-faint">Status</dt>
            <dd className="mt-1 text-muted">{settings.experimentalBreathTrace ? 'Offered in the Mirror (off until you choose it)' : 'Not offered'}</dd>
          </div>
          <div>
            <dt className="label-mono text-faint">Data used</dt>
            <dd className="mt-1 text-muted">A moving loudness level, computed from a few milliseconds of audio at a time</dd>
          </div>
          <div>
            <dt className="label-mono text-faint">Where</dt>
            <dd className="mt-1 text-muted">Only in this browser. Never recorded, stored or sent</dd>
          </div>
        </dl>
        <p className="py-4 text-[0.88rem] text-muted">
          Revoke: turn this off, end the session, or remove microphone access in your browser’s site settings.{' '}
          <Link href="/honest-mirror" className="link-quiet">
            What the Mirror can and cannot do
          </Link>
        </p>
      </Group>
    </div>
  );
}
