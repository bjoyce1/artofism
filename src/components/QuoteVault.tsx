import { useState, useRef } from 'react';
import { useFavorites } from '@/hooks/useReadingProgress';
import { Heart, Copy, Check, Share2 } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const quotes = [
  { text: "If you don't define your mindset, the world will define it for you.", source: "Introduction" },
  { text: "P was never just a letter. It was a ladder.", source: "Chapter 1" },
  { text: "Confidence doesn't perform. It exists.", source: "Chapter 3" },
  { text: "Money reveals people.", source: "Chapter 9" },
  { text: "CAPISM isn't something you say. It's something you live.", source: "Chapter 11" },
];

const QuoteVault = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const shareText = async (text: string) => {
    if (navigator.share) {
      await navigator.share({ text: `"${text}" — The Art of ISM` });
    } else {
      copyText(text);
    }
  };

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

        {/* Mobile: horizontal swipeable */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 sm:hidden scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {quotes.map((quote, i) => (
            <div
              key={i}
              className="snap-center shrink-0 w-[85vw] relative group p-8 bg-card border border-border rounded-sm"
            >
              <span className="absolute top-3 left-4 font-display text-5xl text-primary/20 leading-none select-none">"</span>
              <p className="font-display text-lg leading-relaxed text-foreground/90 mb-4 pt-6">
                "{quote.text}"
              </p>
              <div className="flex items-center justify-between">
                <span className="font-ui text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {quote.source}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => toggleFavorite(quote.text)} className="p-1">
                    <Heart size={16} className={isFavorite(quote.text) ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'} />
                  </button>
                  <button onClick={() => copyText(quote.text)} className="p-1">
                    {copiedText === quote.text ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-muted-foreground hover:text-primary" />}
                  </button>
                  <button onClick={() => shareText(quote.text)} className="p-1">
                    <Share2 size={16} className="text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: masonry grid */}
        <div className="hidden sm:block columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {quotes.map((quote, i) => (
            <AnimatedSection key={i} delay={i * 60}>
              <div className="break-inside-avoid relative group p-8 bg-card border border-border rounded-sm hover:border-primary/30 transition-all duration-500">
                <span className="absolute top-3 left-4 font-display text-5xl text-primary/20 leading-none select-none">"</span>
                <p className="font-display text-lg leading-relaxed text-foreground/90 mb-4 pt-6">
                  "{quote.text}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-ui text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {quote.source}
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleFavorite(quote.text)} className="p-1 transition-colors duration-300">
                      <Heart size={16} className={isFavorite(quote.text) ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'} />
                    </button>
                    <button onClick={() => copyText(quote.text)} className="p-1 transition-colors duration-300">
                      {copiedText === quote.text ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-muted-foreground hover:text-primary" />}
                    </button>
                    <button onClick={() => shareText(quote.text)} className="p-1 transition-colors duration-300">
                      <Share2 size={16} className="text-muted-foreground hover:text-primary" />
                    </button>
                  </div>
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
