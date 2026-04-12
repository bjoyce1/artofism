import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface KaraokeTextProps {
  paragraphs: string[];
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  timestampsFileName: string;
  pullQuotes?: string[];
  isExperience?: boolean;
  isFirstParagraph?: (index: number) => boolean;
}

const KaraokeText = ({
  paragraphs,
  audioElement,
  isPlaying,
  timestampsFileName,
  pullQuotes = [],
  isExperience = false,
  isFirstParagraph,
}: KaraokeTextProps) => {
  const [timestamps, setTimestamps] = useState<WordTimestamp[] | null>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch timestamps
  useEffect(() => {
    const url = supabase.storage.from('audio').getPublicUrl(timestampsFileName).data.publicUrl;
    fetch(url)
      .then(r => r.json())
      .then((data: WordTimestamp[]) => setTimestamps(data))
      .catch(err => {
        console.warn('Failed to load karaoke timestamps:', err);
        setTimestamps(null);
      });
  }, [timestampsFileName]);

  // Build word mapping: for each paragraph, split into words and map to global index
  const paragraphWords = paragraphs.map(p => p.split(/\s+/).filter(w => w.length > 0));
  let globalWordIndex = 0;
  const paragraphWordIndices = paragraphWords.map(words => {
    const start = globalWordIndex;
    globalWordIndex += words.length;
    return { start, count: words.length };
  });

  // Animation loop
  const updateHighlight = useCallback(() => {
    if (!audioElement || !timestamps || timestamps.length === 0) return;

    const currentTime = audioElement.currentTime;
    
    // Binary search for current word
    let lo = 0, hi = timestamps.length - 1, found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (currentTime >= timestamps[mid].start && currentTime <= timestamps[mid].end) {
        found = mid;
        break;
      } else if (currentTime < timestamps[mid].start) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }

    if (found !== activeWordIndex) {
      setActiveWordIndex(found);
      
      // Auto-scroll
      if (found >= 0 && wordRefs.current[found]) {
        wordRefs.current[found]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(updateHighlight);
    }
  }, [audioElement, timestamps, isPlaying, activeWordIndex]);

  useEffect(() => {
    if (isPlaying && timestamps) {
      rafRef.current = requestAnimationFrame(updateHighlight);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (!isPlaying) setActiveWordIndex(-1);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, timestamps, updateHighlight]);

  // If no timestamps loaded, fall back to plain rendering
  if (!timestamps) {
    return (
      <div className="space-y-5 sm:space-y-6">
        {paragraphs.map((p, i) => {
          const isPullQuote = pullQuotes.some(pq => p.includes(pq));
          if (isPullQuote && isExperience) {
            return (
              <blockquote key={i} className="border-l-2 border-primary pl-6 sm:pl-8 my-8 sm:my-12">
                <p className="font-display text-xl sm:text-2xl italic text-primary leading-relaxed">{p}</p>
              </blockquote>
            );
          }
          return (
            <p key={i} className={`text-base sm:text-lg leading-[1.85] sm:leading-[1.9] text-foreground/90 ${isFirstParagraph?.(i) ? 'drop-cap' : ''}`}>
              {p}
            </p>
          );
        })}
      </div>
    );
  }

  let refIndex = 0;

  return (
    <div ref={containerRef} className="space-y-5 sm:space-y-6">
      {paragraphs.map((p, pIdx) => {
        const words = p.split(/\s+/).filter(w => w.length > 0);
        const isPullQuote = pullQuotes.some(pq => p.includes(pq));
        const startIdx = paragraphWordIndices[pIdx].start;

        if (isPullQuote && isExperience) {
          return (
            <blockquote key={pIdx} className="border-l-2 border-primary pl-6 sm:pl-8 my-8 sm:my-12">
              <p className="font-display text-xl sm:text-2xl italic text-primary leading-relaxed">
                {words.map((word, wIdx) => {
                  const globalIdx = startIdx + wIdx;
                  const isActive = globalIdx === activeWordIndex;
                  return (
                    <span
                      key={wIdx}
                      ref={el => { wordRefs.current[globalIdx] = el; }}
                      className={`transition-all duration-100 ${isActive ? 'karaoke-active' : ''}`}
                    >
                      {word}{wIdx < words.length - 1 ? ' ' : ''}
                    </span>
                  );
                })}
              </p>
            </blockquote>
          );
        }

        return (
          <p
            key={pIdx}
            className={`text-base sm:text-lg leading-[1.85] sm:leading-[1.9] text-foreground/90 ${isFirstParagraph?.(pIdx) ? 'drop-cap' : ''}`}
          >
            {words.map((word, wIdx) => {
              const globalIdx = startIdx + wIdx;
              const isActive = globalIdx === activeWordIndex;
              return (
                <span
                  key={wIdx}
                  ref={el => { wordRefs.current[globalIdx] = el; }}
                  className={`transition-all duration-100 rounded-sm ${isActive ? 'karaoke-active' : ''}`}
                >
                  {word}{wIdx < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </p>
        );
      })}
    </div>
  );
};

export default KaraokeText;
