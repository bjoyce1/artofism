import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import SectionAudioButton from '@/components/SectionAudioButton';
import heroBg from '@/assets/hero-bg.webp';
import mobileHeroBg from '@/assets/mobile-hero-bg.webp';
import ismLogo from '@/assets/ism-logo.webp';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  return (
    <section ref={sectionRef} className="relative min-h-[95dvh] sm:min-h-[100dvh] flex items-center overflow-hidden bg-deep-black">
      {/* Real H1 for SEO/a11y — visually hidden but paired with the logo image below. */}
      <h1 className="sr-only">The Art of ISM — A Code of Thought, Movement, and Mastery by Mr. CAP</h1>
      {/* Background image with parallax — only one source actually downloads per breakpoint */}
      <motion.div className="absolute top-0 left-0 right-0 h-[55dvh] sm:h-full z-0 pt-14 sm:pt-0" style={{ y: bgY }}>
        <picture>
          <source media="(min-width: 640px)" srcSet={heroBg} />
          <img
            src={mobileHeroBg}
            alt=""
            width={1920}
            height={1080}
            className="w-full h-full sm:h-[115%] object-cover object-[50%_25%] sm:object-[calc(0%_-_40px)_top]"
            {...{ fetchpriority: 'high' } /* React 18 only forwards the lowercase form to the DOM */}
            decoding="async"
          />
        </picture>
        {/* Base vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--deep-black))] via-transparent to-[hsl(var(--deep-black)/0.35)]" />
        {/* Mobile overlay */}
        <div className="absolute inset-0 bg-deep-black/10 sm:bg-transparent" />
        {/* Desktop: left-to-right gradient for text readability */}
        <div className="absolute inset-0 hidden sm:block bg-gradient-to-l from-[hsl(var(--deep-black)/0.80)] via-[hsl(var(--deep-black)/0.20)] to-transparent" />
        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[30%]"
          style={{
            background: 'linear-gradient(to top, hsl(var(--deep-black)), hsl(var(--deep-black) / 0.85) 40%, transparent)',
          }}
        />
      </motion.div>

      {/* Floating ember particles */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: `hsl(${25 + i * 5} ${80 + i * 3}% ${50 + i * 5}%)`,
              left: `${55 + i * 7}%`,
              bottom: `${10 + i * 12}%`,
              opacity: 0.4 + i * 0.08,
              animation: `float-ember ${4 + i * 1.5}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.7}s`,
              filter: `blur(${i % 2 === 0 ? 0 : 1}px)`,
            }}
          />
        ))}
      </div>

      {/* Mobile photo ends at 55dvh; the logo overlaps its fading lower edge. */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-center sm:justify-end"
      >
        <div className="flex flex-col items-center text-center sm:items-end sm:text-right w-full sm:w-auto sm:max-w-[80%] lg:max-w-[60%] pt-[43dvh] pb-5 sm:pt-24 sm:pb-16">
          <motion.img
            src={ismLogo}
            alt="The Art of ISM"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-[260px] max-w-full sm:w-80 md:w-[400px] lg:w-[460px] h-auto mb-2 sm:mb-5 drop-shadow-[0_0_60px_hsl(43_76%_52%/0.25)]"
          />
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.04 }}
            className="hidden sm:block font-heading text-base md:text-lg uppercase tracking-[0.1em] text-foreground/85 mb-4 leading-relaxed max-w-md"
          >
            A Code of Thought,<br />Movement, and Mastery
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="mb-4 sm:mb-6"
          >
            <p className="font-display text-lg md:text-xl text-foreground/95 leading-relaxed">This is not motivation.</p>
            <p className="font-display text-lg md:text-xl text-primary font-semibold leading-relaxed">This is a system.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="flex flex-col gap-2 sm:gap-3 font-ui w-full sm:w-auto sm:flex-row"
          >
            <Button asChild size="lg" className="gold-dust rounded-full px-5 text-xs uppercase tracking-[0.08em] whitespace-nowrap hover:brightness-110 active:scale-[0.97]">
              <Link to="/chapter/1" onClick={() => trackEvent('landing_cta_click', { cta: 'read_chapter_1_free' })}>
                Read Chapter 1 Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gold-dust rounded-full px-5 border-primary/50 text-primary text-xs uppercase tracking-[0.08em] whitespace-nowrap bg-transparent hover:bg-primary/10 hover:text-primary active:scale-[0.97]">
              <Link to="/unlock" onClick={() => trackEvent('landing_cta_click', { cta: 'unlock_full_book' })}>
                Unlock Full Book — $9.99
              </Link>
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.16 }} className="mt-3">
            <SectionAudioButton sectionId="hero" fileName="00_hero.mp3" label="Listen" className="min-h-9" />
          </motion.div>
          <motion.a
            href="#chapters"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }}
            className="inline-flex items-center min-h-11 mt-1 font-ui text-[11px] sm:text-xs text-foreground/85 hover:text-primary transition-colors underline-offset-4 hover:underline"
          >
            Explore the chapters
          </motion.a>
        </div>
      </motion.div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px z-10">
        <div className="h-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="hidden sm:block absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
