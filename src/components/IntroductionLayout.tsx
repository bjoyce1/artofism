import AnimatedSection from './AnimatedSection';
import { introduction } from '@/data/bookContent';

const IntroductionLayout = () => {
  return (
    <section id="introduction" className="relative py-32 px-6">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-smoke/50 to-deep-black pointer-events-none" />

      <div className="relative max-w-3xl mx-auto">
        <AnimatedSection>
          <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-4">Introduction</p>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-16">
            Enter the <span className="text-gold-gradient">ISM</span>
          </h2>
        </AnimatedSection>

        {/* Pull quote */}
        <AnimatedSection delay={200}>
          <blockquote className="border-l-2 border-primary pl-8 my-16">
            <p className="font-display text-2xl sm:text-3xl italic text-primary leading-relaxed">
              "If you don't define your mindset, the world will define it for you."
            </p>
          </blockquote>
        </AnimatedSection>

        {/* Body text with drop cap */}
        <div className="space-y-6">
          {introduction.paragraphs.map((p, i) => (
            <AnimatedSection key={i} delay={100 + i * 50}>
              <p
                className={`text-lg leading-[1.9] text-foreground/90 ${
                  i === 0 ? 'drop-cap' : ''
                } ${
                  ['International State of Mind.', 'Limitless thought.', 'Limitless ability.', 'Why do I think the way I think?'].includes(p)
                    ? 'font-display text-2xl text-primary font-semibold text-center my-8'
                    : ''
                } ${
                  p === "It's all ISM."
                    ? 'font-display text-3xl text-gold-gradient font-bold text-center mt-16'
                    : ''
                }`}
              >
                {p}
              </p>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntroductionLayout;
