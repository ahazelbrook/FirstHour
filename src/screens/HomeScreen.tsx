import { motion, useReducedMotion } from 'framer-motion';
import { routines } from '../data/routines';
import type { Routine } from '../types';
import { getStreak, hasCompletedToday } from '../lib/storage';

interface Props {
  onStart: (routine: Routine) => void;
  onInfo: () => void;
}

function todayLine(): string {
  return new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

export function HomeScreen({ onStart, onInfo }: Props) {
  const reducedMotion = useReducedMotion();
  const streak = getStreak();
  const doneToday = hasCompletedToday();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]">
      <header>
        <p className="quiet-label">{todayLine()}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-cream">First Hour</h1>
        <p className="mt-2 font-body text-sm text-mist">
          {streak > 0 ? (
            <>
              <span className="accent-fade font-semibold" style={{ color: 'var(--accent)' }}>
                {streak} day{streak === 1 ? '' : 's'}
              </span>{' '}
              {doneToday ? '— done today.' : 'running. Keep it alive.'}
            </>
          ) : (
            'Day one starts on the floor.'
          )}
        </p>
      </header>

      <main className="mt-10 flex flex-1 flex-col justify-start gap-4">
        {routines.map((routine, i) => (
          <motion.button
            key={routine.id}
            type="button"
            onClick={() => onStart(routine)}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            className="rounded-2xl border border-night-2 bg-night-1 p-6 text-left"
            style={{ boxShadow: i === 0 ? '0 0 32px -14px var(--accent-glow)' : undefined }}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-body text-xl font-semibold text-cream">{routine.title}</span>
              <span className="timer-numerals accent-fade text-2xl" style={{ color: 'var(--accent)' }}>
                {routine.totalSec / 60}
                <span className="text-sm text-mist"> min</span>
              </span>
            </div>
            <p className="mt-1.5 font-body text-sm leading-snug text-mist">{routine.subtitle}</p>
          </motion.button>
        ))}
      </main>

      <footer className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onInfo}
          className="border-none bg-transparent font-body text-xs text-mist underline decoration-night-2 underline-offset-4"
        >
          Why no stretching? The rules of this hour
        </button>
      </footer>
    </div>
  );
}
