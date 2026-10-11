import { useState } from 'react';
import { useFavorites } from '@/hooks/useReadingProgress';
import { Heart, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedSection from './AnimatedSection';

const quotes = [
  { text: "If you don't define your mindset, the world will define it for you.", source: 'Introduction' },
  { text: 'P was never just a letter. It was a ladder.', source: 'Chapter 1' },
  { text: "Confidence doesn't perform. It exists.", source: 'Chapter 3' },
  { text: 'Money reveals people.', source: 'Chapter 9' },
  { text: "CAPISM isn't something you say. It's something you live.", source: 'Chapter 11' },
];

const QuoteVault = () => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };
  const shareText = async (text: string) => {
    if (navigator.share) await navigator.share({ text: `"${text}" — The Art of ISM` });
    else await copyText(text);
  };

  return (
    <section id="quotes" className="relative py-16 md:py-24 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-smoke/30 to-deep-black pointer-events-none" />
      <div className="relative max-w-6xl mx-auto">
        <AnimatedSection>
          <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-4 text-center">Words That Remain</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground text-center mb-10">Quote <span className="text-gold-gradient">Vault</span></h2>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {quotes.map((quote, index) => (
            <AnimatedSection key={quote.text} delay={index * 60} className={index === 0 ? 'md:col-span-2' : ''}>
              <article className={`relative p-5 md:p-8 bg-card border rounded-sm h-full flex flex-col ${index === 0 ? 'border-primary/30' : 'border-border'}`}>
                <blockquote className={`font-display leading-relaxed text-foreground/90 mb-5 flex-1 ${index === 0 ? 'text-2xl md:text-4xl italic md:max-w-4xl md:mx-auto md:text-center' : 'text-lg'}`}>
                  "{quote.text}"
                </blockquote>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-ui text-xs text-muted-foreground">{quote.source}</span>
                  <div className="flex items-center">
                    <Button variant="ghost" size="icon" className="h-11 w-11" aria-label={isFavorite(quote.text) ? 'Unfavorite quote' : 'Favorite quote'} aria-pressed={isFavorite(quote.text)} title="Favorite quote" onClick={() => toggleFavorite(quote.text)}>
                      <Heart className={isFavorite(quote.text) ? 'fill-primary text-primary' : 'text-muted-foreground'} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Copy quote" title={copiedText === quote.text ? 'Copied' : 'Copy quote'} onClick={() => copyText(quote.text)}>
                      {copiedText === quote.text ? <Check className="text-primary" /> : <Copy className="text-muted-foreground" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Share quote" title="Share quote" onClick={() => shareText(quote.text)}><Share2 className="text-muted-foreground" /></Button>
                  </div>
                </div>
              </article>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuoteVault;
