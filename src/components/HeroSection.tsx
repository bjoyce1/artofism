import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import coverArt from '@/assets/art_of_ism_book_3.png';
import titleArt from '@/assets/title_2.png';

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Smoke overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-deep-black/95 to-deep-black z-0" />
      <div
        className="absolute inset-0 smoke-drift opacity-30 z-[1]"
        style={{
          background: 'radial-gradient(ellipse at 30% 50%, hsl(355 100% 24% / 0.4), transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0 smoke-drift-reverse opacity-20 z-[1]"
        style={{
          background: 'radial-gradient(ellipse at 70% 60%, hsl(355 85% 39% / 0.3), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-10 z-[1]"
        style={{
          background: 'radial-gradient(ellipse at 50% 80%, hsl(43 76% 52% / 0.15), transparent 50%)',
        }}
      />

      {/* Content */}
      {/* Full background cover art on mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 z-[2] sm:hidden"
      >
        <img
          src={coverArt}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/60 to-deep-black/30" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-5xl mx-auto">
        {/* Cover art - desktop only */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="mb-8 relative hidden sm:block"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent z-10 pointer-events-none" />
          <img
            src={coverArt}
            alt="The Art of ISM - Mr. CAP"
            className="sm:w-80 md:w-96 h-auto rounded-sm shadow-2xl object-cover"
            style={{
              boxShadow: '0 0 80px hsl(355 100% 24% / 0.3), 0 0 120px hsl(0 0% 0% / 0.5)',
            }}
          />
        </motion.div>

        {/* Title art */}
        <motion.img
          src={titleArt}
          alt="The Art of ISM"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="w-72 sm:w-96 md:w-[480px] h-auto gold-shimmer mb-6"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="font-ui text-sm sm:text-base uppercase tracking-[0.3em] text-muted-foreground mb-2"
        >
          A Code of Thought, Movement, and Mastery
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="font-ui text-xs uppercase tracking-[0.4em] text-muted-foreground mb-12"
        >
          by Mr. CAP
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 font-ui"
        >
          <a
            href="#introduction"
            className="gold-dust px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.2em] hover:brightness-110 transition-all duration-300"
          >
            Begin the Book
          </a>
          <a
            href="#chapters"
            className="gold-dust px-8 py-3 border border-primary/40 text-primary text-sm uppercase tracking-[0.2em] hover:bg-primary/10 transition-all duration-300"
          >
            Explore Chapters
          </a>
          <Link
            to="/codes"
            className="gold-dust px-8 py-3 border border-muted text-muted-foreground text-sm uppercase tracking-[0.2em] hover:border-primary/40 hover:text-primary transition-all duration-300"
          >
            View the Code
          </Link>
        </motion.div>
      </div>

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
