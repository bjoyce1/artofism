import { useRef } from 'react';
import { motion, type MotionValue, useReducedMotion, useScroll, useTransform } from 'framer-motion';

const sentences = ['This is not something you read once.', 'This is something you live.'];
const count = sentences.join(' ').split(' ').length;

function Word({ word, index, progress }: { word: string; index: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [index / count, (index + 1) / count], [0.25, 1]);
  return <motion.span className="inline-block" style={{ opacity }}>{word}</motion.span>;
}

function ScrollTextReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start center', 'end center'] });
  let index = 0;
  return (
    <div ref={ref} className="text-reveal-track" aria-label={sentences.join(' ')} role="group">
      <div className="text-reveal-sticky" aria-hidden="true">
        {sentences.map((sentence, line) => (
          <p key={sentence} className={`font-display text-xl sm:text-2xl md:text-3xl leading-relaxed ${line === 0 ? 'text-foreground' : 'text-primary font-semibold'}`}>
            {sentence.split(' ').map(word => <span key={index} className="inline-block mr-[0.25em]"><Word word={word} index={index++} progress={scrollYProgress} /></span>)}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Short, height-capped sticky reveal; reduced motion gets normal, fully lit text. */
export function TextReveal() {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return (
    <div className="mb-10" data-reduced-reveal>
      <p className="font-display text-xl sm:text-2xl md:text-3xl text-foreground leading-relaxed">{sentences[0]}</p>
      <p className="font-display text-xl sm:text-2xl md:text-3xl text-primary font-semibold leading-relaxed">{sentences[1]}</p>
    </div>
  );
  return <ScrollTextReveal />;
}