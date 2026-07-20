import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Routine } from '../../types';
import type { VoiceCoach } from '../voice/VoiceCoach';
import { buildTimeline, flattenSegments, segmentIndexAt, type TimelineEvent } from './timeline';
import { playChime, playCompletion, playTick, primeAudio } from '../audio/cues';

export type SessionStatus = 'idle' | 'running' | 'paused' | 'complete';

const TICK_MS = 100;
/** If the clock jumps more than this (tab throttled/backgrounded), drop stale
 *  events and re-orient instead of firing a burst of queued speech. */
const CATCH_UP_THRESHOLD_SEC = 3;

export function useSession(routine: Routine, coach: VoiceCoach) {
  const flat = useMemo(() => flattenSegments(routine), [routine]);
  const timeline = useMemo(() => buildTimeline(routine), [routine]);

  const [status, setStatus] = useState<SessionStatus>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMutedState] = useState(false);

  const statusRef = useRef(status);
  statusRef.current = status;
  const accumRef = useRef(0); // elapsed seconds banked across pauses
  const startedAtRef = useRef<number | null>(null); // performance.now() at last (re)start
  const eventIndexRef = useRef(0);
  const lastElapsedRef = useRef(-0.001);
  const completedRef = useRef(false);

  const currentElapsed = useCallback(() => {
    const running = startedAtRef.current !== null ? (performance.now() - startedAtRef.current) / 1000 : 0;
    return accumRef.current + running;
  }, []);

  const fireEvent = useCallback(
    (event: TimelineEvent) => {
      switch (event.kind) {
        case 'segment-start':
          playChime();
          coach.say(event.voice);
          break;
        case 'switch-sides':
          playChime();
          coach.say(event.voice);
          break;
        case 'mid-cue':
        case 't-minus-5':
          coach.say(event.voice);
          break;
        case 'tick':
          playTick();
          break;
        case 'session-end':
          playCompletion();
          coach.say(event.voice);
          break;
      }
    },
    [coach],
  );

  const fireUpTo = useCallback(
    (now: number) => {
      let i = eventIndexRef.current;

      if (now - lastElapsedRef.current > CATCH_UP_THRESHOLD_SEC) {
        // Clock jumped — skip stale events, re-orient with the current segment only.
        while (i < timeline.length && timeline[i].atSec <= now) i++;
        eventIndexRef.current = i;
        lastElapsedRef.current = now;
        const segIndex = segmentIndexAt(flat, now);
        const seg = flat[segIndex];
        if (now < routine.totalSec && seg) {
          playChime();
          coach.say([{ segmentId: seg.id, event: 'start', text: seg.voice.start }]);
        }
        return;
      }

      while (i < timeline.length && timeline[i].atSec <= now) {
        fireEvent(timeline[i]);
        i++;
      }
      eventIndexRef.current = i;
      lastElapsedRef.current = now;
    },
    [timeline, flat, routine.totalSec, coach, fireEvent],
  );

  const complete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    startedAtRef.current = null;
    accumRef.current = routine.totalSec;
    setElapsed(routine.totalSec);
    setStatus('complete');
  }, [routine.totalSec]);

  useEffect(() => {
    if (status !== 'running') return;
    const interval = setInterval(() => {
      const now = Math.min(currentElapsed(), routine.totalSec);
      fireUpTo(now);
      setElapsed(now);
      if (now >= routine.totalSec) complete();
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [status, currentElapsed, fireUpTo, complete, routine.totalSec]);

  const start = useCallback(() => {
    primeAudio();
    completedRef.current = false;
    accumRef.current = 0;
    startedAtRef.current = performance.now();
    eventIndexRef.current = 0;
    lastElapsedRef.current = -0.001;
    setElapsed(0);
    setStatus('running');
  }, []);

  const togglePause = useCallback(() => {
    if (statusRef.current === 'running') {
      accumRef.current = currentElapsed();
      startedAtRef.current = null;
      coach.stop(); // speech must cancel cleanly on pause
      setStatus('paused');
    } else if (statusRef.current === 'paused') {
      startedAtRef.current = performance.now();
      // keep lastElapsed close so the catch-up guard doesn't trip on resume
      lastElapsedRef.current = accumRef.current - 0.001;
      setStatus('running');
    }
  }, [coach, currentElapsed]);

  const skipTo = useCallback(
    (segmentIndex: number) => {
      if (statusRef.current !== 'running' && statusRef.current !== 'paused') return;
      coach.stop();
      if (segmentIndex >= flat.length) {
        // Skipping forward past the last segment ends the session early.
        fireUpTo(routine.totalSec);
        complete();
        return;
      }
      const target = flat[Math.max(0, segmentIndex)].startSec;
      accumRef.current = target;
      if (statusRef.current === 'running') startedAtRef.current = performance.now();
      // Position the pointer so the landed segment's start event fires naturally.
      let i = 0;
      while (i < timeline.length && timeline[i].atSec < target) i++;
      eventIndexRef.current = i;
      lastElapsedRef.current = target - 0.001;
      setElapsed(target);
    },
    [coach, flat, timeline, routine.totalSec, fireUpTo, complete],
  );

  const segmentIndex = segmentIndexAt(flat, elapsed);
  const segment = flat[segmentIndex];
  const nextSegment = flat[segmentIndex + 1] ?? null;

  const skipNext = useCallback(() => skipTo(segmentIndexAt(flat, currentElapsed()) + 1), [skipTo, flat, currentElapsed]);
  const skipPrev = useCallback(() => skipTo(segmentIndexAt(flat, currentElapsed()) - 1), [skipTo, flat, currentElapsed]);

  const setMuted = useCallback(
    (m: boolean) => {
      coach.setMuted(m);
      setMutedState(m);
    },
    [coach],
  );

  const exit = useCallback(() => {
    coach.stop();
    startedAtRef.current = null;
    setStatus('idle');
  }, [coach]);

  const segmentDuration = segment.endSec - segment.startSec;
  const segmentElapsed = Math.min(Math.max(elapsed - segment.startSec, 0), segmentDuration);

  return {
    status,
    elapsed,
    muted,
    segment,
    segmentIndex,
    nextSegment,
    blockIndex: segment.blockIndex,
    blockName: segment.blockName,
    totalSegments: flat.length,
    segmentDuration,
    segmentElapsed,
    /** 0 → 1 through the current segment */
    segmentProgress: segmentDuration > 0 ? segmentElapsed / segmentDuration : 0,
    /** Whole seconds left in the current segment, for the big numerals */
    segmentRemaining: Math.max(0, Math.ceil(segment.endSec - elapsed)),
    /** 0 → 1 through the whole session */
    sessionProgress: Math.min(elapsed / routine.totalSec, 1),
    sessionRemaining: Math.max(0, Math.ceil(routine.totalSec - elapsed)),
    start,
    togglePause,
    skipNext,
    skipPrev,
    setMuted,
    exit,
  };
}

export type SessionState = ReturnType<typeof useSession>;
