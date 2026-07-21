import type { VoiceEngine, VoiceLineRequest } from './VoiceEngine';
import { SpeechSynthesisEngine } from './SpeechSynthesisEngine';
import { audioRelPath } from './audioKey';

/**
 * Plays pre-generated voice clips (see scripts/generate-voice.ts) through the
 * Web Audio API. Clips are fetched and decoded into AudioBuffers so playback
 * starts instantly and can be cut off cleanly mid-clip (crucial for pause/skip).
 *
 * Per-clip resilience: if a file is missing or fails to decode, that single
 * line falls back to SpeechSynthesisEngine — a partial audio set still works.
 * Missing/failed paths are remembered so they aren't re-fetched.
 *
 * Filenames come from the shared audioRelPath() helper, so this engine and the
 * generation script always agree on where a clip lives.
 */
export class AudioFileEngine implements VoiceEngine {
  private ctx: AudioContext | null = null;
  private fallback = new SpeechSynthesisEngine();
  private muted = false;

  private buffers = new Map<string, AudioBuffer>();
  private inflight = new Map<string, Promise<AudioBuffer | null>>();
  private failed = new Set<string>();

  private source: AudioBufferSourceNode | null = null;
  private gain: GainNode | null = null;
  private generation = 0; // bumped on stop() to invalidate in-flight playback

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    if (!this.ctx) this.ctx = new Ctor();
    return this.ctx;
  }

  prime(): void {
    const ctx = this.getContext();
    if (ctx?.state === 'suspended') void ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.fallback.setMuted(muted);
    if (muted) this.stop();
  }

  private url(path: string): string {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    return `${base}/${path}`;
  }

  private async load(path: string): Promise<AudioBuffer | null> {
    if (this.buffers.has(path)) return this.buffers.get(path)!;
    if (this.failed.has(path)) return null;
    const existing = this.inflight.get(path);
    if (existing) return existing;

    const ctx = this.getContext();
    if (!ctx) return null;

    const promise = (async () => {
      try {
        const res = await fetch(this.url(path));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const bytes = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(bytes);
        this.buffers.set(path, buffer);
        return buffer;
      } catch {
        this.failed.add(path);
        return null;
      } finally {
        this.inflight.delete(path);
      }
    })();
    this.inflight.set(path, promise);
    return promise;
  }

  preload(requests: VoiceLineRequest[]): void {
    for (const req of requests) void this.load(audioRelPath(req));
  }

  speak(request: VoiceLineRequest, onDone?: () => void): void {
    if (this.muted) {
      onDone?.();
      return;
    }
    this.stop();
    const gen = this.generation;
    const path = audioRelPath(request);

    void this.load(path).then((buffer) => {
      if (gen !== this.generation) return; // superseded by a newer speak()/stop()
      const ctx = this.getContext();
      if (!buffer || !ctx) {
        this.fallback.speak(request, onDone); // per-clip fallback to speech synth
        return;
      }
      if (ctx.state === 'suspended') void ctx.resume();

      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = buffer;
      gain.gain.value = 1;
      source.connect(gain).connect(ctx.destination);
      source.onended = () => {
        if (gen !== this.generation) return;
        this.source = null;
        this.gain = null;
        onDone?.();
      };
      this.source = source;
      this.gain = gain;
      source.start();
    });
  }

  duck(): void {
    const ctx = this.getContext();
    if (this.gain && ctx) {
      const now = ctx.currentTime;
      this.gain.gain.cancelScheduledValues(now);
      this.gain.gain.setValueAtTime(this.gain.gain.value, now);
      this.gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      this.gain.gain.linearRampToValueAtTime(1, now + 0.6);
    }
    this.fallback.duck();
  }

  stop(): void {
    this.generation++;
    if (this.source) {
      try {
        this.source.onended = null;
        this.source.stop();
        this.source.disconnect();
      } catch {
        // already stopped
      }
      this.source = null;
      this.gain = null;
    }
    this.fallback.stop();
  }

  isSpeaking(): boolean {
    return this.source !== null || this.fallback.isSpeaking();
  }
}
