/**
 * Minimal generative ambience (Web Audio API).
 *
 * Silent by default. The AudioContext is created only inside a user gesture, volume starts low and
 * fades in, and the context is suspended whenever sound is off. There are no "healing frequencies",
 * binaural beats or therapeutic claims: this is simply soft filtered noise and a few slowly breathing
 * harmonic tones, tuned to sound calm.
 */

export type AudioMood = 'arrival' | 'weather' | 'storm' | 'stillness' | 'song' | 'close';

interface MoodSpec {
  filterHz: number;
  noise: number;
  partials: [number, number, number, number];
  lfoRate: number;
}

const MOODS: Record<AudioMood, MoodSpec> = {
  arrival: { filterHz: 700, noise: 0.35, partials: [0.5, 0.25, 0.12, 0], lfoRate: 0.05 },
  weather: { filterHz: 800, noise: 0.4, partials: [0.5, 0.3, 0.15, 0.05], lfoRate: 0.06 },
  storm: { filterHz: 1400, noise: 0.6, partials: [0.45, 0.35, 0.2, 0.1], lfoRate: 0.12 },
  stillness: { filterHz: 480, noise: 0.25, partials: [0.55, 0.18, 0.08, 0], lfoRate: 0.035 },
  song: { filterHz: 950, noise: 0.28, partials: [0.45, 0.3, 0.22, 0.18], lfoRate: 0.05 },
  close: { filterHz: 600, noise: 0.22, partials: [0.4, 0.2, 0.1, 0.05], lfoRate: 0.04 },
};

// A2, E3, A3, C#4 — an open, consonant voicing.
const FREQUENCIES = [110, 164.81, 220, 277.18] as const;
const MASTER_LEVEL = 0.07;

export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private noiseGain: GainNode | null = null;
  private partialGains: GainNode[] = [];
  private lfo: OscillatorNode | null = null;
  private sources: AudioScheduledSourceNode[] = [];
  private mood: AudioMood = 'arrival';
  private stopTimer: ReturnType<typeof setTimeout> | null = null;

  get isSupported(): boolean {
    return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
  }

  get isPlaying(): boolean {
    return this.ctx?.state === 'running' && (this.master?.gain.value ?? 0) > 0.0001;
  }

  /** Must be called from a user gesture. */
  async start(mood: AudioMood = this.mood): Promise<void> {
    if (!this.isSupported) return;
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }
    if (!this.ctx) this.build();
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    if (ctx.state !== 'running') await ctx.resume();
    this.setMood(mood, 0.5);
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(MASTER_LEVEL, now + 2.5);
  }

  setMood(mood: AudioMood, seconds = 3): void {
    this.mood = mood;
    const ctx = this.ctx;
    if (!ctx || !this.filter || !this.noiseGain) return;
    const spec = MOODS[mood];
    const now = ctx.currentTime;
    this.filter.frequency.setTargetAtTime(spec.filterHz, now, seconds / 3);
    this.noiseGain.gain.setTargetAtTime(spec.noise * 0.5, now, seconds / 3);
    this.partialGains.forEach((g, i) => g.gain.setTargetAtTime((spec.partials[i] ?? 0) * 0.25, now, seconds / 3));
    this.lfo?.frequency.setTargetAtTime(spec.lfoRate, now, seconds / 3);
  }

  /** Fade out, then suspend the context so it uses no resources. */
  stop(fadeSeconds = 1.2): void {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const now = ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + fadeSeconds);
    if (this.stopTimer) clearTimeout(this.stopTimer);
    this.stopTimer = setTimeout(() => {
      void ctx.suspend().catch(() => undefined);
      this.stopTimer = null;
    }, fadeSeconds * 1000 + 100);
  }

  /** Immediate silence (Ground). */
  silence(): void {
    this.stop(0.25);
  }

  dispose(): void {
    if (this.stopTimer) clearTimeout(this.stopTimer);
    for (const s of this.sources) {
      try {
        s.stop();
      } catch {
        /* already stopped */
      }
    }
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.master = null;
    this.filter = null;
    this.noiseGain = null;
    this.partialGains = [];
    this.sources = [];
    this.lfo = null;
  }

  private build(): void {
    const Ctor: typeof AudioContext | undefined =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor({ latencyHint: 'playback' });
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Soft filtered noise bed (a short looped buffer of gently smoothed noise).
    const seconds = 3;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b = 0;
    for (let i = 0; i < data.length; i++) {
      b = 0.97 * b + 0.03 * (Math.random() * 2 - 1);
      data[i] = b * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    filter.Q.value = 0.4;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;
    noise.connect(filter).connect(noiseGain).connect(master);
    noise.start();

    // Slow amplitude "breathing" shared by the tones.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.35;
    lfo.connect(lfoDepth);
    lfo.start();

    const toneBus = ctx.createGain();
    toneBus.gain.value = 0.65;
    lfoDepth.connect(toneBus.gain);
    const toneFilter = ctx.createBiquadFilter();
    toneFilter.type = 'lowpass';
    toneFilter.frequency.value = 1200;
    toneBus.connect(toneFilter).connect(master);

    const partialGains = FREQUENCIES.map((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (i - 1.5) * 3;
      const g = ctx.createGain();
      g.gain.value = 0;
      osc.connect(g).connect(toneBus);
      osc.start();
      this.sources.push(osc);
      return g;
    });

    this.sources.push(noise, lfo);
    this.ctx = ctx;
    this.master = master;
    this.filter = filter;
    this.noiseGain = noiseGain;
    this.partialGains = partialGains;
    this.lfo = lfo;
  }
}
