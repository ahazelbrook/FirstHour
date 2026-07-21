import { motion, useReducedMotion } from 'framer-motion';
import type { Routine } from '../types';
import { useMeshPalette } from '../lib/useMeshPalette';

interface Props {
  routine: Routine;
  streak: number;
  onDone: () => void;
}

const DRY_LINES = [
  'Same time tomorrow.',
  'That was the hard part of the day.',
  'Nobody saw it. It still counts.',
  'Streak intact. Coffee earned.',
  'The bar was low. You cleared it anyway.',
  'Warm, upright, and it isn’t even light out.',
];

function dayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86_400_000);
}

export function CompletionScreen({ routine, streak, onDone }: Props) {
  useMeshPalette('gold', 'home');
  const reducedMotion = useReducedMotion();
  const line = DRY_LINES[dayOfYear() % DRY_LINES.length];
  const minutes = routine.totalSec / 60;

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center overflow-hidden px-6 text-center">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative flex flex-col items-center"
      >
        <div
          className="accent-fade grid h-20 w-20 place-items-center rounded-full border-[1.5px]"
          style={{
            borderColor: 'var(--accent)',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 0 44px var(--accent-glow)',
          }}
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <p className="serif-display mt-6 text-[clamp(48px,14vw,66px)] text-cream">Done.</p>
        <p className="mt-4 max-w-[28ch] font-body text-[17px] leading-relaxed text-cream/85">{line}</p>

        <div className="mt-8 flex items-stretch gap-8">
          <div>
            <p className="timer-numerals text-3xl text-cream">{minutes}:00</p>
            <p className="quiet-label mt-1.5">Moved</p>
          </div>
          <div className="w-px bg-white/15" />
          <div>
            <p className="timer-numerals accent-fade text-3xl" style={{ color: 'var(--accent)' }}>
              {streak}
            </p>
            <p className="quiet-label mt-1.5">Day{streak === 1 ? '' : 's'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDone}
          className="accent-fade mt-12 rounded-full border-[1.5px] px-12 py-3.5 font-body text-base font-semibold"
          style={{
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          Done
        </button>
      </motion.div>
    </div>
  );
}
