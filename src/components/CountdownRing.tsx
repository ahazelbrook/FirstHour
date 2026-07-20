import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  /** 0 → 1 through the current segment (arc drains as this rises). */
  progress: number;
  /** Whole seconds remaining in the segment. */
  remaining: number;
  /** Changes trigger the spring pulse. */
  segmentKey: string | number;
  paused: boolean;
  onTap: () => void;
}

const SIZE = 300;
const STROKE = 9;
const R = (SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

function formatRemaining(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function CountdownRing({ progress, remaining, segmentKey, paused, onTap }: Props) {
  const reducedMotion = useReducedMotion();
  const dashOffset = CIRCUMFERENCE * Math.min(Math.max(progress, 0), 1);

  return (
    <motion.button
      type="button"
      onClick={onTap}
      aria-label={paused ? 'Resume session' : 'Pause session'}
      className="relative block aspect-square w-full max-w-[min(78vw,62vh,420px)] cursor-pointer border-none bg-transparent p-0"
      key={reducedMotion ? undefined : segmentKey}
      initial={reducedMotion ? false : { scale: 0.965 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 210, damping: 16 }}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-full w-full -rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--color-night-2)"
          strokeWidth={STROKE}
        />
        <circle
          className="accent-fade"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{
            transition: reducedMotion
              ? 'stroke 1200ms ease'
              : 'stroke-dashoffset 120ms linear, stroke 1200ms ease',
            filter: 'drop-shadow(0 0 14px var(--accent-glow))',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="timer-numerals accent-fade text-[clamp(64px,19vw,140px)]"
          style={{ color: paused ? 'var(--color-mist)' : 'var(--color-cream)' }}
        >
          {formatRemaining(remaining)}
        </span>
        {paused && <span className="quiet-label mt-2">paused — tap to resume</span>}
      </div>
    </motion.button>
  );
}
