import { describe, expect, it } from 'vitest';
import { buildTimeline, flattenSegments, segmentIndexAt } from './timeline';
import { dailyTen, extendedTwenty } from '../../data/routines';
import type { Routine } from '../../types';

function counts(routine: Routine) {
  const events = buildTimeline(routine);
  const byKind = new Map<string, number>();
  for (const e of events) byKind.set(e.kind, (byKind.get(e.kind) ?? 0) + 1);
  return { events, byKind };
}

describe.each([
  { routine: dailyTen, segments: 13, perSide: 5 },
  { routine: extendedTwenty, segments: 20, perSide: 11 },
])('timeline for $routine.id', ({ routine, segments, perSide }) => {
  const { events, byKind } = counts(routine);
  const flat = flattenSegments(routine);

  it('has the right event counts', () => {
    expect(byKind.get('segment-start')).toBe(segments);
    expect(byKind.get('mid-cue')).toBe(segments);
    expect(byKind.get('t-minus-5')).toBe(segments);
    expect(byKind.get('tick')).toBe(segments * 3);
    expect(byKind.get('switch-sides')).toBe(perSide);
    expect(byKind.get('session-end')).toBe(1);
  });

  it('is sorted and bounded by the session', () => {
    for (let i = 1; i < events.length; i++) {
      expect(events[i].atSec).toBeGreaterThanOrEqual(events[i - 1].atSec);
    }
    expect(events[0].atSec).toBe(0);
    expect(events[events.length - 1].atSec).toBe(routine.totalSec);
  });

  it('replaces segment 1 start line with the session intro', () => {
    const first = events[0];
    expect(first.kind).toBe('segment-start');
    expect(first.voice).toHaveLength(1);
    expect(first.voice[0].event).toBe('sessionStart');
    expect(first.voice[0].text).toBe(routine.voiceSessionStart);
  });

  it('queues block intros before the start line at block boundaries', () => {
    let cursor = 0;
    const boundaryIndexes: number[] = [];
    for (const block of routine.blocks) {
      if (cursor > 0) boundaryIndexes.push(cursor);
      cursor += block.segments.length;
    }
    expect(boundaryIndexes).toHaveLength(3);
    for (const idx of boundaryIndexes) {
      const start = events.find((e) => e.kind === 'segment-start' && e.segmentIndex === idx);
      expect(start?.voice).toHaveLength(2);
      expect(start?.voice[0].event).toBe('blockIntro');
      expect(start?.voice[1].event).toBe('start');
    }
    // non-boundary, non-first segments have exactly one start line
    const plain = events.find((e) => e.kind === 'segment-start' && e.segmentIndex === 1);
    expect(plain?.voice).toHaveLength(1);
    expect(plain?.voice[0].event).toBe('start');
  });

  it('switch-sides fires at the segment midpoint', () => {
    for (const e of events.filter((ev) => ev.kind === 'switch-sides')) {
      const seg = flat[e.segmentIndex];
      expect(e.atSec).toBe(seg.startSec + Math.round((seg.endSec - seg.startSec) / 2));
    }
  });

  it('segmentIndexAt maps elapsed time to the right segment', () => {
    for (const seg of flat) {
      expect(segmentIndexAt(flat, seg.startSec)).toBe(seg.segmentIndex);
      expect(segmentIndexAt(flat, seg.endSec - 0.5)).toBe(seg.segmentIndex);
    }
    expect(segmentIndexAt(flat, -1)).toBe(0);
    expect(segmentIndexAt(flat, routine.totalSec + 10)).toBe(flat.length - 1);
  });
});
