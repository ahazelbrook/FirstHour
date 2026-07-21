import { motion, useReducedMotion } from 'framer-motion';
import { routines } from '../data/routines';
import type { Routine } from '../types';
import { getStreak, hasCompletedToday } from '../lib/storage';
import type { VoicePref } from '../lib/voice/useVoice';

interface Props {
  onStart: (routine: Routine) => void;
  onInfo: () => void;
  voicePref: VoicePref;
  onChangeVoicePref: (pref: VoicePref) => void;
  recordedAvailable: boolean;
}

function todayLine(): string {
  return new Intl.DateTimeFormat('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
}

const VOICE_OPTIONS: { value: VoicePref; label: string }[] = [
  { value: 'recorded', label: 'Recorded' },
  { value: 'device', label: 'Device' },
  { value: 'off', label: 'Off' },
];

function VoiceToggle({
  pref,
  onChange,
  recordedAvailable,
}: {
  pref: VoicePref;
  onChange: (p: VoicePref) => void;
  recordedAvailable: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="quiet-label">Voice</span>
      <div className="flex overflow-hidden rounded-full border border-night-2 bg-night-1">
        {VOICE_OPTIONS.map((opt) => {
          const active = pref === opt.value;
          const disabled = opt.value === 'recorded' && !recordedAvailable;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className="accent-fade px-4 py-1.5 font-body text-xs font-medium disabled:opacity-35"
              style={{
                color: active ? 'var(--color-night-0)' : 'var(--color-mist)',
                backgroundColor: active ? 'var(--accent)' : 'transparent',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function HomeScreen({ onStart, onInfo, voicePref, onChangeVoicePref, recordedAvailable }: Props) {
  const reducedMotion = useReducedMotion();
  const streak = getStreak();
  const doneToday = hasCompletedToday();

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(3rem,env(safe-area-inset-top))]">
      {/* quiet pre-dawn glow rising from the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{
          background: 'radial-gradient(120% 80% at 50% -10%, var(--accent-glow), transparent 70%)',
          opacity: 0.6,
        }}
      />
      <header className="relative">
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

      <main className="relative mt-12 flex flex-1 flex-col justify-start gap-4">
        {routines.map((routine, i) => (
          <motion.button
            key={routine.id}
            type="button"
            onClick={() => onStart(routine)}
            whileTap={reducedMotion ? undefined : { scale: 0.98 }}
            className="accent-fade rounded-2xl border bg-night-1 p-6 text-left transition-colors"
            style={{
              borderColor: i === 0 ? 'var(--accent-glow)' : 'var(--color-night-2)',
              boxShadow: i === 0 ? '0 0 40px -16px var(--accent-glow)' : undefined,
            }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-body text-xl font-semibold text-cream">{routine.title}</span>
              <span className="timer-numerals accent-fade shrink-0 text-2xl" style={{ color: 'var(--accent)' }}>
                {routine.totalSec / 60}
                <span className="text-sm text-mist"> min</span>
              </span>
            </div>
            <p className="mt-2 font-body text-sm leading-relaxed text-mist">{routine.subtitle}</p>
          </motion.button>
        ))}
      </main>

      <footer className="mt-8 flex flex-col items-center gap-6">
        <VoiceToggle pref={voicePref} onChange={onChangeVoicePref} recordedAvailable={recordedAvailable} />
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
