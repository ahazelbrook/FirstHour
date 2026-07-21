import type { VoiceLineRequest } from './VoiceEngine';

/**
 * The single source of truth for voice-audio filenames, shared by the app
 * (AudioFileEngine) and the generation script (scripts/generate-voice.ts).
 * Because both call this, they can never disagree on where a clip lives.
 *
 * Layout — one directory per routine so the SAME segment id can hold DIFFERENT
 * lines in the two routines without colliding (e.g. `glute-bridge` start is
 * "Ten reps" in Daily 10 but "Twelve reps" in Extended 20):
 *
 *   audio/{routineId}/{segmentId}-start.mp3
 *   audio/{routineId}/{segmentId}-mid.mp3
 *   audio/{routineId}/{segmentId}-tminus5.mp3
 *   audio/{routineId}/{segmentId}-switch.mp3   (only custom side-switch lines)
 *   audio/{routineId}/switch.mp3               (shared "Switch sides." line)
 *   audio/{routineId}/block-{n}.mp3            (n = 1..4, block transition)
 *   audio/{routineId}/session-intro.mp3
 *   audio/{routineId}/session-outro.mp3
 */

const BLOCK_ORDER = ['raise', 'mobilise', 'activate', 'potentiate'] as const;
const STANDARD_SWITCH = 'switch sides.';

/** Path relative to the site root (no leading slash, no BASE_URL). */
export function audioRelPath(req: VoiceLineRequest): string {
  const dir = `audio/${req.routineId}`;
  switch (req.event) {
    case 'sessionStart':
      return `${dir}/session-intro.mp3`;
    case 'sessionEnd':
      return `${dir}/session-outro.mp3`;
    case 'blockIntro': {
      const n = BLOCK_ORDER.indexOf(req.segmentId as (typeof BLOCK_ORDER)[number]) + 1;
      return `${dir}/block-${n || req.segmentId}.mp3`;
    }
    case 'switchSides':
      return req.text.trim().toLowerCase() === STANDARD_SWITCH
        ? `${dir}/switch.mp3`
        : `${dir}/${req.segmentId}-switch.mp3`;
    case 'start':
      return `${dir}/${req.segmentId}-start.mp3`;
    case 'mid':
      return `${dir}/${req.segmentId}-mid.mp3`;
    case 'tMinus5':
      return `${dir}/${req.segmentId}-tminus5.mp3`;
    default:
      return `${dir}/${req.segmentId}-${req.event}.mp3`;
  }
}
