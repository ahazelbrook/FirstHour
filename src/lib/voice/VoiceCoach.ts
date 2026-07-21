import type { VoiceEngine, VoiceLineRequest } from './VoiceEngine';

const INTER_LINE_GAP_MS = 300;

/**
 * Sequential speech queue on top of a VoiceEngine.
 *
 * Engines cut off the current line whenever speak() is called, so multi-line
 * moments (block intro → segment start) must be chained on completion — that
 * is this class's whole job. A generation counter invalidates in-flight
 * chains whenever the queue is flushed, so pause/skip always cancels cleanly.
 */
export class VoiceCoach {
  private queue: VoiceLineRequest[] = [];
  private generation = 0;
  private playing = false;
  private gapTimer: ReturnType<typeof setTimeout> | null = null;

  private engine: VoiceEngine;

  constructor(engine: VoiceEngine) {
    this.engine = engine;
  }

  /** Speak lines in order. By default flushes whatever is queued or speaking. */
  say(requests: VoiceLineRequest[], opts: { interrupt?: boolean } = {}): void {
    const interrupt = opts.interrupt ?? true;
    if (interrupt) {
      this.flush();
      this.queue = [...requests];
      this.next();
    } else {
      this.queue.push(...requests);
      if (!this.playing) this.next();
    }
  }

  private next(): void {
    const request = this.queue.shift();
    if (!request) {
      this.playing = false;
      return;
    }
    this.playing = true;
    const gen = this.generation;
    this.engine.speak(request, () => {
      if (gen !== this.generation) return;
      this.gapTimer = setTimeout(() => {
        if (gen === this.generation) this.next();
      }, INTER_LINE_GAP_MS);
    });
  }

  private flush(): void {
    this.generation++;
    if (this.gapTimer) {
      clearTimeout(this.gapTimer);
      this.gapTimer = null;
    }
    this.queue = [];
    this.playing = false;
    this.engine.stop();
  }

  stop(): void {
    this.flush();
  }

  duck(): void {
    this.engine.duck();
  }

  preload(requests: VoiceLineRequest[]): void {
    this.engine.preload?.(requests);
  }

  prime(): void {
    this.engine.prime?.();
  }

  setMuted(muted: boolean): void {
    if (muted) this.flush();
    this.engine.setMuted(muted);
  }

  isSpeaking(): boolean {
    return this.engine.isSpeaking();
  }
}
