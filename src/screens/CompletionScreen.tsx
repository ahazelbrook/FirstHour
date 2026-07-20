import { motion, useReducedMotion } from 'framer-motion';
import type { Routine } from '../types';

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
  const reducedMotion = useReducedMotion();
  const line = DRY_LINES[dayOfYear() % DRY_LINES.length];
  const minutes = routine.totalSec / 60;

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* risen-sun glow behind the numerals — the session has fully warmed up */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 h-[420px] -translate-y-[58%]"
        style={{
          background: 'radial-gradient(60% 50% at 50% 50%, rgba(255,217,126,0.16), transparent 70%)',
        }}
      />
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative flex flex-col items-center"
      >
        <p className="quiet-label">Session complete</p>
        <p
          className="timer-numerals mt-5 text-[104px] leading-none"
          style={{ color: 'var(--color-daylight)' }}
        >
          {minutes}:00
        </p>
        <p className="mt-2 font-body text-sm text-mist">
          {streak} day{streak === 1 ? '' : 's'} in a row
        </p>
        <p className="mt-9 max-w-[30ch] font-body text-lg leading-relaxed text-cream/85">{line}</p>
        <button
          type="button"
          onClick={onDone}
          className="mt-14 rounded-full border-none bg-night-1 px-12 py-4 font-body text-base font-semibold text-cream"
          style={{ boxShadow: '0 0 32px -10px rgba(255,217,126,0.4)' }}
        >
          Done
        </button>
      </motion.div>
    </div>
  );
}
