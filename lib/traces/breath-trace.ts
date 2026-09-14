/**
 * Breath-trace (experimental) — sound-envelope responsiveness.
 *
 * Honest scope: this follows the loudness of sound near the microphone (a sigh, a hum, an audible
 * exhale) and turns it into a smooth 0..1 value that the orb can respond to. It does NOT measure
 * breathing rate, depth or anything physiological, and the UI must never say it does.
 *
 * Privacy: audio is analysed in memory, in this browser, a few samples at a time. There is no
 * MediaRecorder, nothing is stored, nothing is sent, and the microphone track is stopped on stop().
 */

export type TraceStatus = 'inactive' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'error';

export interface TraceAdapter {
  readonly id: 'breath' | 'pulse' | 'motion' | 'voice' | 'wearable';
  readonly availability: 'experimental' | 'not-yet-available';
  status(): TraceStatus;
  start(): Promise<TraceStatus>;
  stop(): void;
  /** Latest smoothed value in [0, 1], or null when inactive. */
  value(): number | null;
}

export class BreathTrace implements TraceAdapter {
  readonly id = 'breath' as const;
  readonly availability = 'experimental' as const;
  private currentStatus: TraceStatus = 'inactive';
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private envelope = 0;
  private floor = 0.01;
  private ceiling = 0.05;
  private samples: Float32Array<ArrayBuffer> | null = null;

  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof AudioContext !== 'undefined';
  }

  status(): TraceStatus {
    return this.currentStatus;
  }

  async start(): Promise<TraceStatus> {
    if (!BreathTrace.isSupported()) return (this.currentStatus = 'unavailable');
    if (this.currentStatus === 'active') return this.currentStatus;
    this.currentStatus = 'requesting';
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 },
        video: false,
      });
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      this.currentStatus = name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : name === 'NotFoundError' ? 'unavailable' : 'error';
      return this.currentStatus;
    }
    try {
      this.ctx = new AudioContext();
      const source = this.ctx.createMediaStreamSource(this.stream);
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 1024;
      source.connect(this.analyser); // never connected to the speakers
      this.samples = new Float32Array(new ArrayBuffer(this.analyser.fftSize * 4));
      this.timer = setInterval(() => this.sample(), 50);
      this.currentStatus = 'active';
    } catch {
      this.stop();
      this.currentStatus = 'error';
    }
    return this.currentStatus;
  }

  private sample(): void {
    if (!this.analyser || !this.samples) return;
    this.analyser.getFloatTimeDomainData(this.samples);
    let sum = 0;
    for (let i = 0; i < this.samples.length; i++) sum += this.samples[i]! * this.samples[i]!;
    const rms = Math.sqrt(sum / this.samples.length);
    // Adaptive range so quiet rooms and loud rooms both give a usable 0..1.
    this.floor = rms < this.floor ? rms : this.floor + (rms - this.floor) * 0.002;
    this.ceiling = rms > this.ceiling ? rms : this.ceiling + (Math.max(this.floor * 3, 0.02) - this.ceiling) * 0.004;
    const normalised = Math.max(0, Math.min(1, (rms - this.floor) / Math.max(0.005, this.ceiling - this.floor)));
    // Envelope follower: gentle attack, slow release.
    const k = normalised > this.envelope ? 0.18 : 0.04;
    this.envelope += (normalised - this.envelope) * k;
  }

  value(): number | null {
    return this.currentStatus === 'active' ? this.envelope : null;
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.analyser = null;
    this.samples = null;
    this.envelope = 0;
    if (this.currentStatus === 'active' || this.currentStatus === 'requesting') this.currentStatus = 'inactive';
  }
}

/** Traces that are architected but not implemented. Shown as "not yet available"; never faked. */
export const UNAVAILABLE_TRACES = [
  { id: 'pulse', name: 'Pulse-trace', source: 'camera or wearable' },
  { id: 'motion', name: 'Motion-trace', source: 'device motion sensors' },
  { id: 'voice', name: 'Voice-trace', source: 'microphone (tone only, never words)' },
] as const;
