import AnimatedSection from './AnimatedSection';
import { aboutAuthor } from '@/data/bookContent';
import coverArt from '@/assets/art_of_ism_book_3.png';

const AboutAuthorSection = () => {
  return (
    <section id="about" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-smoke/50 to-deep-black pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <AnimatedSection>
          <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-4 text-center">The Author</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground text-center mb-16">
            About <span className="text-gold-gradient">Mr. CAP</span>
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <AnimatedSection delay={200}>
            <div className="relative">
              <img
                src={coverArt}
                alt="Mr. CAP"
                className="w-full max-w-md mx-auto rounded-sm"
                style={{
                  boxShadow: '0 0 60px hsl(355 100% 24% / 0.2), 0 20px 60px hsl(0 0% 0% / 0.5)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          </AnimatedSection>

          <div className="space-y-6">
            <AnimatedSection delay={300}>
              <p className="text-lg leading-[1.9] text-foreground/90">{aboutAuthor.bio}</p>
            </AnimatedSection>
            <AnimatedSection delay={400}>
              <p className="text-lg leading-[1.9] text-foreground/90">{aboutAuthor.extended}</p>
            </AnimatedSection>
            <AnimatedSection delay={500}>
              <p className="text-lg leading-[1.9] text-foreground/90">{aboutAuthor.lineage}</p>
            </AnimatedSection>
            <AnimatedSection delay={600}>
              <p className="text-lg leading-[1.9] text-foreground/90">{aboutAuthor.bookDescription}</p>
            </AnimatedSection>
            <AnimatedSection delay={700}>
              <p className="text-base text-muted-foreground">{aboutAuthor.location}</p>
            </AnimatedSection>
            <AnimatedSection delay={800}>
              <div className="flex gap-4 mt-8 font-ui">
                <a
                  href={aboutAuthor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 border border-primary/40 text-primary text-sm uppercase tracking-[0.2em] hover:bg-primary/10 transition-all duration-300"
                >
                  mrcap1.com
                </a>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={900}>
              <p className="font-display text-2xl text-gold-gradient font-bold mt-8">
                {aboutAuthor.closing}
              </p>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutAuthorSection;
