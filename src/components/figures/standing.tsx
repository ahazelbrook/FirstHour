import { motion, useReducedMotion } from 'framer-motion';
import { FigureSvg, MorphHead, MorphPath } from './rig';

/**
 * Standing exercise figures. Same rig conventions as the ground figures:
 * viewBox 0 0 240 160, ground at y=142, currentColor stroke, head r=9.
 */

/** A faint vertical wall line, drawn like the ground line. */
function Wall({ x }: { x: number }) {
  return <line x1={x} y1={40} x2={x} y2={142} stroke="var(--color-night-2)" strokeWidth={4} />;
}

// Leg swings: standing tall; one leg swings front ↔ back.
export function LegSwingsFigure() {
  return (
    <FigureSvg label="Leg swings">
      <MorphHead positions={[[120, 44]]} duration={2.4} />
      {/* torso */}
      <path d="M120 55 L120 100" />
      {/* balancing arms */}
      <path d="M120 64 L98 78" />
      <path d="M120 64 L142 78" />
      {/* stance leg planted */}
      <path d="M120 100 L116 142" />
      {/* swinging leg: forward → back */}
      <MorphPath poses={['M120 100 L150 120', 'M120 100 L92 122']} duration={2.4} />
    </FigureSvg>
  );
}

// Wall slides: standing at a wall; forearms slide up and down the wall.
export function WallSlidesFigure() {
  return (
    <FigureSvg label="Wall slides">
      <Wall x={192} />
      <MorphHead positions={[[150, 50]]} duration={3} />
      {/* torso and legs */}
      <path d="M150 66 L150 100" />
      <path d="M150 100 L146 142" />
      <path d="M150 100 L158 142" />
      {/* arm bent to the wall: forearm slides down → up */}
      <MorphPath poses={['M150 66 L176 96 L184 74', 'M150 66 L176 70 L188 46']} duration={3} />
    </FigureSvg>
  );
}

// Scap wall push-up plus: straight arms to the wall; small torso push away/toward.
export function ScapWorkFigure() {
  return (
    <FigureSvg label="Scap wall push-up plus">
      <Wall x={194} />
      <MorphHead positions={[[156, 64], [148, 66]]} duration={3} />
      {/* body leaning to the wall — torso pushes back then toward */}
      <MorphPath poses={['M96 142 L150 72', 'M96 142 L142 74']} duration={3} />
      {/* straight arm to the wall, hand fixed on it */}
      <MorphPath poses={['M150 72 L190 76', 'M142 74 L190 76']} duration={3} />
    </FigureSvg>
  );
}

// Slow calf raises: heels rise and lower; the whole figure lifts onto the toes.
export function CalfRaisesFigure() {
  return (
    <FigureSvg label="Calf raises">
      <MorphHead positions={[[120, 44], [120, 36]]} duration={3} />
      {/* torso + arms, lifting with the body */}
      <MorphPath
        poses={['M120 55 L120 100 M120 66 L102 90 M120 66 L138 90', 'M120 47 L120 92 M120 58 L102 82 M120 58 L138 82']}
        duration={3}
      />
      {/* legs + feet: flat → up on the toes, toes stay on the ground */}
      <MorphPath
        poses={['M120 100 L108 138 L118 142 M120 100 L132 138 L122 142', 'M120 92 L110 130 L118 142 M120 92 L130 130 L122 142']}
        duration={3}
      />
    </FigureSvg>
  );
}

// March → high knees: standing; alternating knee drives up, arms pump opposite.
export function MarchKneesFigure() {
  return (
    <FigureSvg label="March into high knees">
      <MorphHead positions={[[120, 44]]} duration={1.4} />
      {/* torso */}
      <path d="M120 55 L120 100" />
      {/* arms pump opposite the knees */}
      <MorphPath poses={['M120 66 L104 82 M120 66 L138 52', 'M120 66 L104 52 M120 66 L138 82']} duration={1.4} />
      {/* legs: first sub-path is the driving knee, second is planted */}
      <MorphPath
        poses={['M120 100 L102 112 L112 130 M120 100 L134 142', 'M120 100 L138 112 L128 130 M120 100 L106 142']}
        duration={1.4}
      />
    </FigureSvg>
  );
}

