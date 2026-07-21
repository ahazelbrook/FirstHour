/**
 * Kinematic pose data for the volumetric-glow exercise figures.
 *
 * Every figure is driven by the same 12-number pose vector, so one small engine
 * animates the whole library. A figure loops between two keyframes (`a` → `b` →
 * `a`); under reduced motion only `a` is drawn.
 *
 * Pose vector (all angles in degrees):
 *   [ rx, ry, torso, head, shA, shE, sh2A, sh2E, hipA, kneeA, hip2A, knee2A ]
 *     rx,ry   pelvis / root position in the 12 12 176 190 viewBox
 *     torso   neck angle from vertical (0 = upright, ±90 = lying)
 *     head    head angle from the neck
 *     shA/shE arm A: shoulder angle + elbow flex
 *     sh2A/sh2E arm B
 *     hipA/kneeA  leg A: hip angle + knee flex
 *     hip2A/knee2A leg B
 *
 * Angles follow lm(base, θ, len) = base + len·[sin θ, cos θ] for limbs (0 points
 * down), while the torso uses [sin θ, −cos θ] (0 points up). See `forwardKinematics`.
 */

export type Pose = readonly [
  number, number, number, number, number, number,
  number, number, number, number, number, number,
];

export interface PoseKeyframes {
  a: Pose;
  b: Pose;
}

/** Segment lengths (viewBox units) shared by every figure. */
const T = 40; // neck / torso
const HL = 15; // head offset
const UA = 22; // upper arm
const FA = 20; // forearm
const TH = 30; // thigh
const SH = 28; // shin

export type Point = readonly [number, number];

export interface Frame {
  P: Point; // pelvis
  N: Point; // neck / shoulders
  Hc: Point; // head centre
  eA: Point;
  hA: Point; // arm A elbow, hand
  eB: Point;
  hB: Point; // arm B elbow, hand
  kA: Point;
  fA: Point; // leg A knee, foot
  kB: Point;
  fB: Point; // leg B knee, foot
}

const rad = (d: number) => (d * Math.PI) / 180;

/** Resolve a pose vector into joint positions. */
export function forwardKinematics(p: Pose): Frame {
  const [rx, ry, torso, head, shA, shE, sh2A, sh2E, hipA, kneeA, hip2A, knee2A] = p;
  const P: Point = [rx, ry];
  const N: Point = [rx + T * Math.sin(rad(torso)), ry - T * Math.cos(rad(torso))];
  const Hc: Point = [N[0] + HL * Math.sin(rad(head)), N[1] - HL * Math.cos(rad(head))];
  const lm = (b: Point, a: number, l: number): Point => [
    b[0] + l * Math.sin(rad(a)),
    b[1] + l * Math.cos(rad(a)),
  ];
  const eA = lm(N, shA, UA);
  const hA = lm(eA, shA + shE, FA);
  const eB = lm(N, sh2A, UA);
  const hB = lm(eB, sh2A + sh2E, FA);
  const kA = lm(P, hipA, TH);
  const fA = lm(kA, hipA + kneeA, SH);
  const kB = lm(P, hip2A, TH);
  const fB = lm(kB, hip2A + knee2A, SH);
  return { P, N, Hc, eA, hA, eB, hB, kA, fA, kB, fB };
}

/**
 * Pose library, keyed by the exercise id in src/data/routines.ts.
 *
 * The Daily-10 / Extended-20 (mobility) poses come straight from the design.
 * The Routine-A / Routine-B (stretch) poses follow the same skeleton so the
 * whole app reads as one figure family.
 */
