'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { GROUND, HIGH_RISK } from '@/content/mirror-copy';
import { EMERGENCY_LINE, NOT_A_CRISIS_SERVICE, type HelpResource } from '@/lib/safety/help';

/**
 * Ground — deterministic, reviewed, never generated.
 * Movement, sound and pacing have already been stopped by the time this renders.
 */
export function GroundView({
  helpResource,
  highRisk,
  onEnd,
}: {
  helpResource: HelpResource;
  highRisk: boolean;
  onEnd: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [stay, setStay] = useState(false);
  const [helpOpen, setHelpOpen] = useState(highRisk);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section aria-labelledby="ground-title" className="mx-auto flex w-full max-w-[560px] flex-col" data-testid="ground-view">
      <p className="eyebrow" style={{ '--eyebrow-color': '#E8935B' } as React.CSSProperties}>
        {GROUND.eyebrow}
      </p>
      {highRisk ? (
        <>
          <h1 id="ground-title" ref={headingRef} tabIndex={-1} className="display-md mt-4 outline-none">
            {HIGH_RISK.title}
          </h1>
          <div className="mt-5 space-y-3 text-[1.02rem] leading-relaxed text-muted" data-testid="high-risk">
            {HIGH_RISK.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </>
      ) : (
        <>
          <h1 id="ground-title" ref={headingRef} tabIndex={-1} className="display-md mt-4 outline-none">
            {GROUND.title}
          </h1>
          <ol className="mt-6 space-y-4">
            {GROUND.steps.map((step, i) => (
              <li key={step} className="fade-in flex gap-4 text-[1.08rem] leading-relaxed text-ink/90" style={{ animationDelay: `${i * 900}ms` }}>
                <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8935B]/70" />
                {step}
              </li>
            ))}
          </ol>
        </>
      )}

      {(helpOpen || highRisk) && (
        <div className="membrane membrane-sm mt-8 p-5" style={{ '--membrane-glow': 'rgba(232,147,91,0.10)' } as React.CSSProperties} data-testid="help-panel">
          <h2 className="text-[1.2rem]">Human help</h2>
          <p className="mt-2 text-[0.95rem] text-ink/90">{EMERGENCY_LINE}</p>
          <p className="mt-3 text-[0.95rem] text-muted">
            <a href={helpResource.url} className="link-quiet" target="_blank" rel="noopener noreferrer">
              {helpResource.label}
            </a>{' '}
            — {helpResource.description}
          </p>
          <p className="mt-3 text-[0.88rem] text-faint">{NOT_A_CRISIS_SERVICE} You can also reach out to someone you trust.</p>
        </div>
      )}

      {stay ? (
        <div className="mt-10 flex flex-col items-start gap-3">
          <p className="text-[0.95rem] text-muted">Stay as long as you like. Whenever you are ready:</p>
          <button type="button" className="pill pill-sm" onClick={onEnd} data-testid="ground-end">
            End session
          </button>
        </div>
      ) : (
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          <button type="button" className="pill pill-primary" onClick={onEnd} data-testid="ground-end">
            End session
          </button>
          <button type="button" className="pill" onClick={() => setStay(true)} data-testid="ground-stay">
            Stay here
          </button>
          {!highRisk && (
            <button type="button" className="pill pill-ground" aria-expanded={helpOpen} onClick={() => setHelpOpen((v) => !v)} data-testid="ground-help">
              Human help
            </button>
          )}
        </div>
      )}
      <p className="mt-8 text-[0.85rem] text-faint">
        <Link href="/ground" className="link-quiet">
          More about the Ground and finding support
        </Link>
      </p>
    </section>
  );
}
