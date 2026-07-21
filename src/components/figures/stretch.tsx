import { FigureSvg, MorphHead, MorphPath } from './rig';

/**
 * Stretching figures for Routine A (hips) and Routine B (hamstrings). Same rig
 * conventions as the ground/standing figures: viewBox 0 0 240 160, ground at
 * y=142, currentColor stroke, head r=9, two-or-three matched keyframe poses so
 * the `d` attribute morphs smoothly.
 */

/** A faint vertical wall/rack line, drawn like the ground line. */
function Wall({ x, y1 = 40 }: { x: number; y1?: number }) {
  return <line x1={x} y1={y1} x2={x} y2={142} stroke="var(--color-night-2)" strokeWidth={4} />;
}

// Hip CARs: standing, hand on a rack; the free leg draws a slow controlled circle.
export function HipCarsFigure() {
  return (
    <FigureSvg label="Hip CARs">
      <Wall x={58} y1={58} />
      <MorphHead positions={[[132, 44]]} duration={4} />
      {/* torso */}
      <path d="M132 55 L132 100" />
      {/* support arm reaching to the rack */}
      <path d="M132 66 L74 72" strokeWidth={5} opacity={0.6} />
      {/* stance leg planted */}
      <path d="M132 100 L138 142" />
      {/* circling leg: knee up front → knee out to the side → swept behind */}
      <MorphPath
        poses={['M132 100 L110 108 L98 130', 'M132 100 L158 102 L182 112', 'M132 100 L150 122 L172 140']}
        duration={4}
      />
    </FigureSvg>
  );
}

// 90/90: seated, both knees folded to 90°; torso sits tall then leans forward.
export function NinetyNinetyFigure() {
  return (
    <FigureSvg label="Ninety-ninety hip stretch">
      <MorphHead positions={[[110, 72], [102, 86]]} duration={4} />
      {/* front folded leg: hip → knee forward → foot */}
      <path d="M116 138 L152 128 L150 142" />
      {/* back folded leg: hip → knee behind → foot */}
      <path d="M116 138 L88 130 L82 142" />
      {/* torso: tall → leaning forward over the front shin */}
      <MorphPath poses={['M110 82 L116 138', 'M102 96 L116 138']} duration={4} />
      {/* forward-reaching arm */}
      <MorphPath poses={['M110 90 L136 118', 'M102 104 L138 126']} duration={4} />
    </FigureSvg>
  );
}

// Supine figure-4: lying down, one ankle crossed over the other knee, drawn in.
export function FigureFourFigure() {
  return (
    <FigureSvg label="Supine figure-four stretch">
      <MorphHead positions={[[54, 134]]} duration={4} />
      {/* torso flat on the floor */}
      <path d="M64 138 L120 138" />
      {/* support thigh drawn toward the chest → and deeper */}
      <MorphPath poses={['M120 138 L150 108 L138 88', 'M120 138 L140 118 L126 98']} duration={4} />
      {/* crossed leg: ankle over the support knee, out to the side */}
      <MorphPath poses={['M150 108 L176 116 L182 94', 'M140 118 L168 124 L174 102']} duration={4} />
      {/* clasping arm reaching through to the thigh */}
      <path d="M96 138 L128 116" strokeWidth={5} opacity={0.6} />
    </FigureSvg>
  );
}

// Butterfly: seated, soles together; knees drop open then lift on the contraction.
export function ButterflyFigure() {
  return (
    <FigureSvg label="Butterfly stretch">
      <MorphHead positions={[[120, 70], [120, 74]]} duration={3} />
      {/* torso, sitting tall */}
      <MorphPath poses={['M120 80 L120 132', 'M120 84 L120 132']} duration={3} />
      {/* left leg: knee drops down → lifts a touch on the squeeze */}
      <MorphPath poses={['M120 132 L92 128 L114 138', 'M120 132 L96 118 L116 136']} duration={3} />
      {/* right leg, mirrored */}
      <MorphPath poses={['M120 132 L148 128 L126 138', 'M120 132 L144 118 L124 136']} duration={3} />
    </FigureSvg>
  );
}

// Half-kneeling hip flexor: back knee down; gentle forward shift, tall torso.
export function HipFlexorFigure() {
  return (
    <FigureSvg label="Half-kneeling hip flexor stretch">
      <MorphHead positions={[[120, 58], [128, 60]]} duration={4} />
      {/* torso upright and tall */}
      <MorphPath poses={['M120 68 L120 106', 'M128 70 L126 106']} duration={4} />
      {/* back leg: hip → knee down → shin along the floor */}
      <MorphPath poses={['M120 106 L104 138 L82 142', 'M126 106 L108 138 L86 142']} duration={4} />
      {/* front leg: hip → knee over the foot, shifting forward */}
      <MorphPath poses={['M120 106 L150 116 L150 142', 'M126 106 L160 118 L158 142']} duration={4} />
      {/* resting arm toward the front knee */}
      <path d="M120 74 L104 104" strokeWidth={5} opacity={0.6} />
    </FigureSvg>
  );
}

