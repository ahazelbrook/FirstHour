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
    <div className="accent-scope flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <SunriseSweep />

      <SessionProgress
        routine={routine}
        progress={s.sessionProgress}
        elapsedSec={s.elapsed}
        remainingSec={s.sessionRemaining}
      />

      <div className="flex flex-1 flex-col items-center justify-evenly gap-2 min-[820px]:flex-row min-[820px]:justify-center min-[820px]:gap-8 lg:gap-14">
        {/* Timer column */}
        <div className="flex w-full flex-col items-center gap-3 min-[820px]:w-auto min-[820px]:max-w-[420px]">
          <div className="text-center">
            <p className="quiet-label accent-fade" style={{ color: 'var(--accent)' }}>
              Block {s.blockIndex + 1} · {s.blockName}
            </p>
            <h1 className="mt-1 font-body text-2xl font-semibold tracking-tight text-cream">
              {s.segment.name}
              <span className="ml-2 align-middle text-sm font-normal text-mist">{s.segment.prescription}</span>
            </h1>
          </div>

          <CountdownRing
            progress={s.segmentProgress}
            remaining={s.segmentRemaining}
            segmentKey={s.segmentIndex}
            paused={paused}
            onTap={s.togglePause}
          />

          <p className="max-w-[36ch] text-center font-body text-lg leading-snug text-cream/85">{s.segment.cue}</p>
        </div>

        {/* Figure + up-next column */}
        <div className="flex w-full max-w-[360px] flex-col items-center gap-4 min-[820px]:w-[300px] lg:w-[360px]">
          <div className="h-[120px] w-full sm:h-[150px] min-[820px]:h-[190px] lg:h-[220px]">
            <ExerciseFigure name={s.segment.id} label={s.segment.name} />
          </div>
          <p className="quiet-label">
            {s.nextSegment ? `Up next — ${s.nextSegment.name}` : 'Final segment'}
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
