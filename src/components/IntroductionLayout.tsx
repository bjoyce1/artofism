import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import AnimatedSection from './AnimatedSection';
import { introduction } from '@/data/bookContent';
import SectionAudioButton from '@/components/SectionAudioButton';
import { Button } from '@/components/ui/button';

const IntroductionLayout = () => {
  const [expanded, setExpanded] = useState(false);
  const [excerptHeight, setExcerptHeight] = useState<number>();
  const excerptRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const specialLines = ['International State of Mind.', 'Limitless thought.', 'Limitless ability.', 'Why do I think the way I think?'];
  const boundary = introduction.paragraphs.indexOf('This book exists to change that.') + 1;

  useLayoutEffect(() => {
    const excerpt = excerptRef.current;
    if (!excerpt) return;
    const observer = new ResizeObserver(() => setExcerptHeight(excerpt.offsetHeight));
    observer.observe(excerpt);
    return () => observer.disconnect();
  }, []);

  const paragraph = (text: string, index: number) => (
    <p key={index} className={`text-base md:text-lg leading-[1.8] text-foreground/90 ${index === 0 ? 'drop-cap' : ''} ${specialLines.includes(text) ? 'font-display text-xl md:text-2xl text-primary font-semibold text-center' : ''} ${text === "It's all ISM." ? 'hidden' : ''}`}>
      {text}
    </p>
  );

  return (
    <section id="introduction" className="relative py-16 md:py-24 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-smoke/50 to-deep-black pointer-events-none" />
      <div className="relative max-w-3xl mx-auto">
        <AnimatedSection>
          <p className="font-ui text-xs uppercase tracking-[0.2em] text-primary mb-4">Introduction</p>
          <div className="mb-8">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">Enter the <span className="text-gold-gradient">ISM</span></h2>
            <SectionAudioButton sectionId="introduction" fileName="02_introduction.mp3" className="mt-4" />
          </div>
          <blockquote className="border-l-2 border-primary pl-6 mb-8">
            <p className="font-display text-2xl sm:text-3xl italic text-primary leading-relaxed">"If you don't define your mindset, the world will define it for you."</p>
          </blockquote>
        </AnimatedSection>
        <div className="relative">
          <motion.div id="introduction-text" initial={false} animate={{ height: expanded ? 'auto' : excerptHeight ?? 'auto' }} transition={{ duration: reducedMotion ? 0 : 0.45, ease: 'easeInOut' }} className="overflow-hidden">
            <div ref={excerptRef} className="space-y-5 pb-5">
              {introduction.paragraphs.slice(0, boundary).map(paragraph)}
            </div>
            <div {...(expanded ? {} : { inert: '' })} className="space-y-5">
              {introduction.paragraphs.slice(boundary).map((text, index) => paragraph(text, boundary + index))}
              <Button variant="link" className="px-0" aria-expanded={expanded} aria-controls="introduction-text" onClick={() => {
                setExpanded(false);
                document.getElementById('introduction')?.scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'start' });
              }}>Collapse</Button>
            </div>
          </motion.div>
          {!expanded && <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-deep-black to-transparent pointer-events-none" />}
        </div>
        {!expanded && <Button variant="outline" size="lg" className="mt-5 max-w-full whitespace-normal border-primary/30 text-primary" aria-expanded={expanded} aria-controls="introduction-text" onClick={() => setExpanded(true)}>Keep reading the Introduction</Button>}
      </div>
    </section>
  );
};

export default IntroductionLayout;
