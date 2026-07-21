/**
 * Abstraction over "how a coaching line gets spoken", so segments can later
 * be re-keyed to pre-generated TTS files without touching component code.
 */
export interface VoiceLineRequest {
  /** Routine the line belongs to. Namespaces the audio file so the same segment id can differ per routine. */
  routineId: string;
  /** Segment id the line belongs to, e.g. "glute-bridge". For block/session events this is the block/routine id. */
  segmentId: string;
  /** Which event within the segment this line is for. Used as the audio-file key. */
  event: 'start' | 'mid' | 'tMinus5' | 'switchSides' | 'blockIntro' | 'sessionStart' | 'sessionEnd';
  /** The line to speak (used verbatim by SpeechSynthesisEngine, and as a fallback by AudioFileEngine). */
  text: string;
}

export interface VoiceEngine {
  /**
   * Speak a line, cutting off any line currently speaking.
   * `onDone` fires when the line finishes naturally — NOT when it is cut off
   * by a later speak()/stop(). This is what lets VoiceCoach chain a queue.
   */
  speak(request: VoiceLineRequest, onDone?: () => void): void;
  /** Duck (lower volume of) any speech in progress. Best-effort; may be a no-op. */
  duck(): void;
  /** Stop speaking immediately. Must be safe to call at any time, including mid-utterance. */
  stop(): void;
  /** Whether this engine is currently producing audio. */
  isSpeaking(): boolean;
  /** Mute/unmute. Muting stops any current speech. */
  setMuted(muted: boolean): void;
  /** Optionally warm caches for upcoming lines (e.g. fetch+decode next segment's clips). */
  preload?(requests: VoiceLineRequest[]): void;
  /** Optionally resume the audio context from a user gesture. */
  prime?(): void;
}
