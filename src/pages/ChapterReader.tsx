import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { chapters } from '@/data/bookContent';
import { useReadingProgress, useFavorites } from '@/hooks/useReadingProgress';
import AnimatedSection from '@/components/AnimatedSection';
import FloatingNav from '@/components/FloatingNav';
import { Heart, ChevronLeft, ChevronRight, Copy, Check, Eye, BookOpen } from 'lucide-react';

const ChapterReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chapterNum = parseInt(id || '1', 10);
  const chapter = chapters.find(c => c.number === chapterNum);
  const { saveProgress, readingMode, toggleMode } = useReadingProgress();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (chapter) {
      saveProgress(chapter.number);
      window.scrollTo(0, 0);
    }
  }, [chapter, saveProgress]);

  if (!chapter) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <p className="text-muted-foreground">Chapter not found.</p>
      </div>
    );
  }

  const prev = chapters.find(c => c.number === chapterNum - 1);
  const next = chapters.find(c => c.number === chapterNum + 1);
  const isExperience = readingMode === 'experience';

  const copyPrinciple = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-deep-black">
      <FloatingNav />

      {/* Smoke overlay for experience mode */}
      {isExperience && (
        <>
          <div
            className="fixed inset-0 pointer-events-none z-[1] smoke-drift opacity-10"
            style={{
              background: 'radial-gradient(ellipse at 20% 50%, hsl(355 100% 24% / 0.3), transparent 70%)',
            }}
          />
          <div
            className="fixed inset-0 pointer-events-none z-[1] smoke-drift-reverse opacity-10"
            style={{
              background: 'radial-gradient(ellipse at 80% 70%, hsl(355 85% 39% / 0.2), transparent 60%)',
            }}
          />
        </>
      )}

      {/* Reading mode toggle */}
      <div className="fixed bottom-6 right-6 z-50 font-ui">
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-sm text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300"
        >
          {isExperience ? <Eye size={14} /> : <BookOpen size={14} />}
          {isExperience ? 'Experience' : 'Read'} Mode
        </button>
      </div>

      <article className="relative z-10 pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Chapter number watermark */}
          {isExperience && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 font-display text-[12rem] sm:text-[16rem] font-bold text-foreground/[0.02] leading-none select-none pointer-events-none">
              {String(chapter.number).padStart(2, '0')}
            </div>
          )}

          {/* Header */}
          <AnimatedSection>
            <Link
              to="/#chapters"
              className="inline-flex items-center gap-2 font-ui text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ChevronLeft size={14} /> All Chapters
            </Link>

            <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-3">
              Chapter {chapter.number}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-4">
              {chapter.title}
            </h1>
            <p className="font-body text-lg italic text-muted-foreground mb-16">
              {chapter.summary}
            </p>
          </AnimatedSection>

          {/* Body */}
          <div className="space-y-6">
            {chapter.content.map((p, i) => {
              const isPullQuote = chapter.pullQuotes.some(pq => p.includes(pq));

              if (isPullQuote && isExperience) {
                return (
                  <AnimatedSection key={i} delay={i * 30}>
                    <blockquote className="border-l-2 border-primary pl-8 my-12">
                      <p className="font-display text-2xl italic text-primary leading-relaxed">{p}</p>
                    </blockquote>
                  </AnimatedSection>
                );
              }

              return (
                <AnimatedSection key={i} delay={i * 20}>
                  <p className={`text-lg leading-[1.9] text-foreground/90 ${i === 0 ? 'drop-cap' : ''}`}>
                    {p}
                  </p>
                </AnimatedSection>
              );
            })}
          </div>

          {/* Code section */}
          <AnimatedSection delay={200}>
            <div className="mt-24 pt-16 border-t border-border">
              <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-4">{chapter.code.title}</p>
              <div className="grid gap-4 mt-8">
                {chapter.code.principles.map((principle, i) => (
                  <div
                    key={i}
                    className="group relative p-5 bg-card border border-border rounded-sm hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-base text-foreground/90 leading-relaxed">{principle}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleFavorite(principle)}
                          className="p-1 transition-colors"
                        >
                          <Heart
                            size={14}
                            className={isFavorite(principle) ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}
                          />
                        </button>
                        <button
                          onClick={() => copyPrinciple(principle, i)}
                          className="p-1 text-muted-foreground hover:text-primary transition-colors"
                        >
                          {copiedIndex === i ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="font-display text-xl text-primary italic mt-8 text-center">
                {chapter.code.closing}
              </p>
            </div>
          </AnimatedSection>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-24 pt-8 border-t border-border font-ui">
            {prev ? (
              <Link
                to={`/chapter/${prev.number}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Ch. {prev.number}:</span> {prev.title}
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                to={`/chapter/${next.number}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="hidden sm:inline">Ch. {next.number}:</span> {next.title}
                <ChevronRight size={16} />
              </Link>
            ) : (
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-primary hover:brightness-110 transition-colors"
              >
                Return Home <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default ChapterReader;
