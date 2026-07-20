import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * The one orchestrated moment: a dawn-gradient glow rises from the bottom
 * edge and dissolves as a session starts, then the UI settles. Renders once
 * on mount and removes itself.
 */
export function SunriseSweep() {
  const reducedMotion = useReducedMotion();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: reducedMotion ? 1.2 : 2.6, times: [0, 0.35, 1], ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[70%]"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 100%, rgba(244,112,59,0.34) 0%, rgba(247,154,75,0.14) 40%, transparent 72%)',
        }}
        initial={reducedMotion ? undefined : { y: '30%' }}
        animate={reducedMotion ? undefined : { y: '-6%' }}
        transition={{ duration: 2.6, ease: [0.22, 0.8, 0.36, 1] }}
      />
    </motion.div>
  );
}
