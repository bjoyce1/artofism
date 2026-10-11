import { motion, useReducedMotion } from 'framer-motion';

/** Magic UI border-beam, ported to Framer Motion and a v3-compatible CSS mask. */
export function BorderBeam() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return null;

  return (
    <div aria-hidden="true" className="border-beam-mask !m-0">
      <motion.div
        className="border-beam-segment"
        initial={{ offsetDistance: '0%' }}
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}