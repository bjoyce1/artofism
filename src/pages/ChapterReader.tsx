import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { chapters } from '@/data/bookContent';
import { chapterReadingMinutes } from '@/lib/bookStats';
import { useReadingProgress, useFavorites } from '@/hooks/useReadingProgress';
import { useSectionAudio } from '@/hooks/useSectionAudio';

import AnimatedSection from '@/components/AnimatedSection';
import FloatingNav from '@/components/FloatingNav';
import SectionAudioButton from '@/components/SectionAudioButton';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Eye,
  BookOpen,
  Clock,
  Share2,
  ArrowDown,
  AArrowDown,
  AArrowUp,
} from 'lucide-react';
import ChapterAudioPlayer from '@/components/ChapterAudioPlayer';

const FONT_SIZE_KEY = 'ism-font-size';
// Body text sizes from compact to extra large; index 1 is the original default.
const FONT_SIZES = [
  'text-[0.95rem] sm:text-base',
  'text-base sm:text-lg',
  'text-lg sm:text-xl',
  'text-xl sm:text-2xl',
];

interface SelectionState {
  text: string;
  x: number;
  y: number;
}

const ChapterReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chapterNum = parseInt(id || '1', 10);
  const chapter = chapters.find(c => c.number === chapterNum);
  const {
    saveProgress,
    saveChapterProgress,
    saveScrollPosition,
    getScrollPosition,
    readingMode,
    toggleMode,
  } = useReadingProgress();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { currentSection, isPlaying: audioIsPlaying } = useSectionAudio();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(() => {
    const saved = parseInt(localStorage.getItem(FONT_SIZE_KEY) || '1', 10);
    return Number.isNaN(saved) ? 1 : Math.min(FONT_SIZES.length - 1, Math.max(0, saved));
  });
  const [resumeY, setResumeY] = useState<number | null>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [selectionSaved, setSelectionSaved] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  const prev = chapter ? chapters.find(c => c.number === chapterNum - 1) : undefined;
  const next = chapter ? chapters.find(c => c.number === chapterNum + 1) : undefined;

  useEffect(() => {
    if (chapter) {
      saveProgress(chapter.number);
      window.scrollTo(0, 0);
    }
  }, [chapter, saveProgress]);

  // Offer to jump back to where the reader left off in this chapter.
  useEffect(() => {
    if (!chapter) return;
    const savedY = getScrollPosition(chapter.number);
    if (savedY > 800) {
      setResumeY(savedY);
      const timer = setTimeout(() => setResumeY(null), 12000);
      return () => clearTimeout(timer);
    }
    setResumeY(null);
  }, [chapter, getScrollPosition]);

  // Track how far down the chapter the reader has scrolled and persist it
  // (locally always, to Supabase when signed in) so the Library and TOC
  // can show real progress.
  useEffect(() => {
    if (!chapter) return;
    let raf = 0;
    let lastSave = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const now = Date.now();
        if (now - lastSave < 1000) return;
        lastSave = now;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const percent = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 100;
        saveChapterProgress(chapter.number, percent);
        saveScrollPosition(chapter.number, window.scrollY);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [chapter, saveChapterProgress, saveScrollPosition]);

  // Arrow keys move between chapters when not typing in a form field.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (e.key === 'ArrowLeft' && prev) navigate(`/chapter/${prev.number}`);
      if (e.key === 'ArrowRight' && next) navigate(`/chapter/${next.number}`);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [prev, next, navigate]);

  // Show a small save/copy/share toolbar when the reader selects chapter text.
  useEffect(() => {
    const update = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        setSelection(null);
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 3 || text.length > 500) {
        setSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!articleRef.current?.contains(range.commonAncestorContainer)) {
        setSelection(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      setSelection({
        text,
        x: Math.min(Math.max(rect.left + rect.width / 2, 90), window.innerWidth - 90),
        y: Math.max(rect.top, 80),
      });
      setSelectionSaved(false);
    };
    const onUp = () => setTimeout(update, 10);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchend', onUp);
    };
  }, []);

  const dismissSelection = useCallback(() => {
    window.getSelection()?.removeAllRanges();
    setSelection(null);
  }, []);

  const changeFontSize = (delta: number) => {
    setFontSize(prevSize => {
      const nextSize = Math.min(FONT_SIZES.length - 1, Math.max(0, prevSize + delta));
      localStorage.setItem(FONT_SIZE_KEY, nextSize.toString());
      return nextSize;
    });
  };

  if (!chapter || Number.isNaN(chapterNum)) {
    return (
      <div className="min-h-[100dvh] bg-deep-black flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-display text-2xl text-foreground mb-3">Chapter not found.</p>
          <p className="text-muted-foreground mb-8">This page of the book doesn't exist.</p>
          <Link
            to="/#chapters"
            className="inline-flex items-center gap-2 font-ui text-xs uppercase tracking-[0.2em] text-primary hover:brightness-110 transition-all"
          >
            <ChevronLeft size={14} /> View all chapters
          </Link>
        </div>
      </div>
    );
  }

  const isExperience = readingMode === 'experience';
  const chapterSectionId = `chapter-${chapter.number}`;
  const isChapterAudioPlaying = currentSection === chapterSectionId && audioIsPlaying;
  const readingMinutes = chapterReadingMinutes(chapter);
  const bodyFont = FONT_SIZES[fontSize];

  const copyPrinciple = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const saveSelection = () => {
    if (!selection) return;
    if (!isFavorite(selection.text)) {
      toggleFavorite(selection.text, chapter.number.toString());
    }
    setSelectionSaved(true);
    setTimeout(dismissSelection, 900);
  };

  const copySelection = () => {
    if (!selection) return;
    navigator.clipboard.writeText(selection.text);
    dismissSelection();
  };

  const shareSelection = async () => {
    if (!selection) return;
    const quote = `"${selection.text}" — The Art of ISM, Chapter ${chapter.number}`;
    if (navigator.share) {
      try {
        await navigator.share({ text: quote });
      } catch {
        // user dismissed the share sheet
      }
    } else {
      navigator.clipboard.writeText(quote);
    }
    dismissSelection();
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

      {/* Reader controls: font size + reading mode */}
      <div
        className="fixed z-50 font-ui right-4 sm:right-6 bottom-20 sm:bottom-6 flex items-center gap-2"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-center bg-card/90 backdrop-blur-lg border border-border rounded-full sm:rounded-sm shadow-lg shadow-black/30">
          <button
            onClick={() => changeFontSize(-1)}
            disabled={fontSize === 0}
            aria-label="Decrease text size"
            className="p-2.5 sm:p-2 text-muted-foreground hover:text-primary disabled:opacity-30 disabled:hover:text-muted-foreground active:scale-95 transition-all"
          >
            <AArrowDown size={16} />
          </button>
          <div className="w-px h-4 bg-border" />
          <button
            onClick={() => changeFontSize(1)}
            disabled={fontSize === FONT_SIZES.length - 1}
            aria-label="Increase text size"
            className="p-2.5 sm:p-2 text-muted-foreground hover:text-primary disabled:opacity-30 disabled:hover:text-muted-foreground active:scale-95 transition-all"
          >
            <AArrowUp size={16} />
          </button>
        </div>
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-4 py-2.5 sm:py-2 bg-card/90 backdrop-blur-lg border border-border rounded-full sm:rounded-sm text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 active:scale-95 shadow-lg shadow-black/30"
        >
          {isExperience ? <Eye size={14} /> : <BookOpen size={14} />}
          {isExperience ? 'Experience' : 'Read'}
        </button>
      </div>

      {/* Resume reading pill */}
      <AnimatePresence>
        {resumeY !== null && (
          <motion.button
            initial={{ opacity: 0, y: 16, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 16, x: '-50%' }}
            onClick={() => {
              window.scrollTo({ top: resumeY, behavior: 'smooth' });
              setResumeY(null);
            }}
            className="fixed z-50 left-1/2 bottom-20 sm:bottom-6 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-ui text-xs uppercase tracking-[0.15em] rounded-full shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
            style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <ArrowDown size={14} /> Resume where you left off
          </motion.button>
        )}
      </AnimatePresence>

      {/* Text selection toolbar */}
      <AnimatePresence>
        {selection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
            transition={{ duration: 0.12 }}
            className="fixed z-[90] flex items-center gap-1 px-2 py-1.5 bg-card border border-primary/30 rounded-full shadow-xl shadow-black/50 backdrop-blur-lg font-ui"
            style={{ left: selection.x, top: selection.y - 56 }}
          >
            <button
              onClick={saveSelection}
              aria-label="Save quote"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary active:scale-95 transition-all"
            >
              {selectionSaved ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Heart size={14} />
              )}
              Save
            </button>
            <div className="w-px h-4 bg-border" />
            <button
              onClick={copySelection}
              aria-label="Copy selection"
              className="p-2 text-muted-foreground hover:text-primary active:scale-95 transition-all"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={shareSelection}
              aria-label="Share selection"
              className="p-2 text-muted-foreground hover:text-primary active:scale-95 transition-all"
            >
              <Share2 size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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

            <div className="flex items-center gap-4 mb-3">
              <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary">
                Chapter {chapter.number}
              </p>
              <span className="inline-flex items-center gap-1.5 font-ui text-xs text-muted-foreground">
                <Clock size={12} /> {readingMinutes} min read
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-foreground mb-3 sm:mb-4">
                {chapter.title}
              </h1>
              {!isChapterAudioPlaying && (
                <SectionAudioButton
                  sectionId={chapterSectionId}
                  fileName={`chapter_${String(chapter.number).padStart(2, '0')}.mp3`}
                  label="Audiobook"
                  className="-mt-2"
                />
              )}
            </div>
            <p className="font-body text-base sm:text-lg italic text-muted-foreground mb-12 sm:mb-16">
              {chapter.summary}
            </p>
          </AnimatedSection>

          {/* Body */}
          <div ref={articleRef} className="space-y-5 sm:space-y-6">
            {chapter.content.map((p, i) => {
              const isPullQuote = chapter.pullQuotes.some(pq => p.includes(pq));

              if (isPullQuote && isExperience) {
                return (
                  <AnimatedSection key={i} delay={i * 30}>
                    <blockquote className="border-l-2 border-primary pl-6 sm:pl-8 my-8 sm:my-12">
                      <p className="font-display text-xl sm:text-2xl italic text-primary leading-relaxed whitespace-pre-line">{p}</p>
                    </blockquote>
                  </AnimatedSection>
                );
              }

              return (
                <AnimatedSection key={i} delay={i * 20}>
                  <p className={`${bodyFont} leading-[1.85] sm:leading-[1.9] text-foreground/90 whitespace-pre-line ${i === 0 ? 'drop-cap' : ''}`}>
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
                          onClick={() => toggleFavorite(principle, chapter.number.toString())}
                          aria-label={isFavorite(principle) ? 'Remove from saved quotes' : 'Save quote'}
                          className="p-2 -m-1 transition-colors active:scale-90"
                        >
                          <Heart
                            size={16}
                            className={isFavorite(principle) ? 'fill-primary text-primary' : 'text-muted-foreground hover:text-primary'}
                          />
                        </button>
                        <button
                          onClick={() => copyPrinciple(principle, i)}
                          aria-label="Copy quote"
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

          {/* Navigation */}
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

          <p className="hidden md:block text-center font-ui text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 mt-8">
            Tip: use ← and → keys to move between chapters
          </p>
        </div>
      </article>

      {/* Floating narration play/pause — fixed to viewport during playback */}
      {isChapterAudioPlaying && (
        <div
          className="fixed z-50 right-4 sm:right-6 top-14 sm:top-6"
          style={{ marginTop: 'env(safe-area-inset-top, 0px)' }}
        >
          <SectionAudioButton
            sectionId={chapterSectionId}
            fileName={`chapter_${String(chapter.number).padStart(2, '0')}.mp3`}
            className="w-10 h-10 shadow-lg shadow-primary/20"
          />
        </div>
      )}

      {/* Chapter Audio Player */}
      <ChapterAudioPlayer chapterNumber={chapterNum} />
    </div>
  );
};

export default ChapterReader;
