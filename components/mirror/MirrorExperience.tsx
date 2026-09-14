'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArcControls, Announcer, MirrorTopBar, PHASE_LABEL } from '@/components/mirror/MirrorChrome';
import { ArcView, guidanceLine } from '@/components/mirror/ArcView';
import { Onboarding } from '@/components/mirror/Onboarding';
import { ArrivalStep, CloseStep, ConsentStep, EndedStep, PausedView, ResumeOffer, WeatherStep } from '@/components/mirror/Steps';
import { useMirrorSession } from '@/components/mirror/useMirrorSession';
import { GroundView } from '@/components/safety/GroundView';
import { useSettings } from '@/components/settings/useSettings';
import { AmbientAudio, type AudioMood } from '@/lib/audio/ambient';
import { sceneFor } from '@/lib/generative/scenes';
import {
  DEFAULT_FADE,
  LIGHTER_AFTER,
  guidancePlan,
  recordCompletedSession,
  shouldOfferQuietEntry,
  type FadePreferences,
} from '@/lib/mirror/fade';
import { canGround, isTimedPhase, phaseProgress, visualPhase, type Phase, type TraceMode } from '@/lib/mirror/machine';
import type { HelpResource } from '@/lib/safety/help';
import { isOnboarded, setOnboarded } from '@/lib/settings/settings';
import { StorageUnavailableError, loadFade, newTraceId, saveFade, saveTrace, traceFromSession } from '@/lib/storage/traces';
import { BreathTrace, type TraceStatus } from '@/lib/traces/breath-trace';

const FieldCanvas = dynamic(() => import('@/components/generative/FieldCanvas').then((m) => m.FieldCanvas), {
  ssr: false,
  loading: () => <div className="orb-static is-breathing absolute left-1/2 top-[30%] h-28 w-28 -translate-x-1/2 -translate-y-1/2" />,
});

type Stage = 'loading' | 'resume-offer' | 'onboarding' | 'session';

const ARC_CENTER = { x: 0.5, y: 0.4 };
const PANEL_CENTER = { x: 0.5, y: 0.2 };
const GROUND_CENTER = { x: 0.5, y: 0.1 };

function audioMoodFor(phase: Phase): AudioMood | null {
  switch (phase) {
    case 'arrival':
      return 'arrival';
    case 'weather':
    case 'consent':
      return 'weather';
    case 'storm':
      return 'storm';
    case 'transition_to_stillness':
    case 'stillness':
      return 'stillness';
    case 'song':
      return 'song';
    case 'close':
    case 'ended':
      return 'close';
    default:
      return null;
  }
}

function announcementFor(phase: Phase): string {
  switch (phase) {
    case 'storm':
      return 'Storm. An invitation to move, if movement feels right. You can pause, skip or ground at any time.';
    case 'transition_to_stillness':
      return 'Settling toward Stillness.';
    case 'stillness':
      return 'Stillness. Nothing to improve for a moment. The interface will become quieter.';
    case 'song':
      return 'Song. An optional question about what feels alive.';
    case 'close':
      return 'Close. Nothing needed to happen.';
    case 'grounding':
      return 'Ground. Movement, sound and pacing have stopped.';
    case 'paused':
      return 'Paused. Nothing continues until you choose.';
    default:
      return '';
  }
}

