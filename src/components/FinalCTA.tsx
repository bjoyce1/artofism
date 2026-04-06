import { Link } from 'react-router-dom';
import AnimatedSection from './AnimatedSection';
import { trackEvent } from '@/lib/analytics';

const FinalCTA = () => {
  return (
    <section className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-smoke to-deep-black pointer-events-none" />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, hsl(43 76% 52% / 0.15), transparent 60%)',
        }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <AnimatedSection>
          <p className="font-display text-xl sm:text-2xl md:text-3xl text-foreground/90 mb-2 leading-relaxed">
            This is not something you read once.
          </p>
          <p className="font-display text-xl sm:text-2xl md:text-3xl text-primary font-semibold mb-10 leading-relaxed">
            This is something you live.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center font-ui mb-12">
            <Link
              to="/unlock"
              className="gold-dust px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.2em] rounded-full hover:brightness-110 hover:shadow-[0_0_30px_hsl(43_76%_52%/0.4)] transition-all duration-300"
            >
              Get Full Access — $9.99
            </Link>
            <a
              href="#introduction"
              className="gold-dust px-8 py-3 border border-primary/40 text-primary text-sm uppercase tracking-[0.2em] rounded-full hover:bg-primary/10 transition-all duration-300"
            >
              Read the Free Preview
            </a>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={400}>
          <p className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-gold-gradient gold-shimmer">
            It's all ISM.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FinalCTA;
