import { useEffect, useRef } from 'react';
import type { Routine } from '../types';
import type { VoiceCoach } from '../lib/voice/VoiceCoach';
import { useSession } from '../lib/session/useSession';
import { useWakeLock } from '../lib/useWakeLock';
import { useMeshPalette } from '../lib/useMeshPalette';
import { meshForBlock } from '../theme';
import { CountdownRing } from '../components/CountdownRing';
import { SessionProgress } from '../components/SessionProgress';
import { Controls } from '../components/Controls';
import { SunriseSweep } from '../components/SunriseSweep';
import { ExerciseFigure } from '../components/figures/ExerciseFigure';

interface Props {
  routine: Routine;
  coach: VoiceCoach;
  voiceOff?: boolean;
  onComplete: () => void;
  onExit: () => void;
}

export function SessionScreen({ routine, coach, voiceOff = false, onComplete, onExit }: Props) {
  const s = useSession(routine, coach, voiceOff);
  const startedRef = useRef(false);

  // Auto-start on mount (the tap that navigated here is the user gesture).
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      s.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (s.status === 'complete') onComplete();
  }, [s.status, onComplete]);

  const wakeLock = useWakeLock(s.status === 'running' || s.status === 'paused');

  // Keyboard: space pause, arrows skip, m mute, escape exit.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          s.togglePause();
          break;
        case 'ArrowRight':
          s.skipNext();
          break;
        case 'ArrowLeft':
          s.skipPrev();
          break;
        case 'm':
          s.setMuted(!s.muted);
          break;
        case 'Escape':
          s.exit();
          onExit();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [s, onExit]);

  const paused = s.status === 'paused';

  // The gradient mesh follows the block (pre-dawn → morning) and calms when paused.
  useMeshPalette(meshForBlock(s.blockIndex), paused ? 'paused' : 'session');

  return (
    <div className="accent-scope mx-auto flex min-h-dvh w-full max-w-[600px] flex-col px-[18px] pb-[max(1.125rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <SunriseSweep />

      <SessionProgress
        routine={routine}
        progress={s.sessionProgress}
        elapsedSec={s.elapsed}
        blockIndex={s.blockIndex}
        blockName={s.blockName}
        segmentIndex={s.segmentIndex}
        totalSegments={s.totalSegments}
      />

      {/* One centred column: timer, then the exercise, then what's next. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <div className="flex flex-col items-center">
          <CountdownRing
            progress={s.segmentProgress}
            remaining={s.segmentRemaining}
            segmentKey={s.segmentIndex}
            paused={paused}
            onTap={s.togglePause}
          />

          <div className="mt-5 max-w-[24ch] text-center">
            <h1 className="font-body text-[clamp(22px,6vw,30px)] font-semibold leading-tight tracking-tight text-cream">
              {s.segment.name}
            </h1>
            <p className="mt-2.5 font-body text-[clamp(15px,4vw,18px)] leading-snug text-mist">{s.segment.cue}</p>
          </div>
        </div>

        <div className="flex w-[min(52vw,220px)] flex-col items-center gap-2">
          <div className="aspect-square max-h-[22vh] w-full">
            <ExerciseFigure name={s.segment.id} label={s.segment.name} />
          </div>
          <p className="flex items-center gap-2.5 opacity-85">
            <span className="quiet-label">Next</span>
            <span className="font-body text-[15px] text-cream/80">
              {s.nextSegment ? s.nextSegment.name : 'Finish'}
            </span>
          </p>
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center gap-2">
        <Controls
          paused={paused}
          muted={s.muted}
          onTogglePause={s.togglePause}
          onSkipPrev={s.skipPrev}
          onSkipNext={s.skipNext}
          onToggleMute={() => s.setMuted(!s.muted)}
          onExit={() => {
            s.exit();
            onExit();
          }}
        />
        {wakeLock === 'unsupported' && (
          <p className="text-center text-[11px] text-mist/70">
            Screen may sleep — this browser doesn't support wake lock. Keep the screen on in settings.
          </p>
        )}
      </div>
    </div>
  );
}
