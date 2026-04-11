import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { chapters } from '@/data/bookContent';
import { useReadingProgress, useFavorites } from '@/hooks/useReadingProgress';
import AnimatedSection from '@/components/AnimatedSection';
import FloatingNav from '@/components/FloatingNav';
import SectionAudioButton from '@/components/SectionAudioButton';
import { Heart, ChevronLeft, ChevronRight, Copy, Check, Eye, BookOpen } from 'lucide-react';
import ChapterAudioPlayer from '@/components/ChapterAudioPlayer';

const ChapterReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chapterNum = parseInt(id || '1', 10);
  const chapter = chapters.find(c => c.number === chapterNum);
  const { saveProgress, readingMode, toggleMode } = useReadingProgress();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    if (chapter) {
      saveProgress(chapter.number);
      window.scrollTo(0, 0);
    }
  }, [chapter, saveProgress]);

  if (!chapter) {
    return (
      <div className="min-h-[100dvh] bg-deep-black flex items-center justify-center">
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
    <div className="min-h-[100dvh] bg-deep-black">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-primary origin-left z-[100]"
        style={{ scaleX, top: 'env(safe-area-inset-top, 0px)' }}
      />
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

      {/* Reading mode toggle — bottom safe area aware */}
      <div
        className="fixed z-50 font-ui right-4 sm:right-6 bottom-20 sm:bottom-6"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-4 py-2.5 sm:py-2 bg-card/90 backdrop-blur-lg border border-border rounded-full sm:rounded-sm text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 active:scale-95 shadow-lg shadow-black/30"
        >
          {isExperience ? <Eye size={14} /> : <BookOpen size={14} />}
          {isExperience ? 'Experience' : 'Read'}
        </button>
      </div>

      <article className="relative z-10 pt-20 sm:pt-24 pb-40 sm:pb-32 px-5 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Chapter number watermark */}
          {isExperience && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 font-display text-[8rem] sm:text-[16rem] font-bold text-foreground/[0.02] leading-none select-none pointer-events-none">
              {String(chapter.number).padStart(2, '0')}
            </div>
          )}

          {/* Header */}
          <AnimatedSection>
            <Link
              to="/#chapters"
              className="inline-flex items-center gap-2 font-ui text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary active:text-primary transition-colors mb-6 sm:mb-8 py-1"
            >
              <ChevronLeft size={14} /> All Chapters
            </Link>

            <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-3">
              Chapter {chapter.number}
            </p>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-foreground mb-3 sm:mb-4">
                {chapter.title}
              </h1>
              <SectionAudioButton
                sectionId={`chapter-${chapter.number}`}
                fileName={`chapter_${String(chapter.number).padStart(2, '0')}.mp3`}
                className="-mt-2"
              />
            </div>
            <p className="font-body text-base sm:text-lg italic text-muted-foreground mb-12 sm:mb-16">
              {chapter.summary}
            </p>
          </AnimatedSection>

          {/* Body */}
          <div className="space-y-5 sm:space-y-6">
            {chapter.content.map((p, i) => {
              const isPullQuote = chapter.pullQuotes.some(pq => p.includes(pq));

              if (isPullQuote && isExperience) {
                return (
                  <AnimatedSection key={i} delay={i * 30}>
                    <blockquote className="border-l-2 border-primary pl-6 sm:pl-8 my-8 sm:my-12">
                      <p className="font-display text-xl sm:text-2xl italic text-primary leading-relaxed">{p}</p>
                    </blockquote>
                  </AnimatedSection>
                );
              }

              return (
                <AnimatedSection key={i} delay={i * 20}>
                  <p className={`text-base sm:text-lg leading-[1.85] sm:leading-[1.9] text-foreground/90 ${i === 0 ? 'drop-cap' : ''}`}>
                    {p}
                  </p>
                </AnimatedSection>
              );
            })}
          </div>

          {/* Code section */}
          <AnimatedSection delay={200}>
            <div className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-border">
              <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-4">{chapter.code.title}</p>
              <div className="grid gap-3 sm:gap-4 mt-6 sm:mt-8">
                {chapter.code.principles.map((principle, i) => (
                  <div
                    key={i}
                    className="group relative p-4 sm:p-5 bg-card border border-border rounded-lg sm:rounded-sm hover:border-primary/30 active:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">{principle}</p>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => toggleFavorite(principle)}
                          className="p-2 -m-1 transition-colors active:scale-90"
                        >
                          <Heart
                            size={16}
                            className={isFavorite(principle) ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}
                          />
                        </button>
                        <button
                          onClick={() => copyPrinciple(principle, i)}
                          className="p-2 -m-1 text-muted-foreground hover:text-primary active:scale-90 transition-all"
                        >
                          {copiedIndex === i ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="font-display text-lg sm:text-xl text-primary italic mt-6 sm:mt-8 text-center">
                {chapter.code.closing}
              </p>
            </div>
          </AnimatedSection>

          {/* Navigation — larger touch targets on mobile */}
          <div className="flex items-center justify-between mt-16 sm:mt-24 pt-6 sm:pt-8 border-t border-border font-ui gap-4">
            {prev ? (
              <Link
                to={`/chapter/${prev.number}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary active:text-primary transition-colors py-2 min-w-0"
              >
                <ChevronLeft size={16} className="shrink-0" />
                <span className="truncate">
                  <span className="hidden sm:inline">Ch. {prev.number}: </span>{prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                to={`/chapter/${next.number}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary active:text-primary transition-colors py-2 min-w-0 text-right"
              >
                <span className="truncate">
                  <span className="hidden sm:inline">Ch. {next.number}: </span>{next.title}
                </span>
                <ChevronRight size={16} className="shrink-0" />
              </Link>
            ) : (
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-primary hover:brightness-110 active:scale-95 transition-all py-2"
              >
                Return Home <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </article>

      {/* Chapter Audio Player */}
      <ChapterAudioPlayer chapterNumber={chapterNum} />
    </div>
  );
};

export default ChapterReader;
