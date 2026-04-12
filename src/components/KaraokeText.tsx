import { useMemo, useRef, useEffect } from 'react';

interface KaraokeTextProps {
  paragraphs: string[];
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  className?: string;
  dropCapFirst?: boolean;
}

interface WordInfo {
  word: string;
  paragraphIdx: number;
  globalIdx: number;
}

const KaraokeText = ({ paragraphs, currentTime, duration, isPlaying, className = '', dropCapFirst = false }: KaraokeTextProps) => {
  const activeWordRef = useRef<HTMLSpanElement | null>(null);

  // Flatten all words with paragraph tracking
  const words = useMemo<WordInfo[]>(() => {
    const result: WordInfo[] = [];
    paragraphs.forEach((p, pIdx) => {
      p.split(/\s+/).filter(Boolean).forEach(word => {
        result.push({ word, paragraphIdx: pIdx, globalIdx: result.length });
      });
    });
    return result;
  }, [paragraphs]);

  // Calculate which word is active based on currentTime / duration
  const activeWordIdx = useMemo(() => {
    if (!isPlaying || duration <= 0 || words.length === 0) return -1;
    const progress = Math.min(currentTime / duration, 1);
    return Math.min(Math.floor(progress * words.length), words.length - 1);
  }, [currentTime, duration, isPlaying, words]);

  // Auto-scroll to active word
  useEffect(() => {
    if (activeWordRef.current && isPlaying) {
      activeWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeWordIdx, isPlaying]);

  // Group words back into paragraphs for rendering
  const paragraphWords = useMemo(() => {
    const groups: WordInfo[][] = paragraphs.map(() => []);
    words.forEach(w => {
      groups[w.paragraphIdx].push(w);
    });
    return groups;
  }, [words, paragraphs]);

  return (
    <div className={className}>
      {paragraphWords.map((pWords, pIdx) => (
        <p
          key={pIdx}
          className={`text-base sm:text-lg leading-[1.85] sm:leading-[1.9] text-foreground/90 mb-5 sm:mb-6 ${pIdx === 0 && dropCapFirst ? 'drop-cap' : ''}`}
        >
          {pWords.map((w, wIdx) => {
            const isActive = w.globalIdx === activeWordIdx;
            const isPast = w.globalIdx < activeWordIdx;
            return (
              <span
                key={wIdx}
                ref={isActive ? activeWordRef : undefined}
                className="transition-all duration-150"
                style={{
                  color: isActive
                    ? '#D4AF37'
                    : isPast
                      ? 'hsl(var(--foreground) / 0.9)'
                      : isPlaying
                        ? 'hsl(var(--foreground) / 0.4)'
                        : 'hsl(var(--foreground) / 0.9)',
                  background: isActive ? 'rgba(200, 168, 78, 0.15)' : 'transparent',
                  borderRadius: isActive ? '2px' : undefined,
                  padding: isActive ? '1px 2px' : undefined,
                }}
              >
                {w.word}
                {wIdx < pWords.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
};

export default KaraokeText;
