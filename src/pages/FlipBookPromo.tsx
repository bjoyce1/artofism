import { Link } from 'react-router-dom';
import { BookOpen, Volume2, MousePointer2, MonitorSmartphone, Sparkles, Lock } from 'lucide-react';
import SEO from '@/components/SEO';
import FloatingNav from '@/components/FloatingNav';
import Footer from '@/components/Footer';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';
import coverArt from '@/assets/art_of_ism_book_3.webp';
import promoVideo from '@/assets/flipbook-promo.mp4.asset.json';

const features = [
  {
    icon: BookOpen,
    title: 'A real book, on your screen',
    text: 'Front and back cover, endpapers, and every page in between — bound like the real thing.',
  },
  {
    icon: MousePointer2,
    title: 'Turn pages your way',
    text: 'Drag the corner, tap the edge, or use the arrow keys. The page curls and settles like paper.',
  },
  {
    icon: Volume2,
    title: 'Hear the page turn',
    text: 'A soft paper swish on every flip, with a mute switch when you want silence.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Made for every screen',
    text: 'A two-page spread on desktop, one page at a time on your phone.',
  },
  {
    icon: Sparkles,
    title: 'Chapter 1 is free',
    text: 'Open the cover and read the first chapter in the flip book before you spend a dollar.',
  },
  {
    icon: Lock,
    title: 'Unlock all 11 chapters',
    text: 'One payment of $9.99 opens the full book — every chapter, forever.',
  },
];

const FlipBookPromo = () => (
  <div className="min-h-screen bg-deep-black">
    <SEO
      title="Flip Book Edition"
      description="The Art of ISM by Mr. CAP, now as a realistic flip book. Turn every page with sound, on any screen. Chapter 1 free — full book $9.99 for life."
      path="/flipbook-edition"
      type="book"
    />
    <FloatingNav />

    <main className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-14">
          <AnimatedSection className="mx-auto w-full max-w-xs md:max-w-sm">
            <img
              src={coverArt}
              alt="The Art of ISM book cover by Mr. CAP"
              className="w-full rounded-md shadow-[0_24px_60px_-16px_hsl(var(--primary)/0.35)] ring-1 ring-primary/30"
              loading="eager"
            />
          </AnimatedSection>
          <AnimatedSection delay={80} className="text-center md:text-left">
            <p className="font-ui text-[11px] uppercase tracking-[0.2em] text-primary">New on The Art of ISM</p>
            <h1 className="mt-3 font-display text-4xl leading-tight text-foreground md:text-5xl">
              The Flip Book <span className="text-primary">Edition</span>
            </h1>
            <p className="mx-auto mt-4 max-w-md font-body text-base leading-relaxed text-foreground/85 md:mx-0 md:text-lg">
              A real book, on your screen. Open the cover, turn every page your way, and hear the paper flip.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 font-ui sm:flex-row sm:justify-center md:justify-start">
              <Button asChild size="lg" className="gold-dust rounded-full px-6 text-xs uppercase tracking-[0.08em] whitespace-nowrap hover:brightness-110 active:scale-[0.97]">
                <Link to="/flipbook" onClick={() => trackEvent('flipbook_promo_cta', { cta: 'open_flipbook' })}>
                  Open the Flip Book
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gold-dust rounded-full border-primary/50 bg-transparent px-6 text-xs uppercase tracking-[0.08em] whitespace-nowrap text-primary hover:bg-primary/10 hover:text-primary active:scale-[0.97]">
                <Link to="/unlock" onClick={() => trackEvent('flipbook_promo_cta', { cta: 'unlock_full_book' })}>
                  Unlock Full Book — $9.99
                </Link>
              </Button>
            </div>
            <p className="mt-4 font-ui text-xs text-muted-foreground">Chapter 1 is free. No account needed to look.</p>
          </AnimatedSection>
        </div>
      </section>

      {/* Ad video */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection className="text-center">
            <h2 className="font-display text-3xl text-foreground md:text-4xl">Watch it <span className="text-primary">turn</span></h2>
            <p className="mx-auto mt-3 max-w-xl font-body text-base text-foreground/85">
              Twenty-five seconds of the Flip Book Edition — the cover, the pages, the sound.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={80} className="mt-8">
            <div className="overflow-hidden rounded-xl ring-1 ring-primary/30 shadow-[0_24px_60px_-16px_hsl(var(--primary)/0.3)]">
              <video
                src={promoVideo.url}
                poster={coverArt}
                controls
                playsInline
                preload="none"
                className="aspect-video w-full bg-black"
              />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <AnimatedSection className="text-center">
            <h2 className="font-display text-3xl text-foreground md:text-4xl">Built to feel <span className="text-primary">real</span></h2>
          </AnimatedSection>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <AnimatedSection key={f.title} delay={i * 40}>
                <div className="h-full rounded-xl border border-primary/20 bg-card/40 p-6">
                  <f.icon className="h-5 w-5 text-primary" aria-hidden />
                  <h3 className="mt-3 font-display text-lg text-foreground">{f.title}</h3>
                  <p className="mt-2 font-body text-sm leading-relaxed text-foreground/85">{f.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Buy CTA */}
      <section className="px-4 py-16 md:py-24">
        <AnimatedSection className="mx-auto max-w-3xl rounded-2xl border border-primary/30 bg-card/40 px-6 py-12 text-center md:px-12">
          <p className="font-display text-2xl leading-snug text-foreground md:text-3xl">
            This is not something you read once.
          </p>
          <p className="mt-2 font-display text-2xl leading-snug text-primary md:text-3xl">
            This is something you live.
          </p>
          <p className="mx-auto mt-4 max-w-md font-body text-base text-foreground/85">
            All 11 chapters, the Codes, and the Quote Vault — in the flip book and the reader. One payment, lifetime access.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 font-ui sm:flex-row">
            <Button asChild size="lg" className="gold-dust rounded-full px-6 text-xs uppercase tracking-[0.08em] whitespace-nowrap hover:brightness-110 active:scale-[0.97]">
              <Link to="/unlock" onClick={() => trackEvent('flipbook_promo_cta', { cta: 'buy_lifetime' })}>
                Get Lifetime Access — $9.99
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full border-primary/50 bg-transparent px-6 text-xs uppercase tracking-[0.08em] whitespace-nowrap text-primary hover:bg-primary/10 hover:text-primary active:scale-[0.97]">
              <Link to="/chapter/1" onClick={() => trackEvent('flipbook_promo_cta', { cta: 'read_chapter_1_free' })}>
                Read Chapter 1 Free
              </Link>
            </Button>
          </div>
        </AnimatedSection>
      </section>
    </main>

    <Footer />
  </div>
);

export default FlipBookPromo;
