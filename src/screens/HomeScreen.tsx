import { motion, useReducedMotion } from 'framer-motion';
import { routines } from '../data/routines';
import type { Routine } from '../types';
import { getStreak, hasCompletedToday } from '../lib/storage';
import { useMeshPalette } from '../lib/useMeshPalette';
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

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Still dark.';
  if (h < 11) return 'Good morning.';
  if (h < 17) return 'Good afternoon.';
  return 'Good evening.';
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
      <div className="glass flex overflow-hidden rounded-full">
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
  useMeshPalette('home', 'home');
  const reducedMotion = useReducedMotion();
  const streak = getStreak();
  const doneToday = hasCompletedToday();

  const subtitle =
    streak > 0
      ? `${streak} day${streak === 1 ? '' : 's'} ${doneToday ? '— done today. Same tomorrow.' : 'running. Keep it alive.'}`
      : 'Pick a routine. One tap, then the phone goes down — voice and chimes carry the session.';

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="accent-fade h-2.5 w-2.5 rounded-full"
            style={{ background: 'var(--accent)', boxShadow: '0 0 16px var(--accent)' }}
          />
          <span className="serif-display text-[22px] italic text-cream">First Hour</span>
        </div>
        <div className="glass accent-fade flex items-center gap-2 rounded-full px-3.5 py-1.5">
          <svg width="15" height="15" viewBox="0 0 24 24" style={{ color: 'var(--accent)' }} aria-hidden>
            <path
              fill="currentColor"
              d="M12 2c1.2 3.2.3 5.2-1 6.8-1.4 1.7-2.2 3-2.2 4.7A3.2 3.2 0 0 0 10 16c-.2-1 .2-2 .9-2.7.1 1.6.9 2.2 1.7 3 .9.9 1.5 1.8 1.5 3.1a3.9 3.9 0 1 1-7.8 0c0-2.6 1.6-4.2 1.6-4.2-.6.2-1.4.9-1.8 1.7C5.3 15 5 13.4 5 12.2 5 8 8.5 5.6 9.6 3.4 10.3 4.6 10.6 6 10.4 7.4 11.6 6.2 12.3 4 12 2Z"
            />
          </svg>
          <span className="font-body text-sm font-medium tabular-nums text-cream">{streak}</span>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-end gap-7 pt-10">
        <div>
          <p className="font-body text-[13px] tracking-wide text-mist">{todayLine()}</p>
          <h1 className="serif-display mt-2 text-[clamp(42px,12vw,60px)] text-cream">{greeting()}</h1>
          <p className="mt-3.5 max-w-[38ch] font-body text-[15px] leading-relaxed text-mist">{subtitle}</p>
        </div>

        <div className="flex flex-col gap-3.5">
          {routines.map((routine, i) => (
            <motion.button
              key={routine.id}
              type="button"
              onClick={() => onStart(routine)}
              whileTap={reducedMotion ? undefined : { scale: 0.985 }}
              className="glass accent-fade rounded-3xl p-6 text-left"
              style={i === 0 ? { boxShadow: '0 0 44px -18px var(--accent-glow-strong)' } : undefined}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-body text-2xl font-semibold text-cream">{routine.title}</span>
                <span className="timer-numerals accent-fade shrink-0 text-2xl" style={{ color: 'var(--accent)' }}>
                  {routine.totalSec / 60}
                  <span className="text-sm text-mist"> min</span>
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="font-body text-sm leading-relaxed text-mist">{routine.subtitle}</p>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="accent-fade shrink-0"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </main>

      <footer className="mt-8 flex flex-col items-center gap-6">
        <VoiceToggle pref={voicePref} onChange={onChangeVoicePref} recordedAvailable={recordedAvailable} />
        <button
          type="button"
          onClick={onInfo}
          className="border-none bg-transparent font-body text-xs text-mist underline decoration-white/20 underline-offset-4"
        >
          Why no stretching? The rules of this hour
        </button>
      </footer>
    </div>
  );
}
