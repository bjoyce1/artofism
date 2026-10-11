import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useReducedMotion } from 'framer-motion';
import { claimPurchaseCelebration, type CelebrationPurchase } from '@/lib/purchaseCelebration';

function tokenColor(name: string): string {
  const token = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const probe = document.createElement('span');
  probe.style.color = `hsl(${token})`;
  document.body.appendChild(probe);
  const rgb = getComputedStyle(probe).color.match(/[\d.]+/g);
  probe.remove();
  return rgb ? `#${rgb.slice(0, 3).map(v => Math.round(Number(v)).toString(16).padStart(2, '0')).join('')}` : '';
}

export function PurchaseConfetti({ purchase, hasAccess }: { purchase: CelebrationPurchase | null; hasAccess: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const element = canvas.current;
    if (!element || !claimPurchaseCelebration(purchase, hasAccess, !!reducedMotion, window.sessionStorage)) return;
    const burst = confetti.create(element, { resize: true, disableForReducedMotion: true });
    const colors = ['--gold', '--gold-bright', '--ivory', '--gold', '--crimson'].map(tokenColor).filter(Boolean);
    const options = { particleCount: 60, spread: 48, startVelocity: 38, gravity: 1.2, ticks: 170, scalar: 0.85, colors, disableForReducedMotion: true };
    void burst({ ...options, angle: 60, origin: { x: 0.08, y: 0.85 } });
    void burst({ ...options, angle: 120, origin: { x: 0.92, y: 0.85 } });
    const timer = window.setTimeout(() => burst.reset(), 3000);
    return () => { window.clearTimeout(timer); burst.reset(); };
  }, [purchase, hasAccess, reducedMotion]);
  return <canvas ref={canvas} className="purchase-confetti pointer-events-none fixed inset-0 w-full h-full z-50" aria-hidden="true" />;
}