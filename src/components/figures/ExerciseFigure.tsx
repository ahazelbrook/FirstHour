import type { ComponentType } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { FigureSvg, MorphHead, MorphPath } from './rig';
import {
  SlGluteBridgeFigure,
  DeadBugFigure,
  CatCamelFigure,
  BirdDogFigure,
  SidePlankFigure,
  WgsFigure,
  AnkleRocksFigure,
  AdductorRocksFigure,
  HipAbductionFigure,
} from './ground';
import {
  LegSwingsFigure,
  WallSlidesFigure,
  ScapWorkFigure,
  CalfRaisesFigure,
  MarchKneesFigure,
  BwSquatsFigure,
  SquatsLungesFigure,
  LateralLungesFigure,
  PlyoIntervalsFigure,
  FinisherFigure,
  ResetBreathingFigure,
} from './standing';
import {
  HipCarsFigure,
  NinetyNinetyFigure,
  FigureFourFigure,
  ButterflyFigure,
  HipFlexorFigure,
  NerveGlidesFigure,
  HamstringStrapFigure,
  WallHamstringFigure,
  CalfStretchFigure,
  ToeTouchFigure,
} from './stretch';

/**
 * Looping demonstration figure for an exercise id. Add figures to the
 * registry below — one per exercise id in src/data/routines.ts.
 */

/* ── Reference implementations (the pattern for all figures) ─────────── */

// Supine breathing + knee sways: lying flat, bent knees swaying side to side.
function BreathingSwaysFigure() {
  const reducedMotion = useReducedMotion();
  return (
    <FigureSvg label="Breathing with knee sways">
      {/* torso flat on the ground */}
      <path d="M64 136 L128 136" />
      <MorphHead positions={[[50, 134]]} duration={4} />
      {/* bent legs swaying: knees apex left / centre / right */}
      {reducedMotion ? (
        <MorphPath poses={['M128 136 L146 96 L172 136', 'M128 136 L162 100 L184 136']} duration={4} />
      ) : (
        <MorphPath
          poses={['M128 136 L138 98 L166 136', 'M128 136 L152 94 L176 136', 'M128 136 L166 98 L186 136']}
          duration={4}
        />
      )}
    </FigureSvg>
  );
}

// Glute bridge: supine, hips rise to a straight shoulder–knee line, lower.
function GluteBridgeFigure() {
  return (
    <FigureSvg label="Glute bridge">
      <MorphHead positions={[[52, 134], [52, 134]]} duration={3} />
      {/* shoulders → hips → knees → feet */}
      <MorphPath
        poses={['M66 136 L118 136 L146 102 L158 138', 'M66 136 L118 104 L146 96 L158 138']}
        duration={3}
      />
      {/* arm resting along the floor */}
      <path d="M70 138 L104 138" strokeWidth={5} opacity={0.6} />
    </FigureSvg>
  );
}

/* ── Fallback: calm standing figure with a breath pulse ──────────────── */

function DefaultFigure({ label }: { label: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <FigureSvg label={label}>
      <motion.g
        animate={reducedMotion ? undefined : { scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '120px 140px' }}
      >
        <circle cx={120} cy={44} r={9} fill="currentColor" stroke="none" />
        <path d="M120 55 L120 100" />
        <path d="M120 66 L98 92" />
        <path d="M120 66 L142 92" />
        <path d="M120 100 L104 140" />
        <path d="M120 100 L136 140" />
      </motion.g>
    </FigureSvg>
  );
}

/* ── Registry ────────────────────────────────────────────────────────── */

const registry: Record<string, ComponentType> = {
  'breathing-sways': BreathingSwaysFigure,
  'glute-bridge': GluteBridgeFigure,
  'sl-glute-bridge': SlGluteBridgeFigure,
  'dead-bug': DeadBugFigure,
  'cat-camel': CatCamelFigure,
  'bird-dog': BirdDogFigure,
  'side-plank': SidePlankFigure,
  wgs: WgsFigure,
  'ankle-rocks': AnkleRocksFigure,
  'adductor-rocks': AdductorRocksFigure,
  'leg-swings': LegSwingsFigure,
  'wall-slides': WallSlidesFigure,
  'scap-work': ScapWorkFigure,
  'hip-abduction': HipAbductionFigure,
  'calf-raises': CalfRaisesFigure,
  'march-knees': MarchKneesFigure,
  'bw-squats': BwSquatsFigure,
  'squats-lunges': SquatsLungesFigure,
  'lateral-lunges': LateralLungesFigure,
  'plyo-intervals': PlyoIntervalsFigure,
  finisher: FinisherFigure,
  'reset-breathing': ResetBreathingFigure,
  'hip-cars': HipCarsFigure,
  '90-90': NinetyNinetyFigure,
  'figure-4': FigureFourFigure,
  butterfly: ButterflyFigure,
  'hip-flexor': HipFlexorFigure,
  'nerve-glides': NerveGlidesFigure,
  'hamstring-strap': HamstringStrapFigure,
  'wall-hamstring': WallHamstringFigure,
  'calf-stretch': CalfStretchFigure,
  'toe-touch': ToeTouchFigure,
};

export function ExerciseFigure({ name, label }: { name: string; label?: string }) {
  const Figure = registry[name];
  return (
    <div
      className="accent-fade mx-auto w-full max-w-[340px]"
      style={{ color: 'var(--accent)' }}
    >
      {Figure ? <Figure /> : <DefaultFigure label={label ?? name} />}
    </div>
  );
}
