import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * Shared rig for exercise figures.
 *
 * Conventions (all figures follow these so they read as one family):
 *  - viewBox 0 0 240 160, ground line at y=142.
 *  - Figure drawn in `currentColor` (the block accent), strokeWidth 7,
 *    round caps/joins, head as a filled circle r≈9.
 *  - Movement: animate the `d` attribute between two keyframe poses with the
 *    same command structure (smooth morph), looping with mirrored repeat.
 *  - Reduced motion: render both poses crossfading slowly instead of morphing.
 */

export const VIEW_BOX = '0 0 240 160';
export const GROUND_Y = 142;
export const STROKE = 7;

export function FigureSvg({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg
      viewBox={VIEW_BOX}
      role="img"
      aria-label={`${label} demonstration`}
      className="h-full w-full"
      fill="none"
      stroke="currentColor"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1={16} y1={GROUND_Y} x2={224} y2={GROUND_Y} stroke="var(--color-night-2)" strokeWidth={4} />
      {children}
    </svg>
  );
}

export function Head({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r={9} fill="currentColor" stroke="none" />;
}

interface MorphProps {
  /** Two (or more) `d` keyframes with identical command structure. */
  poses: string[];
  duration?: number;
}

/** A body path that morphs between poses on loop; crossfades under reduced motion. */
export function MorphPath({ poses, duration = 3 }: MorphProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <>
        <motion.path
          d={poses[0]}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d={poses[poses.length - 1]}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </>
    );
  }

  return (
    <motion.path
      d={poses[0]}
      animate={{ d: [...poses, poses[0]] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

/** A head that moves with the body between poses. */
export function MorphHead({
  positions,
  duration = 3,
}: {
  positions: Array<[number, number]>;
  duration?: number;
}) {
  const reducedMotion = useReducedMotion();
  const cxs = [...positions.map((p) => p[0]), positions[0][0]];
  const cys = [...positions.map((p) => p[1]), positions[0][1]];

  if (reducedMotion) {
    const [cx, cy] = positions[0];
    return <Head cx={cx} cy={cy} />;
  }

  return (
    <motion.circle
      r={9}
      fill="currentColor"
      stroke="none"
      cx={positions[0][0]}
      cy={positions[0][1]}
      animate={{ cx: cxs, cy: cys }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}
