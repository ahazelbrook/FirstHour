import type { Routine } from '../types';

interface Props {
  routine: Routine;
  /** 0 → 1 through the whole session. */
  progress: number;
  elapsedSec: number;
  blockIndex: number;
  blockName: string;
  segmentIndex: number;
  totalSegments: number;
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function SessionProgress({
  routine,
  progress,
  elapsedSec,
  blockIndex,
  blockName,
  segmentIndex,
  totalSegments,
}: Props) {
  // Block boundary markers as fractions of the session.
  const markers = routine.blocks.slice(1).map((block) => block.segments[0].startSec / routine.totalSec);

  return (
    <div className="w-full">
      <div className="mb-2.5 flex items-baseline justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="accent-fade whitespace-nowrap text-[11px] uppercase tracking-[0.14em]"
            style={{ color: 'var(--accent)' }}
          >
            Block {blockIndex + 1} · {blockName}
          </span>
          <span className="shrink-0 font-body text-[11px] tabular-nums text-mist/70">
            {segmentIndex + 1} / {totalSegments}
          </span>
        </div>
        <span className="shrink-0 font-body text-[11px] tabular-nums text-mist">
          {fmt(elapsedSec)} / {fmt(routine.totalSec)}
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-visible rounded-full bg-white/[0.09]">
        <div
          className="accent-fade absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 10px var(--accent-glow)',
            transition: 'width 300ms linear, background-color 1200ms ease, box-shadow 1200ms ease',
          }}
        />
        {markers.map((frac) => (
          <div
            key={frac}
            className="absolute -top-[3px] h-3 w-[2px] -translate-x-1/2 rounded-[2px] bg-white/25"
            style={{ left: `${frac * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
