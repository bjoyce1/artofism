import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';
import { trackEvent } from '@/lib/analytics';

/**
 * Compact homepage band announcing the Flip Book Edition and linking
 * to its promo page. Kept short so the homepage height budget holds.
 */
const FlipBookBand = () => (
  <section className="px-4 py-10 md:py-16" aria-labelledby="flipbook-band-heading">
    <AnimatedSection className="mx-auto flex max-w-4xl flex-col items-center gap-6 rounded-2xl border border-primary/30 bg-card/40 px-6 py-8 text-center md:flex-row md:justify-between md:text-left">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
          <BookOpen className="h-5 w-5 text-primary" aria-hidden />
        </span>
        <div>
          <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-primary">New</p>
          <h2 id="flipbook-band-heading" className="mt-1 font-display text-2xl text-foreground md:text-3xl">
            The Flip Book Edition
          </h2>
          <p className="mt-1 max-w-md font-body text-sm text-foreground/85">
            Turn every page of The Art of ISM like a real book — with sound, on any screen.
          </p>
        </div>
      </div>
      <Link
        to="/flipbook-edition"
        onClick={() => trackEvent('flipbook_band_click', { cta: 'see_flipbook_edition' })}
        className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-primary/50 px-5 font-ui text-xs uppercase tracking-[0.08em] text-primary transition-colors hover:bg-primary/10 hover:text-gold-bright"
      >
        See it in action <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </AnimatedSection>
  </section>
);

export default FlipBookBand;
