import { Link } from 'react-router-dom';
import AnimatedSection from './AnimatedSection';

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
          <p className="font-display text-5xl sm:text-7xl md:text-8xl font-bold text-gold-gradient mb-8 gold-shimmer">
            It's all ISM.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={300}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center font-ui mt-12">
            <a
              href="#introduction"
              className="gold-dust px-8 py-3 bg-primary text-primary-foreground text-sm uppercase tracking-[0.2em] hover:brightness-110 transition-all duration-300"
            >
              Read Again
            </a>
            <Link
              to="/codes"
              className="px-8 py-3 border border-primary/40 text-primary text-sm uppercase tracking-[0.2em] hover:bg-primary/10 transition-all duration-300"
            >
              Explore the Codes
            </Link>
            <a
              href="https://mrcap1.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-muted text-muted-foreground text-sm uppercase tracking-[0.2em] hover:border-primary/40 hover:text-primary transition-all duration-300"
            >
              Visit Mr. CAP
            </a>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FinalCTA;
