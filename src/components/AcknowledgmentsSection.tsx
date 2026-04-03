import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';

/* ─── Data ─── */
const MENTORS = [
  'Mac Drew', 'Robert T', 'Success', 'International Lace', 'Love',
  'Avalanche', 'Quick', 'Sin', 'Professor', 'Candy Man',
];
const BIG_RIP = { name: 'Big RIP', sub: 'Real Independent Pimpin' };

const LEGACY = [
  'One 4 Da Money', 'Ivory P', 'Dre', 'Crow',
];

const CIRCLE = [
  'Young Lace', 'Young Candy', 'Finesse', 'Cash', 'Dallas D', 'No Play', 'Wash',
];

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
    const count = 40;
    const speed = slow ? 0.15 : 0.3;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: 40 + Math.random() * 80,
        vx: (Math.random() - 0.5) * speed,
        vy: -Math.random() * speed * 0.5,
        a: Math.random() * 0.06,
        da: (Math.random() - 0.5) * 0.0003,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.da;
        if (p.a < 0) p.da = Math.abs(p.da);
        if (p.a > 0.07) p.da = -Math.abs(p.da);
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

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [slow]);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
};

/* ─── Ember sparks on hover ─── */
const EmberBurst = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary"
          initial={{
            x: `${30 + Math.random() * 40}%`,
            y: `${60 + Math.random() * 30}%`,
            opacity: 1,
            scale: 1,
          }}
          animate={{
            y: `${-10 - Math.random() * 30}%`,
            x: `${20 + Math.random() * 60}%`,
            opacity: 0,
            scale: 0.3,
          }}
          transition={{ duration: 1.2 + Math.random() * 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};

/* ─── Honor Card ─── */
interface HonorCardProps {
  name: string;
  sub?: string;
  memorial?: boolean;
  prominent?: boolean;
  index: number;
}

const HonorCard = ({ name, sub, memorial, prominent, index }: HonorCardProps) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
      transition={{ duration: 0.7, delay: index * 0.08, ease: 'easeOut' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative group cursor-default overflow-hidden rounded-xl border transition-all duration-500
        ${prominent
          ? 'border-primary/50 bg-gradient-to-br from-card/90 to-card/70 shadow-lg shadow-primary/10'
          : memorial
            ? 'border-primary/15 bg-card/60 shadow-md shadow-black/30'
            : 'border-primary/20 bg-card/70 shadow-md shadow-black/20'
        }
        hover:shadow-xl hover:-translate-y-1
        ${memorial ? 'hover:shadow-primary/8 hover:border-primary/25' : 'hover:shadow-primary/15 hover:border-primary/40'}
      `}
    >
      {/* Gold shimmer sweep */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent
        transition-transform duration-700 ease-out
        ${hovered ? 'translate-x-0' : '-translate-x-full'}
      `} />

      {/* Red edge glow on hover */}
      <div className={`
        absolute inset-0 rounded-xl transition-opacity duration-500
        ${hovered ? 'opacity-100' : 'opacity-0'}
        shadow-[inset_0_0_20px_rgba(122,0,12,0.15)]
      `} />

      <EmberBurst active={hovered} />

      <div className={`relative z-10 ${prominent ? 'px-6 py-5' : 'px-5 py-4'}`}>
        <p className={`
          font-display tracking-wide
          ${prominent ? 'text-lg text-primary' : 'text-base text-foreground'}
        `}>
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

      {/* Candlelight glow for memorial */}
      {memorial && (
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-primary/20"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
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
        <h3 className="text-sm uppercase tracking-[0.2em] font-ui text-primary/80 whitespace-nowrap">
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>
      <div className={`grid ${columns} gap-3 sm:gap-4`}>
        {children}
      </div>
    </motion.div>
  );
};

/* ─── Main Section ─── */
const AcknowledgmentsSection = () => {
  const introRef = useRef(null);
  const introInView = useInView(introRef, { once: true, margin: '-80px' });
  const quoteRef = useRef(null);
  const quoteInView = useInView(quoteRef, { once: true, margin: '-60px' });
  const finalRef = useRef(null);
  const finalInView = useInView(finalRef, { once: true, margin: '-60px' });
  const closingRef = useRef(null);
  const closingInView = useInView(closingRef, { once: true, margin: '-40px' });

  return (
    <section id="acknowledgments" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-[#0a0204] to-deep-black" />
      <SmokeCanvas />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(5,5,5,0.85) 100%)',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8">

        {/* ── 1. INTRO ── */}
        <motion.div
          ref={introRef}
          initial={{ opacity: 0, y: 30 }}
          animate={introInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: 'easeOut' }}
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
            {/* Oversized quotation marks */}
            <span className="absolute top-3 left-5 text-[6rem] sm:text-[8rem] font-display text-primary/[0.06] leading-none select-none pointer-events-none">"</span>
            <span className="absolute bottom-0 right-5 text-[6rem] sm:text-[8rem] font-display text-primary/[0.06] leading-none select-none pointer-events-none rotate-180">"</span>

            {/* Red smoke behind card */}
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
            <HonorCard key={name} name={name} index={i} />
          ))}
          <HonorCard
            name={BIG_RIP.name}
            sub={BIG_RIP.sub}
            prominent
            index={MENTORS.length}
          />
        </GroupSection>

        {/* Group 2: Legacy – slightly darker zone */}
        <div className="relative">
          <div className="absolute inset-0 -mx-5 sm:-mx-8 bg-gradient-to-b from-transparent via-black/40 to-transparent pointer-events-none" />
          <SmokeCanvas slow />
          <div className="relative z-10">
            <GroupSection title="Legacy and In Memory" columns="grid-cols-1 sm:grid-cols-2">
              {LEGACY.map((name, i) => (
                <HonorCard key={name} name={name.replace(' (R.I.P.)', '')} memorial index={i} />
              ))}
            </GroupSection>
          </div>
        </div>

        {/* Group 3: The Circle */}
        <GroupSection title="The Circle" columns="grid-cols-2 sm:grid-cols-3">
          {CIRCLE.map((name, i) => (
            <HonorCard key={name} name={name} index={i} />
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
          <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-xl p-8 sm:p-12 text-center">
            {/* Spotlight from above */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

            {/* Smoke swirl */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-primary/8 rounded-full blur-2xl" />
            </div>

            <p className="relative z-10 text-xs uppercase tracking-[0.2em] font-ui text-primary/60 mb-3">And to Me</p>
            <h3 className="relative z-10 text-2xl sm:text-3xl font-display text-primary tracking-wide mb-2">
              Mr. CAP International
            </h3>
            <p className="relative z-10 text-xs sm:text-sm uppercase tracking-[0.15em] font-ui text-muted-foreground/80">
              CAPISM — Cold Ass Pimp International State-of-Mind
            </p>

            {/* Gold embossed border glow */}
            <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_0_30px_rgba(212,175,55,0.08)]" />
          </div>
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
    </section>
  );
};

export default AcknowledgmentsSection;
