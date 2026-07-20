/**
 * Non-voice audio cues, synthesised on the fly with the Web Audio API.
 * No audio assets — everything here is oscillators + gain envelopes.
 */

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(
  audio: AudioContext,
  {
    freq,
    start,
    duration,
    peak = 0.18,
    type = 'sine',
  }: { freq: number; start: number; duration: number; peak?: number; type?: OscillatorType },
) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** Soft two-note chime — segment start. */
export function playChime() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  tone(audio, { freq: 523.25, start: t, duration: 0.55, peak: 0.15 }); // C5
  tone(audio, { freq: 659.25, start: t + 0.08, duration: 0.6, peak: 0.13 }); // E5
}

/** A single short tick, used three times for the 3-2-1 countdown. */
export function playTick() {
  const audio = getContext();
  if (!audio) return;
  tone(audio, { freq: 880, start: audio.currentTime, duration: 0.12, peak: 0.14, type: 'triangle' });
}

/** Warm, resolved chord — session complete. */
export function playCompletion() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  const chord = [392.0, 493.88, 587.33, 784.0]; // G4, B4, D5, G5
  chord.forEach((freq, i) => {
    tone(audio, { freq, start: t + i * 0.05, duration: 1.4, peak: 0.11 });
  });
}

/** Must be called from a user gesture (e.g. the start-session tap) to unlock audio on iOS/Safari. */
export function primeAudio() {
  getContext();
}
