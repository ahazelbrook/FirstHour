import type { Routine } from '../types';

interface Props {
  routine: Routine;
  /** 0 → 1 through the whole session. */
  progress: number;
  elapsedSec: number;
  remainingSec: number;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function SessionProgress({ routine, progress, elapsedSec, remainingSec }: Props) {
  // Block boundary markers as fractions of the session
  const markers = routine.blocks
    .slice(1)
    .map((block) => block.segments[0].startSec / routine.totalSec);

  return (
    <div className="w-full">
      <div className="relative h-[3px] w-full overflow-visible rounded-full bg-night-2">
        <div
          className="accent-fade absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 8px var(--accent-glow)',
            transition: 'width 200ms linear, background-color 1200ms ease, box-shadow 1200ms ease',
          }}
        />
        {markers.map((frac) => (
          <div
            key={frac}
            className="absolute top-1/2 h-[9px] w-[2px] -translate-y-1/2 rounded-full bg-mist/40"
            style={{ left: `${frac * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-body text-[11px] tabular-nums text-mist">
        <span>{fmt(elapsedSec)}</span>
        <span>−{fmt(remainingSec)}</span>
      </div>
    </div>
  );
}