export function MirrorExperience({ helpResource, cloudCompanion }: { helpResource: HelpResource; cloudCompanion: boolean }) {
  const [settings, updateSettings] = useSettings();
  const [fade, setFade] = useState<FadePreferences>(DEFAULT_FADE);
  const [stage, setStage] = useState<Stage>('loading');
  const [hold, setHold] = useState(false);
  const [highRisk, setHighRisk] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [traceStatus, setTraceStatus] = useState<TraceStatus>('inactive');
  const [interactedAt, setInteractedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [quietOfferDismissed, setQuietOfferDismissed] = useState(false);

  const config = useMemo(
    () => ({
      length: settings.sessionLength,
      guidance: settings.guidance,
      songEnabled: settings.songInvitations && !fade.hideSongPrompt,
    }),
    [settings.sessionLength, settings.guidance, settings.songInvitations, fade.hideSongPrompt],
  );

  const session = useMirrorSession(config, { hold });
  const { state, dispatch } = session;
  const plan = guidancePlan(fade, state.config.guidance);
  const phase = state.phase;
  const vPhase = visualPhase(state);

  const audioRef = useRef<AmbientAudio | null>(null);
  const traceRef = useRef<BreathTrace | null>(null);
  const endedHandledRef = useRef(false);

  /* ── Mount: decide onboarding / resume / quiet entry ─────────────────── */
  useEffect(() => {
    let cancelled = false;
    void loadFade().then((prefs) => {
      if (cancelled) return;
      setFade(prefs);
      const resumable = session.resumable();
      if (resumable) setStage('resume-offer');
      else if (!isOnboarded()) setStage('onboarding');
      else {
        setStage('session');
        if (prefs.quietEntry) dispatch({ type: 'BEGIN' });
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  /* ── Audio follows the visual phase; Ground silences immediately ────── */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !soundOn) return;
    if (phase === 'grounding') {
      audio.silence();
      return;
    }
    if (phase === 'paused') {
      audio.stop(1.5);
      return;
    }
    const mood = audioMoodFor(vPhase);
    if (mood) void audio.start(mood);
  }, [phase, vPhase, soundOn]);

  useEffect(
    () => () => {
      audioRef.current?.dispose();
      traceRef.current?.stop();
    },
    [],
  );

  const toggleSound = useCallback(async () => {
    if (!audioRef.current) audioRef.current = new AmbientAudio();
    const audio = audioRef.current;
    if (soundOn) {
      audio.stop();
      setSoundOn(false);
      updateSettings({ sound: false });
    } else {
      await audio.start(audioMoodFor(vPhase) ?? 'arrival');
      setSoundOn(true);
      updateSettings({ sound: true });
    }
  }, [soundOn, vPhase, updateSettings]);

  /* ── Trace lifecycle: stop on Ground, close and end ─────────────────── */
  const stopTrace = useCallback(() => {
    traceRef.current?.stop();
    setTraceStatus((s) => (s === 'active' || s === 'requesting' ? 'inactive' : s));
  }, []);

  // Leaving the arc always releases the microphone (external system only; status is derived below).
  useEffect(() => {
    if (phase === 'grounding' || phase === 'close' || phase === 'ended') traceRef.current?.stop();
  }, [phase]);

  /* ── Ground: always immediate ───────────────────────────────────────── */
  const ground = useCallback(
    (risk = false) => {
      audioRef.current?.silence();
      stopTrace();
      setHold(false);
      if (risk) setHighRisk(true);
      dispatch({ type: 'GROUND' });
    },
    [dispatch, stopTrace],
  );

  /* ── Start the arc (requests microphone only now, only if chosen) ──── */
  const startArc = useCallback(
    async (mode: TraceMode) => {
      let effective: TraceMode = 'none';
      if (mode === 'breath') {
        traceRef.current ??= new BreathTrace();
        setTraceStatus('requesting');
        const status = await traceRef.current.start();
        setTraceStatus(status);
        if (status !== 'active') return; // stay on consent and explain; nothing else happens
        effective = 'breath';
      }
      if (settings.sound && !soundOn) {
        audioRef.current ??= new AmbientAudio();
        await audioRef.current.start('storm');
        setSoundOn(true);
      }
      dispatch({ type: 'START_ARC', traceMode: effective, now: Date.now() });
    },
    [dispatch, settings.sound, soundOn],
  );

  /* ── Prompt accounting (a fact about the interface, for the trace) ─── */
  const line = guidanceLine(state, plan);
  const lineKey = line?.key ?? null;
  const lastLineRef = useRef<string | null>(null);
  useEffect(() => {
    if (lineKey && lineKey !== lastLineRef.current) {
      lastLineRef.current = lineKey;
      dispatch({ type: 'PROMPT_SHOWN' });
    }
  }, [lineKey, dispatch]);

  /* ── Interface recedes in Stillness after inactivity ────────────────── */
  useEffect(() => {
    const mark = () => setInteractedAt(performance.now());
    window.addEventListener('pointermove', mark, { passive: true });
    window.addEventListener('pointerdown', mark, { passive: true });
    window.addEventListener('keydown', mark);
    return () => {
      window.removeEventListener('pointermove', mark);
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', mark);
    };
  }, []);
  useEffect(() => {
    if (phase !== 'stillness') return;
    const id = window.setInterval(() => setNow(performance.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase]);
  const receded = phase === 'stillness' && state.elapsedInPhase > plan.chromeRecedesAfterMs && now - interactedAt > 5000;

  /** The Fade counts arcs that reached Close (whether or not a trace was kept). */
  const countCompleted = useCallback(() => {
    if (endedHandledRef.current || state.movementsVisited.length === 0) return;
    endedHandledRef.current = true;
    const next = recordCompletedSession(fade);
    setFade(next);
    void saveFade(next);
  }, [fade, state.movementsVisited.length]);

  /* ── Close / end handling ───────────────────────────────────────────── */
  const save = useCallback(
    async (word: string | null) => {
      setSaving(true);
      setStorageError(null);
      dispatch({ type: 'SET_CLOSING_WORD', word });
      const trace = traceFromSession({ ...state, closingWord: word, endedAt: state.endedAt ?? Date.now() }, newTraceId(), Date.now());
      try {
        if (trace) await saveTrace(trace);
        setSaved(true);
        countCompleted();
        dispatch({ type: 'SAVE', now: Date.now() });
      } catch (err) {
        const reason = err instanceof StorageUnavailableError ? err.reason : 'unknown';
        setStorageError(
          reason === 'quota'
            ? 'This browser has run out of storage space, so the trace could not be kept. You can finish without saving.'
            : 'This browser is not allowing local storage right now (private browsing can do this), so the trace could not be kept.',
        );
      } finally {
        setSaving(false);
      }
    },
    [dispatch, state, countCompleted],
  );


  const restart = useCallback(() => {
    endedHandledRef.current = false;
    setSaved(false);
    setHighRisk(false);
    setStorageError(null);
    lastLineRef.current = null;
    session.clearResume();
    dispatch({ type: 'RESTART', config });
  }, [dispatch, config, session]);

  /* ── Scene ───────────────────────────────────────────────────────────── */
  // Progress is quantised so the scene object changes at most a few times per second.
  const progressStep = Math.round(phaseProgress(state) * 20);
  const scene = useMemo(() => sceneFor(vPhase, state.weather, progressStep / 20), [vPhase, state.weather, progressStep]);
  const inArc = isTimedPhase(vPhase) && phase !== 'grounding';
  const panelPhase = stage !== 'session' || ['arrival', 'weather', 'consent', 'close', 'ended', 'grounding'].includes(phase);
  const fieldOpacity = stage !== 'session' ? 0.35 : phase === 'weather' || phase === 'close' || phase === 'ended' ? 0.55 : 1;
  const breathSource = useCallback(() => traceRef.current?.value() ?? null, []);

  const announcement = stage === 'session' ? announcementFor(phase) : '';

  let content: React.ReactNode = null;
  if (stage === 'loading') {
    content = <p className="sr-only">Loading the Mirror…</p>;
  } else if (stage === 'resume-offer') {
    content = (
      <ResumeOffer
        onResume={() => {
          const restored = session.resumable();
          if (restored) session.replaceState(restored);
          setStage('session');
        }}
        onFresh={() => {
          session.clearResume();
          setStage(isOnboarded() ? 'session' : 'onboarding');
        }}
      />
    );
  } else if (stage === 'onboarding') {
    content = (
      <Onboarding
        onComplete={() => {
          setOnboarded(true);
          setStage('session');
          dispatch({ type: 'BEGIN' });
        }}
      />
    );
  } else {
    switch (phase) {
      case 'arrival':
        content = <ArrivalStep onBegin={() => dispatch({ type: 'BEGIN' })} onReplayIntro={() => setStage('onboarding')} />;
        break;
      case 'weather':
        content = (
          <WeatherStep plan={plan} initial={state.weather} onSelect={(weather) => dispatch({ type: 'SELECT_WEATHER', weather })} onBack={() => dispatch({ type: 'BACK' })} />
        );
        break;
      case 'consent':
        content = state.weather && (
          <ConsentStep
            weather={state.weather}
            breathAvailable={settings.experimentalBreathTrace}
            traceStatus={traceStatus}
            onStart={startArc}
            onBack={() => dispatch({ type: 'BACK' })}
          />
        );
        break;
      case 'storm':
      case 'transition_to_stillness':
      case 'stillness':
      case 'song':
        content = (
          <ArcView
            state={state}
            plan={plan}
            cloudCompanion={cloudCompanion}
            onHoldChange={setHold}
            onHighRisk={() => ground(true)}
            onContinue={() => dispatch({ type: 'SKIP' })}
          />
        );
        break;
      case 'paused':
        content = <PausedView />;
        break;
      case 'close':
        content = (
          <CloseStep
            plan={plan}
            showFadeNote={fade.completedSessions >= LIGHTER_AFTER}
            saving={saving}
            storageError={storageError}
            onSave={save}
            onDiscard={() => {
              countCompleted();
              dispatch({ type: 'DISCARD', now: Date.now() });
            }}
          />
        );
        break;
      case 'grounding':
        content = <GroundView helpResource={helpResource} highRisk={highRisk} onEnd={() => dispatch({ type: 'END', now: Date.now() })} />;
        break;
      case 'ended':
        content = (
          <EndedStep
            saved={saved}
            fromGround={state.groundUsed && !saved}
            offerQuiet={!quietOfferDismissed && !highRisk && shouldOfferQuietEntry(fade)}
            onAcceptQuiet={() => {
              const next = { ...fade, quietEntry: true, quietEntryOffered: true };
              setFade(next);
              void saveFade(next);
              setQuietOfferDismissed(true);
            }}
            onDeclineQuiet={() => {
              const next = { ...fade, quietEntryOffered: true };
              setFade(next);
              void saveFade(next);
              setQuietOfferDismissed(true);
            }}
            onRestart={restart}
          />
        );
        break;
    }
  }

  const showControls = stage === 'session' && (isTimedPhase(phase) || phase === 'paused');

  return (
    <div className="fixed inset-0 flex h-dvh-safe flex-col overflow-hidden bg-transparent" data-phase={stage === 'session' ? phase : stage}>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <FieldCanvas
          scene={scene}
          className="h-full w-full"
          transitionSeconds={phase === 'grounding' ? 0.8 : vPhase === 'stillness' ? 5 : 2.6}
          running={phase !== 'paused'}
          breathSource={state.traceMode === 'breath' && traceStatus === 'active' && isTimedPhase(vPhase) ? breathSource : null}
          fieldOpacity={fieldOpacity}
          orbCenter={phase === 'grounding' ? GROUND_CENTER : panelPhase ? PANEL_CENTER : ARC_CENTER}
          fps={phase === 'grounding' ? 20 : vPhase === 'stillness' ? 40 : 60}
          sceneKey={`${vPhase}:${state.weather ? JSON.stringify(state.weather) : ''}:${progressStep}`}
        />
      </div>

      <MirrorTopBar
        phase={stage === 'onboarding' ? 'onboarding' : phase}
        receded={receded}
        canGround={stage === 'session' && canGround(phase)}
        onGround={() => ground(false)}
        sound={{ supported: true, on: soundOn, onToggle: () => void toggleSound(), hidden: phase === 'grounding' }}
        traceActive={traceStatus === 'active' && (isTimedPhase(vPhase) || phase === 'paused')}
      />

      <main
        id="main"
        className={`relative z-10 flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-5 pb-6 sm:px-8 ${
          stage !== 'session'
            ? 'justify-center pt-6'
            : inArc || phase === 'paused'
              ? 'justify-end'
              : phase === 'grounding'
                ? 'justify-start pt-[14vh]'
                : 'justify-start pt-[34vh] sm:pt-[36vh]'
        }`}
      >
        {stage === 'session' && (inArc || phase === 'paused') && (
          <p className={`label-mono mb-4 text-teal transition-opacity md:hidden ${receded ? 'opacity-0' : ''}`} aria-hidden="true">
            {PHASE_LABEL[phase]}
          </p>
        )}
        {content}
      </main>

      {showControls && (
        <ArcControls
          state={state}
          receded={receded}
          onPause={() => dispatch({ type: 'PAUSE' })}
          onResume={() => dispatch({ type: 'RESUME' })}
          onSkip={() => dispatch({ type: 'SKIP' })}
          onEnd={() => dispatch({ type: 'END', now: Date.now() })}
        />
      )}
      <Announcer message={announcement} />
    </div>
  );
}
