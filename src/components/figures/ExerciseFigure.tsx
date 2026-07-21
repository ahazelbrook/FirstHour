import { useReducedMotion } from 'framer-motion';
import { forwardKinematics, poseFor, type Frame, type Point } from './poses';

/**
 * Volumetric-glow exercise figure.
 *
 * One kinematic engine draws every exercise: a blurred underlay for volume, a
 * solid gradient core on top, and a glowing head — lit from within, in the
 * app's fixed warm-pink figure gradient. The figure loops between two keyframe
 * poses (`a` → `b` → `a`); under reduced motion it holds pose `a`.
 */

// The figure gradient is fixed (independent of the block accent) so the body
// reads as one warm, self-lit form across the whole sunrise.
const FIG_FROM = '#e6b4ff';
const FIG_TO = '#ffb2d0';

// Limb stroke widths — real body volume: torso, arm, arm, leg, leg.
const WIDTHS = [34, 18, 18, 25, 25];

const fmt = (p: Point) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

// 2 points → a straight line; 3 points → a quadratic bowed toward the joint.
function pathOf(pts: Point[]): string {
  return pts.length === 2 ? `M ${fmt(pts[0])} L ${fmt(pts[1])}` : `M ${fmt(pts[0])} Q ${fmt(pts[1])} ${fmt(pts[2])}`;
}

// Each limb as an ordered point list (joint in the middle for the 3-point ones).
function limbs(fr: Frame): Point[][] {
  return [
    [fr.P, fr.N], // torso
    [fr.hA, fr.eA, fr.N], // arm A
    [fr.hB, fr.eB, fr.N], // arm B
    [fr.fA, fr.kA, fr.P], // leg A
    [fr.fB, fr.kB, fr.P], // leg B
  ];
}

const SPLINE = {
  dur: '2.7s',
  repeatCount: 'indefinite',
  calcMode: 'spline',
  keyTimes: '0;0.5;1',
  keySplines: '0.42 0 0.58 1;0.42 0 0.58 1',
} as const;

export function ExerciseFigure({ name, label }: { name: string; label?: string }) {
  const reducedMotion = useReducedMotion();
  const { a, b } = poseFor(name);
  const A = forwardKinematics(a);
  const B = forwardKinematics(b);
  const LA = limbs(A);
  const LB = limbs(B);

  // Unique gradient/filter ids per figure so multiple never collide.
  const uid = `fh-${name.replace(/[^a-z0-9]/gi, '')}`;

  const limbPath = (i: number, width: number, opacity: number) => {
    const aD = pathOf(LA[i]);
    return (
      <path
        key={i}
        d={aD}
        fill="none"
        stroke={`url(#${uid}-grad)`}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={opacity}
      >
        {!reducedMotion && (
          <animate attributeName="d" values={`${aD};${pathOf(LB[i])};${aD}`} {...SPLINE} />
        )}
      </path>
    );
  };

  const headAnim = (attr: 'cx' | 'cy', av: number, bv: number) =>
    reducedMotion ? null : (
      <animate
        key={attr}
        attributeName={attr}
        values={`${av.toFixed(1)};${bv.toFixed(1)};${av.toFixed(1)}`}
        {...SPLINE}
      />
    );

  const headKids = [headAnim('cx', A.Hc[0], B.Hc[0]), headAnim('cy', A.Hc[1], B.Hc[1])];

  return (
    <svg
      viewBox="12 12 176 190"
      role="img"
      aria-label={`${label ?? name} demonstration`}
      style={{ width: '100%', height: '100%', overflow: 'visible', display: 'block' }}
    >
      <defs>
        <linearGradient id={`${uid}-grad`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={FIG_FROM} />
          <stop offset="100%" stopColor={FIG_TO} />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={4.5} />
        </filter>
      </defs>

      {/* grounding shadow */}
      <ellipse cx={100} cy={193} rx={34} ry={5} fill={FIG_FROM} opacity={0.16} filter={`url(#${uid}-soft)`} />

      <g style={{ filter: 'drop-shadow(0 0 10px rgba(255,178,208,.34))' }}>
        {/* blurred underlay for volume */}
        <g filter={`url(#${uid}-soft)`} opacity={0.5}>
          {[0, 1, 2, 3, 4].map((i) => limbPath(i, WIDTHS[i] + 8, 0.8))}
        </g>
        {/* solid core */}
        <g>{[0, 1, 2, 3, 4].map((i) => limbPath(i, WIDTHS[i], 0.96))}</g>
        {/* head glow + core */}
        <circle cx={A.Hc[0]} cy={A.Hc[1]} r={20} fill={`url(#${uid}-grad)`} opacity={0.4} filter={`url(#${uid}-soft)`}>
          {headKids}
        </circle>
        <circle cx={A.Hc[0]} cy={A.Hc[1]} r={15.5} fill={`url(#${uid}-grad)`}>
          {headKids}
        </circle>
      </g>
    </svg>
  );
}