// Bodyweight squats: squat down and up, chest up, arms reach forward to balance.
export function BwSquatsFigure() {
  return (
    <FigureSvg label="Bodyweight squats">
      <MorphHead positions={[[120, 50], [118, 74]]} duration={3} />
      {/* torso + counterbalance arms */}
      <MorphPath
        poses={['M120 60 L120 102 M120 70 L104 88 M120 70 L136 88', 'M118 84 L120 124 M118 92 L96 84 M118 92 L142 84']}
        duration={3}
      />
      {/* legs: standing → squat, knees track out over the feet */}
      <MorphPath
        poses={['M120 102 L106 122 L104 142 M120 102 L134 122 L136 142', 'M118 124 L96 130 L104 142 M122 124 L144 130 L136 142']}
        duration={3}
      />
    </FigureSvg>
  );
}

// Squats + reverse lunges: morph between a squat pose and a reverse-lunge pose.
export function SquatsLungesFigure() {
  return (
    <FigureSvg label="Squats and reverse lunges">
      <MorphHead positions={[[120, 74], [120, 64]]} duration={3.5} />
      {/* torso + arms: squat crouch → tall lunge */}
      <MorphPath
        poses={['M120 84 L120 124 M120 92 L100 86 M120 92 L140 86', 'M120 74 L120 116 M120 84 L104 100 M120 84 L136 100']}
        duration={3.5}
      />
      {/* legs: symmetric squat → split reverse lunge */}
      <MorphPath
        poses={['M120 124 L98 130 L104 142 M120 124 L142 130 L136 142', 'M120 116 L110 120 L112 142 M120 116 L150 136 L170 142']}
        duration={3.5}
      />
    </FigureSvg>
  );
}

// Lateral lunges: weight shifts onto one bent leg, the other stays straight.
export function LateralLungesFigure() {
  return (
    <FigureSvg label="Lateral lunges">
      <MorphHead positions={[[120, 50], [132, 70]]} duration={3} />
      {/* torso + arms: tall wide stance → lean over the bent leg */}
      <MorphPath
        poses={['M120 100 L120 60 M120 70 L104 84 M120 70 L136 84', 'M140 120 L134 80 M134 90 L118 104 M134 90 L150 104']}
        duration={3}
      />
      {/* legs: wide stand → lunge right, left leg straight */}
      <MorphPath
        poses={['M120 100 L92 122 L86 142 M120 100 L148 122 L154 142', 'M140 120 L100 132 L86 142 M140 120 L150 132 L154 142']}
        duration={3}
      />
    </FigureSvg>
  );
}

// Easy plyo intervals: light bouncy figure, feet just leaving the ground.
export function PlyoIntervalsFigure() {
  return (
    <FigureSvg label="Easy plyo intervals">
      <MorphHead positions={[[120, 50], [120, 42]]} duration={1.1} />
      {/* torso + arms, arms lift a touch on the hop */}
      <MorphPath
        poses={['M120 60 L120 104 M120 70 L102 86 M120 70 L138 86', 'M120 52 L120 96 M120 62 L100 74 M120 62 L140 74']}
        duration={1.1}
      />
      {/* legs: landing on the ground → airborne, feet off the floor */}
      <MorphPath
        poses={['M120 104 L106 124 L102 142 M120 104 L134 124 L138 142', 'M120 96 L108 118 L104 134 M120 96 L132 118 L136 134']}
        duration={1.1}
      />
    </FigureSvg>
  );
}

// Easy finisher: jumping jack, arms and legs out and in.
export function FinisherFigure() {
  return (
    <FigureSvg label="Jumping jacks">
      <MorphHead positions={[[120, 44]]} duration={1} />
      {/* torso */}
      <path d="M120 55 L120 100" />
      {/* arms: down at the sides → overhead */}
      <MorphPath poses={['M120 62 L108 96 M120 62 L132 96', 'M120 62 L96 40 M120 62 L144 40']} duration={1} />
      {/* legs: together → spread wide */}
      <MorphPath poses={['M120 100 L116 142 M120 100 L124 142', 'M120 100 L92 142 M120 100 L148 142']} duration={1} />
    </FigureSvg>
  );
}

// Reset breathing: standing tall, a slow calm chest-expansion breath pulse.
export function ResetBreathingFigure() {
  const reducedMotion = useReducedMotion();
  return (
    <FigureSvg label="Reset breathing">
      <motion.g
        animate={reducedMotion ? undefined : { scale: [1, 1.03, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '120px 132px' }}
      >
        <circle cx={120} cy={44} r={9} fill="currentColor" stroke="none" />
        <path d="M120 55 L120 100" />
        <path d="M120 100 L108 140" />
        <path d="M120 100 L132 140" />
      </motion.g>
      {/* arms lift gently on the slow inhale */}
      <MorphPath poses={['M120 66 L100 96 M120 66 L140 96', 'M120 64 L96 86 M120 64 L144 86']} duration={7} />
    </FigureSvg>
  );
}
