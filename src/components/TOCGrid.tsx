import { Link } from 'react-router-dom';
import { Volume2 } from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import { chapters } from '@/data/bookContent';

// Chapters that have audio available in storage
const audioAvailableChapters = [1, 2, 3, 4, 5, 6];

const TOCGrid = () => {
  return (
    <section id="chapters" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-smoke to-deep-black pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <AnimatedSection>
          <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-4 text-center">The Chapters</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground text-center mb-16">
            Table of <span className="text-gold-gradient">Contents</span>
          </h2>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, i) => (
            <AnimatedSection key={chapter.number} delay={i * 80}>
              <Link
                to={`/chapter/${chapter.number}`}
                className="gold-dust group block relative p-6 bg-card border border-border rounded-sm overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(355_100%_24%/0.2),inset_0_0_30px_hsl(355_100%_24%/0.05)]"
              >
                {/* Chapter number watermark */}
                <span className="absolute top-2 right-4 font-display text-7xl font-bold text-foreground/[0.03] leading-none select-none">
                  {String(chapter.number).padStart(2, '0')}
                </span>

                {/* Audio indicator */}
                {audioAvailableChapters.includes(chapter.number) && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-card/80 backdrop-blur-sm border border-border/60 rounded-full">
                    <Volume2 size={12} className="text-primary" />
                    <span className="font-ui text-[10px] uppercase tracking-wider text-muted-foreground">Audio</span>
                  </div>
                )}

                <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary mb-2">
                  Chapter {chapter.number}
                </p>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {chapter.title}
                </h3>
                <p className="text-sm text-muted-foreground italic">
                  {chapter.summary}
                </p>

                {/* Bottom gold line on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Red glow edge on hover */}
                <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 20px hsl(355 100% 24% / 0.15)' }} />
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TOCGrid;
