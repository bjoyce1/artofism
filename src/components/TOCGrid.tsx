import { Link } from 'react-router-dom';
import { Volume2, Clock, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AnimatedSection from './AnimatedSection';
import { chapters } from '@/data/bookContent';
import { chapterReadingMinutes } from '@/lib/bookStats';
import { useReadingProgress } from '@/hooks/useReadingProgress';

// Progress at which a chapter counts as read.
const COMPLETE_THRESHOLD = 95;

const TOCGrid = () => {
  const { hasAccess } = useAuth();
  const { chapterProgress, lastChapter } = useReadingProgress();

  const continueChapter =
    lastChapter > 0 &&
    (chapterProgress[lastChapter.toString()] ?? 0) < COMPLETE_THRESHOLD
      ? chapters.find(c => c.number === lastChapter)
      : undefined;

  return (
    <section id="chapters" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-smoke to-deep-black pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <AnimatedSection>
          <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-4 text-center">The Chapters</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground text-center mb-4">
            Table of <span className="text-gold-gradient">Contents</span>
          </h2>
          <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground text-center mb-16">
            <Volume2 size={16} className="text-primary shrink-0" aria-hidden="true" />
            All 11 chapters narrated by Mr. CAP.
          </p>
        </AnimatedSection>

        {continueChapter && (
          <AnimatedSection>
            <Link
              to={`/chapter/${continueChapter.number}`}
              className="group flex items-center justify-between max-w-xl mx-auto mb-12 p-5 bg-card border border-primary/30 rounded-sm hover:border-primary/50 transition-colors"
            >
              <div>
                <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary mb-1">Continue Reading</p>
                <p className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
                  Chapter {continueChapter.number}: {continueChapter.title}
                </p>
                {(chapterProgress[continueChapter.number.toString()] ?? 0) > 0 && (
                  <p className="font-ui text-xs text-muted-foreground mt-1">
                    {chapterProgress[continueChapter.number.toString()]}% read
                  </p>
                )}
              </div>
              <ChevronRight className="text-primary shrink-0" size={20} />
            </Link>
          </AnimatedSection>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter, i) => {
            const percent = chapterProgress[chapter.number.toString()] ?? 0;
            const isComplete = percent >= COMPLETE_THRESHOLD;

            return (
              <AnimatedSection key={chapter.number} delay={i * 80}>
                <Link
                  to={`/chapter/${chapter.number}`}
                  className="gold-dust group block relative p-6 bg-card border border-border rounded-sm overflow-hidden transition-all duration-500 hover:border-primary/40 hover:shadow-[0_0_30px_hsl(355_100%_24%/0.2),inset_0_0_30px_hsl(355_100%_24%/0.05)]"
                >
                  {/* Chapter number watermark */}
                  <span className="absolute top-2 right-4 font-display text-7xl font-bold text-foreground/[0.03] leading-none select-none">
                    {String(chapter.number).padStart(2, '0')}
                  </span>

                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary">
                      Chapter {chapter.number}
                    </p>
                    {chapter.number === 1 ? (
                      <span className="font-ui text-[10px] uppercase text-primary bg-primary/10 border border-primary/30 rounded-sm px-1.5 py-0.5">Free</span>
                    ) : !hasAccess ? (
                      <Lock size={12} className="text-muted-foreground shrink-0" aria-label="Full access required" />
                    ) : null}
                    {isComplete && (
                      <span className="inline-flex items-center gap-1 font-ui text-[10px] uppercase tracking-wider text-green-500">
                        <CheckCircle2 size={12} /> Read
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {chapter.title}
                  </h3>
                  <p className="text-sm text-muted-foreground italic mb-3">
                    {chapter.summary}
                  </p>
                  <p className="inline-flex items-center gap-1.5 font-ui text-[11px] text-muted-foreground">
                    <Clock size={11} /> {chapterReadingMinutes(chapter)} min read
                  </p>

                  {/* Reading progress along the bottom edge */}
                  {percent > 0 && !isComplete && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-muted/40">
                      <div
                        className="h-full bg-primary/70 transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}

                  {/* Bottom gold line on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* Red glow edge on hover */}
                  <div className="absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ boxShadow: 'inset 0 0 20px hsl(355 100% 24% / 0.15)' }} />
                </Link>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TOCGrid;
