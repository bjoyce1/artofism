import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import heroBg from '@/assets/hero-bg.png';
import ismLogo from '@/assets/ism-logo.png';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Full background image */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: bgY }}
      >
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover object-left-top scale-110"
        />
        {/* Bottom fade to black */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-deep-black/40" />
        {/* Right side darken for text readability */}
        <div className="absolute inset-0 bg-gradient-to-l from-deep-black/70 via-deep-black/30 to-transparent" />
      </motion.div>

      {/* Content — right-aligned on desktop, centered on mobile */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-20"
      >
        <div className="flex flex-col items-center text-center sm:items-end sm:text-right sm:ml-auto sm:max-w-[55%]">
          {/* Logo */}
          <motion.img
            src={ismLogo}
            alt="The Art of ISM"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="w-72 sm:w-80 md:w-[420px] lg:w-[480px] h-auto mb-6 drop-shadow-[0_0_40px_hsl(43_76%_52%/0.3)]"
          />

          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-heading text-base sm:text-lg md:text-xl uppercase tracking-[0.15em] text-warm-ivory/90 mb-4"
          >
            A Code of Thought,
            <br />
            Movement, and Mastery
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="font-body text-sm sm:text-base text-muted-foreground max-w-md mb-4 leading-relaxed"
          >
            A philosophy built from experience. Refined through movement.
            Tested under pressure. This isn't just something you read —
            it's something you live.
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
            className="font-heading italic text-xl sm:text-2xl text-primary mb-8"
          >
            It's all ISM.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 font-ui mb-12"
          >
            <a
              href="#introduction"
              className="gold-dust px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.2em] hover:brightness-110 transition-all duration-300 rounded-full flex items-center gap-2 justify-center"
            >
              Begin the Book
              <span className="text-lg">→</span>
            </a>
            <a
              href="#chapters"
              className="gold-dust px-8 py-3 border border-primary/40 text-primary text-sm uppercase tracking-[0.2em] hover:bg-primary/10 transition-all duration-300 rounded-full"
            >
              Explore Chapters
            </a>
            <Link
              to="/codes"
              className="gold-dust px-8 py-3 border border-muted text-muted-foreground text-sm uppercase tracking-[0.2em] hover:border-primary/40 hover:text-primary transition-all duration-300 rounded-full"
            >
              View the Codes
            </Link>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.4 }}
            className="flex items-center gap-6 sm:gap-8 font-ui"
          >
            {[
              { value: '11', label: 'Chapters' },
              { value: '10', label: 'ISM Codes' },
              { value: '∞', label: 'Mindset' },
              { value: '1', label: 'Mission' },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-heading text-primary">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</div>
                </div>
                {i < 3 && <div className="w-px h-10 bg-muted-foreground/20" />}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-primary/50 to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
