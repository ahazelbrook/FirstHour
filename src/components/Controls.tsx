import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ControlsProps {
  paused: boolean;
  muted: boolean;
  onTogglePause: () => void;
  onSkipPrev: () => void;
  onSkipNext: () => void;
  onToggleMute: () => void;
  onExit: () => void;
}

function ControlButton({
  label,
  onClick,
  large,
  children,
}: {
  label: string;
  onClick: () => void;
  large?: boolean;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={reducedMotion ? undefined : { scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 500, damping: 24 }}
      className={`accent-fade flex items-center justify-center rounded-full ${
        large
          ? 'h-[70px] w-[70px] border-[1.5px] text-[color:var(--accent)]'
          : 'glass h-12 w-12 text-cream'
      }`}
      style={
        large
          ? {
              borderColor: 'var(--accent)',
              background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 0 30px var(--accent-glow)',
            }
          : undefined
      }
    >
      {children}
    </motion.button>
  );
}

const icon = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function Controls({ paused, muted, onTogglePause, onSkipPrev, onSkipNext, onToggleMute, onExit }: ControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <ControlButton label="Exit session" onClick={onExit}>
        <svg width="18" height="18" viewBox="0 0 24 24" {...icon}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </ControlButton>
      <ControlButton label="Previous segment" onClick={onSkipPrev}>
        <svg width="20" height="20" viewBox="0 0 24 24" {...icon}>
          <path d="M17 5v14L8 12l9-7z" fill="currentColor" stroke="none" />
          <path d="M6 5v14" />
        </svg>
      </ControlButton>
      <ControlButton label={paused ? 'Resume' : 'Pause'} onClick={onTogglePause} large>
        {paused ? (
          <svg width="26" height="26" viewBox="0 0 24 24" {...icon}>
            <path d="M8 5v14l11-7-11-7z" fill="currentColor" stroke="none" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" {...icon}>
            <path d="M8 5v14M16 5v14" strokeWidth={3.4} />
          </svg>
        )}
      </ControlButton>
      <ControlButton label="Next segment" onClick={onSkipNext}>
        <svg width="20" height="20" viewBox="0 0 24 24" {...icon}>
          <path d="M7 5v14l9-7-9-7z" fill="currentColor" stroke="none" />
          <path d="M18 5v14" />
        </svg>
      </ControlButton>
      <ControlButton label={muted ? 'Unmute voice' : 'Mute voice'} onClick={onToggleMute}>
        {muted ? (
          <svg width="20" height="20" viewBox="0 0 24 24" {...icon}>
            <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
            <path d="M16 9l5 6M21 9l-5 6" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" {...icon}>
            <path d="M11 5L6 9H3v6h3l5 4V5z" fill="currentColor" stroke="none" />
            <path d="M15.5 8.5a5 5 0 010 7M18.5 6a9 9 0 010 12" />
          </svg>
        )}
      </ControlButton>
    </div>
  );
}
