import type { VoiceEngine, VoiceLineRequest } from './VoiceEngine';
import { SpeechSynthesisEngine } from './SpeechSynthesisEngine';

/**
 * Plays pre-generated audio files (e.g. ElevenLabs renders) instead of
 * speechSynthesis. Drop files at `public/audio/{segmentId}-{event}.mp3`
 * (see README) and this engine picks them up automatically.
 *
 * Falls back to SpeechSynthesisEngine per-line if a file is missing, so a
 * partially-recorded audio set still works. Missing files are remembered
 * for the rest of the session to avoid re-probing.
 */
export class AudioFileEngine implements VoiceEngine {
  private current: HTMLAudioElement | null = null;
  private fallback = new SpeechSynthesisEngine();
  private muted = false;
  private missing = new Set<string>();

  setMuted(muted: boolean) {
    this.muted = muted;
    this.fallback.setMuted(muted);
    if (muted) this.stop();
  }

  private urlFor(request: VoiceLineRequest) {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    return `${base}/audio/${request.segmentId}-${request.event}.mp3`;
  }

  speak(request: VoiceLineRequest, onDone?: () => void): void {
    if (this.muted) {
      onDone?.();
      return;
    }
    this.stop();

    const url = this.urlFor(request);
    if (this.missing.has(url)) {
      this.fallback.speak(request, onDone);
      return;
    }

    const audio = new Audio(url);
    this.current = audio;
    let settled = false;

    const fail = () => {
      if (settled) return;
      settled = true;
      this.missing.add(url);
      if (this.current === audio) this.current = null;
      this.fallback.speak(request, onDone);
    };
    audio.addEventListener('error', fail);
    audio.addEventListener('ended', () => {
      if (settled) return;
      settled = true;
      if (this.current === audio) {
        this.current = null;
        onDone?.();
      }
    });
    audio.play().catch(fail);
  }

  duck(): void {
    if (this.current) this.current.volume = 0.35;
    this.fallback.duck();
  }

  stop(): void {
    if (this.current) {
      this.current.pause();
      this.current.currentTime = 0;
      this.current = null;
    }
    this.fallback.stop();
  }

  isSpeaking(): boolean {
    return (this.current !== null && !this.current.paused) || this.fallback.isSpeaking();
  }
}
