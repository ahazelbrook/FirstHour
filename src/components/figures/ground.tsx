import { FigureSvg, MorphHead, MorphPath } from './rig';

/**
 * Floor and kneeling exercise figures. Each follows the rig conventions:
 * viewBox 0 0 240 160, ground at y=142, currentColor stroke, head r=9.
 * Two keyframe poses per moving part, matched command structure so `d` morphs.
 */

// Single-leg glute bridge: supine, one leg extended straight in the air,
// hips rise and lower on the planted leg.
export function SlGluteBridgeFigure() {
  return (
    <FigureSvg label="Single-leg glute bridge">
      <MorphHead positions={[[52, 134]]} duration={3} />
      {/* shoulders → hips → planted knee → planted foot */}
      <MorphPath
        poses={['M64 136 L116 136 L150 106 L164 138', 'M64 136 L116 106 L150 100 L164 138']}
        duration={3}
      />
      {/* the extended straight leg, rising with the hips */}
      <MorphPath poses={['M116 136 L152 110', 'M116 106 L152 80']} duration={3} />
      {/* arm resting on the floor */}
      <path d="M68 138 L102 138" strokeWidth={5} opacity={0.6} />
    </FigureSvg>
  );
}

// Dead bug: supine, arms up; opposite arm and leg extend away then return.
export function DeadBugFigure() {
  return (
    <FigureSvg label="Dead bug">
      <MorphHead positions={[[66, 136]]} duration={3.5} />
      {/* torso flat on the floor */}
      <path d="M84 138 L126 138" />
      {/* stationary arm and leg, held in tabletop */}
      <path d="M84 138 L92 98" />
      <path d="M126 138 L132 104 L158 104" />
      {/* reaching arm: up → overhead toward the floor */}
      <MorphPath poses={['M84 138 L80 98', 'M84 138 L52 120']} duration={3.5} />
      {/* reaching leg: tabletop → extended straight away */}
      <MorphPath poses={['M126 138 L138 104 L164 106', 'M126 138 L160 126 L194 128']} duration={3.5} />
    </FigureSvg>
  );
}

// Cat–camel: quadruped; spine gently rounds up then dips, mid-range only.
export function CatCamelFigure() {
  return (
    <FigureSvg label="Cat-camel">
      <MorphHead positions={[[60, 118], [62, 104]]} duration={3.5} />
      {/* front arm and back thigh, planted */}
      <path d="M76 106 L70 142" />
      <path d="M146 106 L152 142" />
      {/* spine: rounded up (cat) → dipped (camel), mid-range */}
      <MorphPath poses={['M76 106 Q111 88 146 106', 'M76 106 Q111 116 146 106']} duration={3.5} />
    </FigureSvg>
  );
}

// Bird-dog: quadruped; opposite arm and leg reach out horizontal, return.
export function BirdDogFigure() {
  return (
    <FigureSvg label="Bird-dog">
      <MorphHead positions={[[72, 110], [66, 100]]} duration={3.5} />
      {/* flat spine */}
      <path d="M86 104 L150 104" />
      {/* planted support arm and support knee */}
      <path d="M86 104 L82 142" />
      <path d="M150 104 L154 142" />
      {/* reaching arm: tucked → extended forward */}
      <MorphPath poses={['M86 104 L78 128', 'M86 104 L44 100']} duration={3.5} />
      {/* reaching leg: tucked → extended back */}
      <MorphPath poses={['M150 104 L160 128', 'M150 104 L196 100']} duration={3.5} />
    </FigureSvg>
  );
}

// Side plank: side-lying; hips lift to a straight line, lower.
export function SidePlankFigure() {
  return (
    <FigureSvg label="Side plank">
      <MorphHead positions={[[72, 90]]} duration={3} />
      {/* support forearm, shoulder down to elbow on the ground */}
      <path d="M80 102 L76 142" />
      {/* top arm reaching to the sky */}
      <path d="M80 102 L98 70" />
      {/* body line: hips sag → lift to a straight shoulder-to-feet line */}
      <MorphPath poses={['M80 102 L138 140 L196 142', 'M80 102 L138 122 L196 142']} duration={3} />
    </FigureSvg>
  );
}

// World's Greatest Stretch: low lunge; one arm rotates from floor to skyward.
export function WgsFigure() {
  return (
    <FigureSvg label="World's Greatest Stretch">
      <MorphHead positions={[[134, 62], [140, 58]]} duration={3.5} />
      {/* front leg: foot → knee → hip */}
      <path d="M128 142 L126 106 L150 102" />
      {/* back leg extended straight to the toe */}
      <path d="M150 102 L200 142" />
      {/* torso, hip to shoulder */}
      <path d="M150 102 L140 74" />
      {/* rotating arm: hand on the floor → reaching to the sky */}
      <MorphPath poses={['M140 74 L120 140', 'M140 74 L158 40']} duration={3.5} />
    </FigureSvg>
  );
}

// Half-kneeling ankle rocks: front knee rocks forward past the toes, heel down.
export function AnkleRocksFigure() {
  return (
    <FigureSvg label="Half-kneeling ankle rocks">
      <MorphHead positions={[[150, 62]]} duration={2.6} />
      {/* torso, hip to shoulder */}
      <path d="M150 104 L150 76" />
      {/* resting arm toward the front knee */}
      <path d="M150 82 L128 104" strokeWidth={5} opacity={0.6} />
      {/* back leg down on the ground: hip → knee → shin */}
      <path d="M150 104 L156 142 L180 142" />
      {/* front foot flat on the ground, heel stays down */}
      <path d="M96 142 L118 142" />
      {/* front shin + thigh: knee vertical → rocked forward past the toes */}
      <MorphPath poses={['M100 142 L100 106 L150 104', 'M100 142 L120 108 L150 104']} duration={2.6} />
    </FigureSvg>
  );
}

// Adductor rock-backs: quadruped with one leg out to the side; hips rock back.
export function AdductorRocksFigure() {
  return (
    <FigureSvg label="Adductor rock-backs">
      <MorphHead positions={[[80, 110]]} duration={3.5} />
      {/* planted support arm, shoulder to hand */}
      <path d="M92 108 L82 142" />
      {/* spine: shoulder to hip — hip rocks back and down */}
      <MorphPath poses={['M92 108 L150 108', 'M92 108 L168 124']} duration={3.5} />
      {/* support knee, from the hip */}
      <MorphPath poses={['M150 108 L152 142', 'M168 124 L152 142']} duration={3.5} />
      {/* leg extended out to the side */}
      <MorphPath poses={['M150 108 L204 118', 'M168 124 L212 130']} duration={3.5} />
    </FigureSvg>
  );
}

// Side-lying hip abduction: top leg lifts up and lowers, heel leading.
export function HipAbductionFigure() {
  return (
    <FigureSvg label="Side-lying hip abduction">
      <MorphHead positions={[[58, 116]]} duration={3} />
      {/* propping forearm to the floor */}
      <path d="M70 124 L64 142" />
      {/* torso lying on the side, shoulder to hip */}
      <path d="M70 124 L150 132" />
      {/* bottom leg resting on the ground */}
      <path d="M150 132 L206 140" />
      {/* top leg: lowered → lifted with the heel leading */}
      <MorphPath poses={['M150 132 L204 130', 'M150 132 L200 104']} duration={3} />
    </FigureSvg>
  );
}
