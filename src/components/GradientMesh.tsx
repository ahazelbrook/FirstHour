import { useReducedMotion } from 'framer-motion';

/**
 * Full-screen swirling gradient mesh: five large blurred orbs drifting on
 * independent loops, over a warm near-black base, finished with a radial
 * legibility veil. Colors come from CSS custom properties (--fh-b1..b5) set by
 * useMeshPalette, so the whole field crossfades as the screen/block changes.
 */
const ORBS = [
  { pos: { top: '-12%', left: '-8%' }, size: '78vmax', v: '--fh-b1', anim: 'fh-o1', d: '--fh-d1', blur: 72, spread: 62 },
  { pos: { top: '-16%', right: '-12%' }, size: '72vmax', v: '--fh-b2', anim: 'fh-o2', d: '--fh-d2', blur: 72, spread: 62 },
  { pos: { bottom: '-18%', left: '-10%' }, size: '84vmax', v: '--fh-b3', anim: 'fh-o3', d: '--fh-d3', blur: 76, spread: 62 },
  { pos: { bottom: '-14%', right: '-8%' }, size: '74vmax', v: '--fh-b4', anim: 'fh-o4', d: '--fh-d4', blur: 72, spread: 62 },
  { pos: { top: '20%', left: '26%' }, size: '62vmax', v: '--fh-b5', anim: 'fh-o5', d: '--fh-d5', blur: 66, spread: 60 },
] as const;

export function GradientMesh() {
  const reduced = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute" style={{ inset: '-25%' }}>
        {ORBS.map((o, i) => (
          <div
            key={i}
            data-orb
            style={{
              position: 'absolute',
              ...o.pos,
              width: o.size,
              height: o.size,
              borderRadius: '50%',
              mixBlendMode: 'screen',
              filter: `blur(${o.blur}px)`,
              willChange: 'transform',
              background: `radial-gradient(circle at 50% 50%, var(${o.v}) 0%, transparent ${o.spread}%)`,
              animation: reduced ? 'none' : `${o.anim} var(${o.d}) ease-in-out infinite`,
            }}
          />
        ))}
      </div>
      {/* legibility veil */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(125% 92% at 50% 40%, transparent 32%, rgba(8,6,12,.68) 100%)' }}
      />
    </div>
  );
}