// Sciatic nerve glides: supine; one leg pistons from bent to straight-to-ceiling.
export function NerveGlidesFigure() {
  return (
    <FigureSvg label="Sciatic nerve glides">
      <MorphHead positions={[[54, 134]]} duration={2.4} />
      {/* torso flat on the floor */}
      <path d="M64 138 L128 138" />
      {/* resting leg extended along the floor */}
      <path d="M128 138 L182 140" />
      {/* working leg held at the thigh: knee bent → straightening to the ceiling */}
      <MorphPath poses={['M128 138 L138 104 L118 116', 'M128 138 L140 100 L134 66']} duration={2.4} />
      {/* hands holding behind the thigh */}
      <path d="M96 138 L134 112" strokeWidth={5} opacity={0.6} />
    </FigureSvg>
  );
}

// Supine hamstring with strap: one straight leg drawn toward vertical, then deeper.
export function HamstringStrapFigure() {
  return (
    <FigureSvg label="Supine hamstring stretch with strap">
      <MorphHead positions={[[54, 134]]} duration={4} />
      {/* torso flat on the floor */}
      <path d="M64 138 L120 138" />
      {/* bent support leg, foot flat on the floor */}
      <path d="M120 138 L138 118 L156 140" />
      {/* raised straight leg: pulled toward vertical, then deeper */}
      <MorphPath poses={['M120 138 L108 94 L98 66', 'M120 138 L112 90 L106 58']} duration={4} />
      {/* strap from the hands up to the raised foot */}
      <MorphPath poses={['M96 138 L98 66', 'M96 138 L106 58']} duration={4} />
    </FigureSvg>
  );
}

// Wall hamstring: lying at a wall, one leg straight up it; hips scoot in slightly.
export function WallHamstringFigure() {
  return (
    <FigureSvg label="Wall hamstring stretch">
      <Wall x={178} />
      <MorphHead positions={[[60, 134], [64, 134]]} duration={4} />
      {/* torso flat on the floor, scooting toward the wall */}
      <MorphPath poses={['M70 138 L150 138', 'M74 138 L154 138']} duration={4} />
      {/* one leg straight up against the wall */}
      <MorphPath poses={['M150 138 L166 92 L172 52', 'M154 138 L168 92 L173 52']} duration={4} />
      {/* other leg extended flat toward the wall */}
      <MorphPath poses={['M150 138 L176 140', 'M154 138 L176 140']} duration={4} />
    </FigureSvg>
  );
}

// Standing calf stretch: split stance at a wall; back leg straight, heel down.
export function CalfStretchFigure() {
  return (
    <FigureSvg label="Standing calf stretch">
      <Wall x={196} />
      <MorphHead positions={[[150, 52], [156, 54]]} duration={3.5} />
      {/* torso leaning toward the wall */}
      <MorphPath poses={['M150 62 L138 104', 'M156 64 L142 104']} duration={3.5} />
      {/* hands on the wall */}
      <MorphPath poses={['M150 66 L190 78', 'M156 68 L190 76']} duration={3.5} />
      {/* front leg bent, foot forward under the wall */}
      <MorphPath poses={['M138 104 L152 122 L168 142', 'M142 104 L156 122 L172 142']} duration={3.5} />
      {/* back leg straight to the heel, driven down */}
      <MorphPath poses={['M138 104 L108 128 L92 142', 'M142 104 L110 130 L94 142']} duration={3.5} />
    </FigureSvg>
  );
}

// Toe-touch progression: hinge from standing to a forward fold and back.
export function ToeTouchFigure() {
  return (
    <FigureSvg label="Toe-touch progression">
      <MorphHead positions={[[120, 46], [152, 104]]} duration={3} />
      {/* torso: upright → folded forward from the hips */}
      <MorphPath poses={['M120 56 L120 104', 'M150 110 L120 104']} duration={3} />
      {/* arms: at the sides → reaching down toward the toes */}
      <MorphPath poses={['M120 66 L106 94 M120 66 L134 94', 'M150 110 L150 140 M150 110 L152 140']} duration={3} />
      {/* legs planted, feet fixed */}
      <path d="M120 104 L112 142" />
      <path d="M120 104 L128 142" />
      {/* the ball squeezed between the knees */}
      <circle cx={120} cy={124} r={5} fill="none" opacity={0.6} />
    </FigureSvg>
  );
}
