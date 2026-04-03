import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';

/* ─── Data ─── */
const MENTORS = [
  'Mac Drew', 'Robert T', 'Success', 'International Lace', 'Love',
  'Avalanche', 'Quick', 'Sin', 'Professor', 'Candy Man', 'RIP',
];

const LEGACY = [
  'One 4 Da Money', 'Ivory P', 'Dre', 'Crow',
];

const CIRCLE = [
  'Young Lace', 'Young Candy', 'Finesse', 'Cash', 'Dallas D', 'No Play', 'Wash',
];

/* ─── Touch detection ─── */
const isTouchDevice = () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

/* ─── Smoke Canvas ─── */
interface Particle { x: number; y: number; r: number; vx: number; vy: number; a: number; da: number; }

const SmokeCanvas = ({ slow = false }: { slow?: boolean }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];
    const count = 35;
    const speed = slow ? 0.1 : 0.25;

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 50 + Math.random() * 100,
        vx: (Math.random() - 0.5) * speed,
        vy: -Math.random() * speed * 0.4,
        a: Math.random() * 0.05,
        da: (Math.random() - 0.5) * 0.0002,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.a += p.da;
        if (p.a < 0) p.da = Math.abs(p.da);
        if (p.a > 0.06) p.da = -Math.abs(p.da);
        if (p.y < -p.r) p.y = canvas.height + p.r;
        if (p.x < -p.r) p.x = canvas.width + p.r;
        if (p.x > canvas.width + p.r) p.x = -p.r;

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(122, 0, 12, ${p.a})`);
        g.addColorStop(1, 'rgba(122, 0, 12, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, [slow]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

/* ─── Ambient Ember Canvas ─── */
const EmberCanvas = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    interface Ember { x: number; y: number; vy: number; vx: number; life: number; maxLife: number; size: number; }
    const embers: Ember[] = [];

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const spawn = () => {
      if (embers.length < 20) {
        embers.push({
          x: Math.random() * canvas.width,
          y: canvas.height * (0.3 + Math.random() * 0.7),
          vy: -(0.2 + Math.random() * 0.4),
          vx: (Math.random() - 0.5) * 0.3,
          life: 0,
          maxLife: 120 + Math.random() * 100,
          size: 1 + Math.random() * 1.5,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < 0.08) spawn();

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.x += e.vx; e.y += e.vy; e.life++;
        const progress = e.life / e.maxLife;
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;

        ctx.fillStyle = `rgba(212, 175, 55, ${alpha * 0.6})`;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (e.life >= e.maxLife) embers.splice(i, 1);
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

/* ─── Random shimmer system ─── */
const useRandomShimmer = (cardCount: number, memorial = false) => {
  const [shimmerIndex, setShimmerIndex] = useState(-1);

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerIndex(Math.floor(Math.random() * cardCount));
      setTimeout(() => setShimmerIndex(-1), 800);
    }, memorial ? 6000 + Math.random() * 3000 : 3000 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [cardCount, memorial]);

  return shimmerIndex;
};

/* ─── Honor Card ─── */
interface HonorCardProps {
  name: string;
  sub?: string;
  memorial?: boolean;
  prominent?: boolean;
  index: number;
  shimmerActive?: boolean;
}

const HonorCard = ({ name, sub, memorial, prominent, index, shimmerActive }: HonorCardProps) => {
  const [active, setActive] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const isTouch = useMemo(isTouchDevice, []);

  const handleInteraction = () => {
    if (!isTouch) return;
    setActive(true);
    setTimeout(() => setActive(false), 600);
  };

  const hovered = isTouch ? active : undefined;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: memorial ? 1 : 0.7, delay: index * 0.08, ease: 'easeOut' }}
      onTouchStart={handleInteraction}
      whileHover={isTouch ? undefined : {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.3 },
      }}
      whileTap={isTouch ? { scale: 1.03 } : undefined}
      className={`
        relative group cursor-default overflow-hidden rounded-xl border transition-all duration-500
        ${prominent
          ? 'border-primary/50 bg-gradient-to-br from-card/90 to-card/70 shadow-lg shadow-primary/10'
          : memorial
            ? 'border-primary/15 bg-card/60 shadow-md shadow-black/30'
            : 'border-primary/20 bg-card/70 shadow-md shadow-black/20'
        }
        ${!isTouch ? 'hover:shadow-xl hover:shadow-[0_8px_30px_rgba(122,0,12,0.15)]' : ''}
        ${!isTouch && !memorial ? 'hover:border-primary/40' : ''}
        ${!isTouch && memorial ? 'hover:border-primary/25' : ''}
        ${active ? 'shadow-xl shadow-primary/20 border-primary/40' : ''}
      `}
    >
      {/* Gold shimmer sweep — hover OR random */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/12 to-transparent pointer-events-none"
        initial={{ x: '-100%' }}
        animate={(shimmerActive || (hovered !== undefined ? hovered : false))
          ? { x: ['−100%', '200%'] }
          : { x: '-100%' }
        }
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* CSS shimmer for non-touch hover */}
      {!isTouch && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-[200%] transition-transform duration-700 ease-out pointer-events-none" />
      )}

      {/* Red edge glow on hover */}
      <div className={`
        absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none
        ${active ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100
      `}
        style={{ boxShadow: 'inset 0 0 20px rgba(122,0,12,0.15)' }}
      />

      <div className={`relative z-10 ${prominent ? 'px-6 py-5' : 'px-5 py-4'}`}>
        <p className={`font-display tracking-wide ${prominent ? 'text-lg text-primary' : 'text-base text-foreground'}`}>
          {name}
        </p>
        {sub && (
          <p className="text-xs text-primary/70 font-ui tracking-widest uppercase mt-1">{sub}</p>
        )}
        {memorial && (
          <span className="inline-block mt-2 text-[10px] uppercase tracking-[0.15em] text-primary/50 border border-primary/15 rounded-full px-2.5 py-0.5 font-ui">
            In Memory
          </span>
        )}
      </div>

      {/* Candlelight flicker for memorial */}
      {memorial && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)' }}
          animate={{ opacity: [0.2, 0.5, 0.3, 0.6, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
};

/* ─── Group Section ─── */
interface GroupProps {
  title: string;
  children: React.ReactNode;
  columns?: string;
}

const GroupSection = ({ title, children, columns = 'grid-cols-1 sm:grid-cols-2' }: GroupProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="mb-16 sm:mb-20"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <h3 className="text-sm uppercase tracking-[0.2em] font-ui text-primary/80 whitespace-nowrap">{title}</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
      <div className={`grid ${columns} gap-3 sm:gap-4`}>{children}</div>
    </motion.div>
  );
};

/* ─── Scroll Progress Bar ─── */
const ScrollProgress = ({ containerRef }: { containerRef: React.RefObject<HTMLElement> }) => {
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="sticky top-0 left-0 right-0 z-50 h-0.5">
      <motion.div className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60" style={{ width }} />
      <motion.div className="h-px bg-primary/30 blur-sm" style={{ width }} />
    </div>
  );
};

/* ─── Main Section ─── */
const AcknowledgmentsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const introRef = useRef(null);
  const introInView = useInView(introRef, { once: true, margin: '-80px' });
  const quoteRef = useRef(null);
  const quoteInView = useInView(quoteRef, { once: true, margin: '-60px' });
  const finalRef = useRef(null);
  const finalInView = useInView(finalRef, { once: true, margin: '-60px' });
  const closingRef = useRef(null);
  const closingInView = useInView(closingRef, { once: true, margin: '-40px' });

  // "Enter the hall" effect
  const sectionInView = useInView(sectionRef, { margin: '-20%', once: false });

  // Random shimmer per group
  const mentorShimmer = useRandomShimmer(MENTORS.length + 1);
  const legacyShimmer = useRandomShimmer(LEGACY.length, true);
  const circleShimmer = useRandomShimmer(CIRCLE.length);

  // Parallax for final card
  const { scrollYProgress: finalScroll } = useScroll({ target: finalRef, offset: ['start end', 'end start'] });
  const finalY = useTransform(finalScroll, [0, 1], [30, -20]);

  return (
    <section ref={sectionRef} id="acknowledgments" className="relative overflow-hidden">
      {/* "Enter the hall" dim overlay */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none z-[1]"
        animate={{ opacity: sectionInView ? 0.3 : 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />

      {/* Scroll progress */}
      <div className="relative z-50">
        <ScrollProgress containerRef={sectionRef as React.RefObject<HTMLElement>} />
      </div>

      <div className="relative py-20 sm:py-32">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-[#080103] to-deep-black" />
        <SmokeCanvas />
        <EmberCanvas />

        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 25%, rgba(5,5,5,0.9) 100%)' }}
        />

        <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8">

          {/* ── 1. INTRO ── */}
          <motion.div
            ref={introRef}
            initial={{ opacity: 0, y: 30 }}
            animate={introInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
            className="text-center mb-16 sm:mb-20"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-display text-foreground mb-4 tracking-tight">
              Acknowledgments
            </h2>
            <p className="text-lg sm:text-xl font-display text-primary/80 italic mb-6">
              No journey is built alone.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground/90 font-body leading-relaxed max-w-2xl mx-auto">
              Everything in this world of ISM was shaped by movement, experience, pressure, perspective, and people. This section honors those who were part of the journey—those who gave game, showed love, stood solid, and left their mark on the path.
            </p>

            {/* Gold divider */}
            <div className="mt-10 mx-auto w-48 h-px relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />
            </div>
          </motion.div>

          {/* ── 2. FEATURED QUOTE ── */}
          <motion.div
            ref={quoteRef}
            initial={{ opacity: 0, y: 20 }}
            animate={quoteInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            className="mb-20 sm:mb-24"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative mx-auto max-w-lg bg-card/60 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 sm:p-10 text-center overflow-hidden"
            >
              <span className="absolute top-3 left-5 text-[6rem] sm:text-[8rem] font-display text-primary/[0.06] leading-none select-none pointer-events-none">"</span>
              <span className="absolute bottom-0 right-5 text-[6rem] sm:text-[8rem] font-display text-primary/[0.06] leading-none select-none pointer-events-none rotate-180">"</span>

              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
              </div>

              <p className="relative z-10 text-base sm:text-lg font-display italic text-foreground/90 leading-relaxed">
                "Respect to everyone who played a part in the journey. It's all ISM."
              </p>
            </motion.div>
          </motion.div>

          {/* ── 3. HALL OF GAME ── */}

          {/* Group 1: Mentors */}
          <GroupSection title="Mentors, Influence, and Foundation">
            {MENTORS.map((name, i) => (
              <HonorCard key={name} name={name} index={i} shimmerActive={mentorShimmer === i} />
            ))}
            <HonorCard
              name={BIG_RIP.name}
              sub={BIG_RIP.sub}
              prominent
              index={MENTORS.length}
              shimmerActive={mentorShimmer === MENTORS.length}
            />
          </GroupSection>

          {/* Group 2: Legacy – darker, slower, more reverent */}
          <div className="relative">
            <div className="absolute inset-0 -mx-5 sm:-mx-8 bg-gradient-to-b from-black/30 via-black/50 to-black/30 pointer-events-none" />
            <SmokeCanvas slow />
            <div className="relative z-10">
              <GroupSection title="Legacy and In Memory" columns="grid-cols-1 sm:grid-cols-2">
                {LEGACY.map((name, i) => (
                  <HonorCard
                    key={name}
                    name={name.replace(' (R.I.P.)', '')}
                    memorial
                    index={i}
                    shimmerActive={legacyShimmer === i}
                  />
                ))}
              </GroupSection>
            </div>
          </div>

          {/* Group 3: The Circle */}
          <GroupSection title="The Circle" columns="grid-cols-2 sm:grid-cols-3">
            {CIRCLE.map((name, i) => (
              <HonorCard key={name} name={name} index={i} shimmerActive={circleShimmer === i} />
            ))}
          </GroupSection>

          {/* ── 4. FINAL HONOR CARD ── */}
          <motion.div
            ref={finalRef}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={finalInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="mb-20 sm:mb-24"
          >
            <motion.div style={{ y: finalY }}>
              <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-xl p-8 sm:p-12 text-center">
                {/* Spotlight cone from above */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at top center, rgba(212,175,55,0.08), transparent 70%)' }}
                />

                {/* Halo glow behind text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 bg-primary/6 rounded-full blur-3xl pointer-events-none" />

                {/* Smoke swirl */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                  <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-primary/8 rounded-full blur-2xl" />
                </div>

                <p className="relative z-10 text-xs uppercase tracking-[0.2em] font-ui text-primary/60 mb-3">And to Me</p>
                <motion.h3
                  className="relative z-10 text-2xl sm:text-3xl font-display text-primary tracking-wide mb-2"
                  animate={{ textShadow: ['0 0 20px rgba(212,175,55,0.1)', '0 0 30px rgba(212,175,55,0.2)', '0 0 20px rgba(212,175,55,0.1)'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Mr. CAP International
                </motion.h3>
                <p className="relative z-10 text-xs sm:text-sm uppercase tracking-[0.15em] font-ui text-muted-foreground/80">
                  CAPISM — Cold Ass Pimp International State-of-Mind
                </p>

                {/* Gold embossed border glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 30px rgba(212,175,55,0.08)' }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
            </motion.div>
          </motion.div>

          {/* ── 5. CLOSING ── */}
          <motion.p
            ref={closingRef}
            initial={{ opacity: 0 }}
            animate={closingInView ? { opacity: 1 } : {}}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="text-center text-lg sm:text-xl font-display italic text-primary/70 tracking-wide pb-8"
          >
            It's all ISM.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default AcknowledgmentsSection;
