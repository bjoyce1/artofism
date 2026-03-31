import { standoutQuotes } from '@/data/bookContent';
import { useFavorites } from '@/hooks/useReadingProgress';
import { Heart } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const QuoteVault = () => {
  const { toggleFavorite, isFavorite } = useFavorites();

  return (
    <section id="quotes" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-smoke/30 to-deep-black pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <AnimatedSection>
          <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-4 text-center">Words That Remain</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground text-center mb-16">
            Quote <span className="text-gold-gradient">Vault</span>
          </h2>
        </AnimatedSection>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {standoutQuotes.map((quote, i) => (
            <AnimatedSection key={i} delay={i * 60}>
              <div className="break-inside-avoid relative group p-8 bg-card border border-border rounded-sm hover:border-primary/30 transition-all duration-500">
                {/* Decorative quote mark */}
                <span className="absolute top-3 left-4 font-display text-5xl text-primary/20 leading-none select-none">"</span>

                <p className="font-display text-lg leading-relaxed text-foreground/90 mb-4 pt-6">
                  "{quote.text}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-ui text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {quote.source}
                  </span>
                  <button
                    onClick={() => toggleFavorite(quote.text)}
                    className="p-1 transition-colors duration-300"
                  >
                    <Heart
                      size={16}
                      className={isFavorite(quote.text) ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}
                    />
                  </button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuoteVault;
