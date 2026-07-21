import { describe, expect, it } from 'vitest';
import { allSegments, dailyTen, extendedTwenty, routineA, routineB } from './routines';
import type { Routine } from '../types';

function checkRoutine(routine: Routine, expectedTotal: number) {
  describe(`${routine.title} (${routine.id})`, () => {
    it(`totals exactly ${expectedTotal} seconds`, () => {
      expect(routine.totalSec).toBe(expectedTotal);
    });

    it('segments are contiguous from 0 to totalSec with no gaps or overlaps', () => {
      const segments = allSegments(routine);
      expect(segments[0].startSec).toBe(0);
      for (let i = 0; i < segments.length; i++) {
        expect(segments[i].endSec).toBeGreaterThan(segments[i].startSec);
        if (i > 0) {
          expect(segments[i].startSec).toBe(segments[i - 1].endSec);
        }
      }
      expect(segments[segments.length - 1].endSec).toBe(routine.totalSec);
      expect(routine.totalSec).toBe(expectedTotal);
    });

    it('has 4 blocks', () => {
      expect(routine.blocks).toHaveLength(4);
    });

    it('every segment has non-empty voice lines', () => {
      for (const segment of allSegments(routine)) {
        expect(segment.voice.start.length).toBeGreaterThan(0);
        expect(segment.voice.mid.length).toBeGreaterThan(0);
        expect(segment.voice.tMinus5.length).toBeGreaterThan(0);
        if (segment.perSide) {
          expect(segment.voice.switchSides?.length).toBeGreaterThan(0);
        }
      }
    });

    it('every segment id is unique within the routine', () => {
      const ids = allSegments(routine).map((s) => `${s.id}-${s.startSec}`);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
}

checkRoutine(dailyTen, 600);
checkRoutine(extendedTwenty, 1200);
checkRoutine(routineA, 600);
checkRoutine(routineB, 600);
