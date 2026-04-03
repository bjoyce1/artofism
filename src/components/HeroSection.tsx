import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';
import heroBg from '@/assets/hero-bg.png';
import ismLogo from '@/assets/ism-logo.png';

const stats = [
  { value: '11', label: 'Chapters' },
  { value: '10', label: 'ISM Codes' },
  { value: '∞', label: 'Mindset' },
  { value: '1', label: 'Mission' },
];

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '8%']);

  return (
    <section ref={sectionRef} className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Background image with parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <img
          src={heroBg}
          alt=""
          className="w-full h-[115%] object-cover object-[25%_top] sm:object-left-top"
        />
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--deep-black))] via-[hsl(var(--deep-black)/0.15)] to-[hsl(var(--deep-black)/0.5)]" />
        {/* On mobile: darken more evenly for centered text. On desktop: darken right side */}
        <div className="absolute inset-0 bg-[hsl(var(--deep-black)/0.45)] sm:bg-transparent" />
        <div className="absolute inset-0 hidden sm:block bg-gradient-to-l from-[hsl(var(--deep-black)/0.80)] via-[hsl(var(--deep-black)/0.25)] to-transparent" />
        {/* Warm bottom glow */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[30%]"
          style={{
            background: 'linear-gradient(to top, hsl(var(--deep-black)), hsl(var(--deep-black) / 0.9) 30%, hsl(20 60% 8% / 0.4) 70%, transparent)',
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

      {/* Content */}
      <motion.div
        style={{ y: contentY }}
        className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-20 flex items-center justify-center sm:justify-end min-h-[100dvh]"
      >
        <div className="flex flex-col items-center text-center sm:items-end sm:text-right sm:max-w-[55%] lg:max-w-[50%] pt-20 pb-8 sm:pt-16 sm:pb-10">
          {/* Logo */}
          <motion.img
            src={ismLogo}
            alt="The Art of ISM"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-56 sm:w-80 md:w-[400px] lg:w-[460px] h-auto mb-4 sm:mb-5 drop-shadow-[0_0_60px_hsl(43_76%_52%/0.25)]"
          />

          {/* Subtitle */}
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            className="font-heading text-xs sm:text-base md:text-lg uppercase tracking-[0.15em] sm:tracking-[0.18em] text-foreground/85 mb-3 sm:mb-5 leading-relaxed"
          >
            A Code of Thought,
            <br />
            Movement, and Mastery
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            className="font-body text-[11px] sm:text-sm text-muted-foreground max-w-xs sm:max-w-sm mb-3 sm:mb-4 leading-relaxed"
          >
            A philosophy built from experience. Refined through movement.
            Tested under pressure. This isn't just something you read —
            it's something you live.
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="font-heading italic text-base sm:text-xl md:text-2xl text-primary mb-6 sm:mb-8"
            style={{ textShadow: '0 0 30px hsl(43 76% 52% / 0.3)' }}
          >
            It's all ISM.
          </motion.p>

          {/* CTAs — stacked on mobile, row on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.1 }}
            className="flex flex-col gap-3 font-ui mb-8 sm:mb-10 w-full sm:w-auto sm:flex-row"
          >
            <a
              href="#introduction"
              className="gold-dust inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:px-7 sm:py-3 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] font-medium rounded-full hover:shadow-[0_0_30px_hsl(43_76%_52%/0.4)] hover:brightness-110 transition-all duration-500 active:scale-[0.97]"
            >
              Begin the Book
              <span className="text-sm">→</span>
            </a>
            <a
              href="#chapters"
              className="gold-dust inline-flex items-center justify-center px-6 py-3.5 sm:px-7 sm:py-3 border border-primary/30 text-primary text-xs uppercase tracking-[0.2em] rounded-full hover:bg-primary/10 hover:border-primary/50 transition-all duration-500 backdrop-blur-sm active:scale-[0.97]"
            >
              Explore Chapters
            </a>
            <Link
              to="/codes"
              className="gold-dust inline-flex items-center justify-center px-6 py-3.5 sm:px-7 sm:py-3 border border-muted-foreground/20 text-muted-foreground text-xs uppercase tracking-[0.2em] rounded-full hover:border-primary/30 hover:text-primary transition-all duration-500 backdrop-blur-sm active:scale-[0.97]"
            >
              View the Codes
            </Link>
          </motion.div>

          {/* Stats bar — 2x2 grid on mobile, row on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.3 }}
            className="grid grid-cols-4 gap-0 sm:flex sm:items-center"
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex items-center">
                <div className="text-center px-3 sm:px-6">
                  <div className="text-lg sm:text-2xl md:text-3xl font-heading text-primary leading-none mb-0.5 sm:mb-1">
                    {stat.value}
                  </div>
                  <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-muted-foreground font-ui whitespace-nowrap">
                    {stat.label}
                  </div>
                </div>
                {i < stats.length - 1 && (
                  <div className="w-px h-6 sm:h-10 bg-muted-foreground/15" />
                )}
              </div>
            ))}
          </motion.div>
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
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-primary/40 to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
