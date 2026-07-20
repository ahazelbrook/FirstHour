import type { VoiceEngine, VoiceLineRequest } from './VoiceEngine';

const PREFERRED_LANGS = ['en-AU', 'en-GB'];
const RATE = 0.95;

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  for (const lang of PREFERRED_LANGS) {
    const exact = voices.find((v) => v.lang === lang);
    if (exact) return exact;
  }
  for (const lang of PREFERRED_LANGS) {
    const prefixed = voices.find((v) => v.lang?.toLowerCase().startsWith(lang.toLowerCase()));
    if (prefixed) return prefixed;
  }
  return voices.find((v) => v.lang?.toLowerCase().startsWith('en'));
}

export class SpeechSynthesisEngine implements VoiceEngine {
  private synth: SpeechSynthesis | null;
  private voice: SpeechSynthesisVoice | undefined;
  private muted = false;
  private duckTimer: ReturnType<typeof setTimeout> | null = null;
  /** Identity of the utterance whose completion we still care about. */
  private active: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.loadVoice();
    if (this.synth) {
      this.synth.addEventListener('voiceschanged', () => this.loadVoice());
    }
  }

  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (voices.length) this.voice = pickVoice(voices);
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) this.stop();
  }

  isSupported() {
    return this.synth !== null;
  }

  speak(request: VoiceLineRequest, onDone?: () => void): void {
    if (!this.synth || this.muted || !request.text) {
      onDone?.();
      return;
    }
    // cancel() fires end/error on the old utterance — invalidate it first so
    // its onDone doesn't fire after it was cut off.
    this.active = null;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(request.text);
    utterance.rate = RATE;
    utterance.pitch = 1;
    utterance.volume = 1;
    if (this.voice) utterance.voice = this.voice;
    else utterance.lang = 'en-AU';

    const finish = () => {
      if (this.active !== utterance) return; // was cut off — swallow
      this.active = null;
      onDone?.();
    };
    utterance.addEventListener('end', finish);
    utterance.addEventListener('error', finish);

    this.active = utterance;
    this.synth.speak(utterance);
  }

  duck(): void {
    if (!this.synth || !this.synth.speaking) return;
    try {
      this.synth.pause();
      if (this.duckTimer) clearTimeout(this.duckTimer);
      this.duckTimer = setTimeout(() => {
        this.synth?.resume();
      }, 550);
    } catch {
      // pause/resume support is inconsistent across browsers; fail silent.
    }
  }

  stop(): void {
    if (this.duckTimer) {
      clearTimeout(this.duckTimer);
      this.duckTimer = null;
    }
    this.active = null;
    this.synth?.cancel();
  }

  isSpeaking(): boolean {
    return this.synth?.speaking ?? false;
  }
}