export const POSES: Record<string, PoseKeyframes> = {
  default: { a: [100, 116, 0, 0, -8, 15, 8, 15, -4, 3, 4, 3], b: [100, 116, 0, 0, -8, 15, 8, 15, -4, 3, 4, 3] },

  // ── Mobility: ground (Raise) ───────────────────────────────────────────
  'breathing-sways': {
    a: [116, 150, -90, -90, 78, 8, 102, 8, 158, -42, 164, -42],
    b: [116, 150, -90, -90, 78, 8, 102, 8, 178, -42, 184, -42],
  },
  'glute-bridge': {
    a: [110, 152, -90, -88, 90, 0, 94, 0, 150, -72, 156, -72],
    b: [104, 136, -108, -88, 102, 0, 106, 0, 138, -58, 144, -58],
  },
  'sl-glute-bridge': {
    a: [110, 152, -90, -88, 90, 0, 94, 0, 150, -72, 96, 0],
    b: [104, 136, -108, -88, 102, 0, 106, 0, 138, -58, 92, 0],
  },
  'dead-bug': {
    a: [112, 150, -90, -90, 182, 6, 208, 6, 96, 2, 176, -70],
    b: [112, 150, -90, -90, 208, 6, 182, 6, 176, -70, 96, 2],
  },
  'cat-camel': {
    a: [92, 124, 86, -22, 10, 6, 10, 6, -8, 116, -2, 116],
    b: [93, 127, 80, 42, 10, 6, 10, 6, -8, 116, -2, 116],
  },

  // ── Mobility: mobilise ────────────────────────────────────────────────
  'bird-dog': {
    a: [92, 120, 85, 4, 102, 2, 6, 116, -96, 4, -6, 116],
    b: [92, 120, 85, 4, 6, 116, 102, 2, -6, 116, -96, 4],
  },
  wgs: {
    a: [95, 122, 42, 10, 56, 10, 42, 6, 54, 46, -60, 26],
    b: [95, 122, 42, -8, 56, 10, -150, 10, 54, 46, -60, 26],
  },
  'side-plank': {
    a: [102, 138, 58, -6, 150, 4, 182, 2, 216, 4, 220, 4],
    b: [100, 144, 58, -6, 150, 4, 182, 2, 216, 4, 220, 4],
  },
  'ankle-rocks': {
    a: [100, 120, 6, 0, 42, 58, -30, 58, 40, 22, -46, 128],
    b: [100, 120, 6, 0, 42, 58, -30, 58, 58, -2, -46, 128],
  },
  'adductor-rocks': {
    a: [92, 120, 84, 4, 6, 116, 6, 116, -8, 116, -96, 10],
    b: [80, 124, 78, 4, 6, 116, 6, 116, -8, 116, -96, 10],
  },
  'leg-swings': {
    a: [100, 116, 2, 0, -30, 12, 30, 12, 46, 4, 4, 2],
    b: [100, 116, 2, 0, -30, 12, 30, 12, -42, 4, 4, 2],
  },

  // ── Mobility: activate ────────────────────────────────────────────────
  'wall-slides': {
    a: [100, 116, 0, 0, -134, 54, 134, -54, -4, 3, 4, 3],
    b: [100, 116, 0, 0, -156, 18, 156, -18, -4, 3, 4, 3],
  },
  'scap-work': {
    a: [95, 118, 20, 0, 80, -8, 88, -8, -8, 4, 6, 4],
    b: [91, 118, 24, 0, 80, -8, 88, -8, -8, 4, 6, 4],
  },
  'hip-abduction': {
    a: [110, 150, -90, -90, 100, 4, 262, 2, 90, 2, 90, 2],
    b: [110, 150, -90, -90, 100, 4, 262, 2, 90, 2, 66, 2],
  },
  'calf-raises': {
    a: [100, 118, 2, 0, -6, 8, 6, 8, -4, 3, 4, 3],
    b: [100, 109, 2, 0, -6, 8, 6, 8, -4, 3, 4, 3],
  },

  // ── Mobility: potentiate ──────────────────────────────────────────────
  'march-knees': {
    a: [100, 116, 2, 0, 42, 30, -30, 30, 70, -82, 6, 2],
    b: [100, 116, 2, 0, -30, 30, 42, 30, 6, 2, 70, -82],
  },
  'bw-squats': {
    a: [100, 114, 4, 0, 60, 10, 55, 10, -4, 4, 4, 4],
    b: [100, 140, 26, 0, 72, 8, 66, 8, 46, -82, 40, -80],
  },
  'squats-lunges': {
    a: [100, 114, 6, 0, 60, 10, 55, 10, -4, 4, 4, 4],
    b: [100, 138, 24, 0, 70, 8, 64, 8, 46, -80, -56, 60],
  },
  'lateral-lunges': {
    a: [92, 132, 0, 0, 42, 10, 42, 10, -56, 42, 26, 3],
    b: [108, 132, 0, 0, 42, 10, 42, 10, -26, 3, 56, 42],
  },
  'plyo-intervals': {
    a: [100, 118, 3, 0, -20, 42, 20, 42, -3, 3, 3, 3],
    b: [100, 103, 3, 0, -62, 20, 62, 20, -6, 3, 6, 3],
  },
  finisher: {
    a: [100, 116, 0, 0, -8, 6, 8, 6, -4, 3, 4, 3],
    b: [100, 109, 0, 0, -150, 6, 150, 6, -36, 3, 36, 3],
  },
  'reset-breathing': {
    a: [100, 116, 0, 0, -6, 5, 6, 5, -3, 3, 3, 3],
    b: [100, 116, 0, 0, -42, 5, 42, 5, -3, 3, 3, 3],
  },

  // ── Routine A: hips (same skeleton, authored for these stretches) ──────
  'hip-cars': {
    a: [100, 120, 4, 0, -68, 12, 22, 16, 56, 50, -6, 4],
    b: [100, 120, 4, 0, -68, 12, 22, 16, -34, 14, -6, 4],
  },
  '90-90': {
    a: [116, 150, 2, 0, 58, 12, 58, 12, 74, 42, -70, 42],
    b: [116, 150, 24, 0, 58, 12, 58, 12, 74, 42, -70, 42],
  },
  'figure-4': {
    a: [116, 150, -90, -88, 100, 4, 118, 4, 150, -40, 120, -70],
    b: [116, 150, -90, -88, 100, 4, 118, 4, 156, -44, 118, -66],
  },
  butterfly: {
    a: [120, 150, 2, 0, 40, 16, 40, 16, -66, 118, 66, 118],
    b: [120, 150, 6, 0, 40, 16, 40, 16, -58, 112, 58, 112],
  },
  'hip-flexor': {
    a: [100, 124, 2, 0, 42, 22, -18, 18, 44, 26, -50, 126],
    b: [102, 124, 6, 0, 42, 22, -18, 18, 50, 22, -50, 126],
  },

  // ── Routine B: hamstrings & posterior chain ───────────────────────────
  'nerve-glides': {
    a: [116, 150, -90, -88, 150, 8, 118, 6, 148, -58, 88, 4],
    b: [116, 150, -90, -88, 156, 6, 118, 6, 166, -4, 88, 4],
  },
  'hamstring-strap': {
    a: [116, 150, -90, -88, 152, 10, 118, 6, 158, 2, 120, -64],
    b: [116, 150, -90, -88, 158, 8, 118, 6, 166, 0, 120, -64],
  },
  'wall-hamstring': {
    a: [118, 150, -90, -88, 96, 6, 116, 6, 172, 2, 88, 4],
    b: [122, 150, -90, -88, 96, 6, 116, 6, 172, 2, 88, 4],
  },
  'calf-stretch': {
    a: [100, 118, 18, 0, 58, 8, 64, 8, 44, 28, -42, -4],
    b: [100, 118, 22, 0, 58, 8, 64, 8, 46, 26, -44, -4],
  },
  'toe-touch': {
    a: [100, 116, 2, 0, -10, 12, 10, 12, -6, 4, 6, 4],
    b: [100, 116, 74, 0, 4, 10, 14, 10, -6, 4, 6, 4],
  },
};

export function poseFor(id: string): PoseKeyframes {
  return POSES[id] ?? POSES.default;
}
