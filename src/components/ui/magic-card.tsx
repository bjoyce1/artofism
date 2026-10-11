import { type ComponentProps, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Gradient-only Magic UI port: the card itself remains one accessible link. */
export function MagicCard({ children, className, ...props }: ComponentProps<typeof Link>) {
  const x = useMotionValue(-220);
  const y = useMotionValue(-220);
  const reducedMotion = useReducedMotion();
  const border = useMotionTemplate`radial-gradient(220px circle at ${x}px ${y}px, hsl(var(--gold)), hsl(var(--gold-bright)) 35%, transparent 100%)`;
  const glow = useMotionTemplate`radial-gradient(220px circle at ${x}px ${y}px, hsl(var(--gold) / 0.08), transparent 100%)`;

  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (reducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  return (
    <Link {...props} className={cn('magic-card group block relative isolate bg-card border border-border rounded-sm', className)}
      onPointerMove={move} onPointerLeave={() => { x.set(-220); y.set(-220); }}>
      <motion.div aria-hidden="true" className="magic-card-border" style={{ background: border }} />
      <motion.div aria-hidden="true" className="magic-card-glow" style={{ background: glow }} />
      {children}
    </Link>
  );
}