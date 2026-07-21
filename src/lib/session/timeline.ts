import type { Routine, Segment } from '../../types';
import type { VoiceLineRequest } from '../voice/VoiceEngine';

export type TimelineEventKind =
  | 'segment-start'
  | 'mid-cue'
  | 'switch-sides'
  | 't-minus-5'
  | 'tick'
  | 'session-end';

export interface TimelineEvent {
  atSec: number;
  kind: TimelineEventKind;
  segmentIndex: number;
  voice: VoiceLineRequest[];
}

export interface FlatSegment extends Segment {
  segmentIndex: number;
  blockIndex: number;
  blockName: string;
}

export function flattenSegments(routine: Routine): FlatSegment[] {
  const flat: FlatSegment[] = [];
  routine.blocks.forEach((block, blockIndex) => {
    block.segments.forEach((segment) => {
      flat.push({
        ...segment,
        segmentIndex: flat.length,
        blockIndex,
        blockName: block.name,
      });
    });
  });
  return flat;
}

export function segmentIndexAt(flat: FlatSegment[], elapsedSec: number): number {
  if (elapsedSec <= 0) return 0;
  for (let i = flat.length - 1; i >= 0; i--) {
    if (flat[i].startSec <= elapsedSec) return i;
  }
  return 0;
}

/**
 * Build the full, sorted event schedule for a session from routine data.
 * Policies (see docs/PLAN.md):
 *  - The session intro REPLACES segment 1's start line and block 1's intro.
 *  - Block intros are queued before the segment start line at block boundaries.
 *  - Mid cue fires once at 40% of the segment.
 *  - Per-side segments get a chime + spoken switch line at their midpoint.
 *  - T-minus-5 voice at end-5s; ticks at end-3/-2/-1.
 *  - Session end fires the completion sound + closing line at totalSec.
 */
export function buildTimeline(routine: Routine): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const flat = flattenSegments(routine);
  const firstSegmentOfBlock = new Map<number, number>(); // segmentIndex -> blockIndex
  let cursor = 0;
  routine.blocks.forEach((block, blockIndex) => {
    firstSegmentOfBlock.set(cursor, blockIndex);
    cursor += block.segments.length;
  });

  for (const seg of flat) {
    const duration = seg.endSec - seg.startSec;
    const i = seg.segmentIndex;

    const rid = routine.id;
    const startVoice: VoiceLineRequest[] = [];
    if (i === 0) {
      startVoice.push({ routineId: rid, segmentId: routine.id, event: 'sessionStart', text: routine.voiceSessionStart });
    } else {
      const blockIndex = firstSegmentOfBlock.get(i);
      if (blockIndex !== undefined) {
        const block = routine.blocks[blockIndex];
        startVoice.push({ routineId: rid, segmentId: block.id, event: 'blockIntro', text: block.voiceIntro });
      }
      startVoice.push({ routineId: rid, segmentId: seg.id, event: 'start', text: seg.voice.start });
    }
    events.push({ atSec: seg.startSec, kind: 'segment-start', segmentIndex: i, voice: startVoice });

    events.push({
      atSec: seg.startSec + Math.round(duration * 0.4),
      kind: 'mid-cue',
      segmentIndex: i,
      voice: [{ routineId: rid, segmentId: seg.id, event: 'mid', text: seg.voice.mid }],
    });

    if (seg.perSide && seg.voice.switchSides) {
      events.push({
        atSec: seg.startSec + Math.round(duration / 2),
        kind: 'switch-sides',
        segmentIndex: i,
        voice: [{ routineId: rid, segmentId: seg.id, event: 'switchSides', text: seg.voice.switchSides }],
      });
    }

    events.push({
      atSec: seg.endSec - 5,
      kind: 't-minus-5',
      segmentIndex: i,
      voice: [{ routineId: rid, segmentId: seg.id, event: 'tMinus5', text: seg.voice.tMinus5 }],
    });

    for (const offset of [3, 2, 1]) {
      events.push({ atSec: seg.endSec - offset, kind: 'tick', segmentIndex: i, voice: [] });
    }
  }

  events.push({
    atSec: routine.totalSec,
    kind: 'session-end',
    segmentIndex: flat.length - 1,
    voice: [{ routineId: routine.id, segmentId: routine.id, event: 'sessionEnd', text: routine.voiceSessionEnd }],
  });

  events.sort((a, b) => a.atSec - b.atSec || a.segmentIndex - b.segmentIndex);
  return events;
}
