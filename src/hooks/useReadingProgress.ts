import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const STORAGE_KEY = 'ism-reading-progress';
const FAVORITES_KEY = 'ism-favorites';
const MODE_KEY = 'ism-reading-mode';
const CHAPTER_PROGRESS_KEY = 'ism-chapter-progress';
const SCROLL_POS_KEY = 'ism-scroll-positions';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — reading still works without persistence
  }
}

export type ChapterProgressMap = Record<string, number>;

export function useReadingProgress() {
  const { user, hasAccess } = useAuth();
  const [lastChapter, setLastChapter] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [chapterProgress, setChapterProgress] = useState<ChapterProgressMap>(() =>
    readJson<ChapterProgressMap>(CHAPTER_PROGRESS_KEY, {})
  );
  const [readingMode, setReadingMode] = useState<'read' | 'experience'>(() => {
    const saved = localStorage.getItem(MODE_KEY);
    return (saved as 'read' | 'experience') || 'experience';
  });
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSync = useRef<ChapterProgressMap>({});
  // Once a chapter is marked complete it stays complete for the session,
  // even if cloud rows are slow to refresh.
  const completedRef = useRef<Set<string>>(new Set());

  // Pull cloud progress once per sign-in and merge it with local progress,
  // keeping whichever side has read further in each chapter.
  useEffect(() => {
    if (!user) return;
    supabase
      .from('reading_progress')
      .select('chapter_slug, progress_percent, completed')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data?.length) return;
        data.forEach((r: any) => {
          if (r.completed) completedRef.current.add(r.chapter_slug);
        });
        setChapterProgress(prev => {
          const merged = { ...prev };
          data.forEach(r => {
            merged[r.chapter_slug] = Math.max(merged[r.chapter_slug] ?? 0, r.progress_percent);
          });
          writeJson(CHAPTER_PROGRESS_KEY, merged);
          return merged;
        });
      });
  }, [user]);

  const flushSync = useCallback(
    (userId: string) => {
      const entries = Object.entries(pendingSync.current);
      pendingSync.current = {};
      if (!entries.length) return;
      const nowIso = new Date().toISOString();
      // Fire and forget — a failed write must never interrupt reading.
      supabase
        .from('reading_progress')
        .upsert(
          entries.map(([chapter_slug, progress_percent]) => ({
            user_id: userId,
            chapter_slug,
            progress_percent,
            completed: progress_percent >= 90 || completedRef.current.has(chapter_slug),
            last_read_at: nowIso,
            updated_at: nowIso,
          })) as any,
          { onConflict: 'user_id,chapter_slug' }
        )
        .then(() => {});
    },
    []
  );

  const saveProgress = useCallback((chapter: number) => {
    setLastChapter(chapter);
    localStorage.setItem(STORAGE_KEY, chapter.toString());
  }, []);

  // Records how far into a chapter the reader has scrolled. Progress only
  // moves forward — re-reading from the top never erases it. Cloud writes
  // are debounced to at most one every 10 seconds.
  const saveChapterProgress = useCallback(
    (chapter: number, percent: number) => {
      const slug = chapter.toString();
      const clamped = Math.min(100, Math.max(0, Math.round(percent)));
      setChapterProgress(prev => {
        if (clamped <= (prev[slug] ?? 0)) return prev;
        const next = { ...prev, [slug]: clamped };
        writeJson(CHAPTER_PROGRESS_KEY, next);
        if (clamped >= 90) completedRef.current.add(slug);
        if (user && hasAccess) {
          pendingSync.current[slug] = clamped;
          if (!syncTimer.current) {
            syncTimer.current = setTimeout(() => {
              syncTimer.current = null;
              flushSync(user.id);
            }, 10000);
          }
        }
        return next;
      });
    },
    [user, hasAccess, flushSync]
  );

  // Flush pending cloud writes when the tab is hidden or the hook unmounts
  // so the final scroll position is never lost on navigation away.
  useEffect(() => {
    if (!user || !hasAccess) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (syncTimer.current) {
          clearTimeout(syncTimer.current);
          syncTimer.current = null;
        }
        flushSync(user.id);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (syncTimer.current) {
        clearTimeout(syncTimer.current);
        syncTimer.current = null;
      }
      flushSync(user.id);
    };
  }, [user, hasAccess, flushSync]);

  const saveScrollPosition = useCallback((chapter: number, scrollY: number) => {
    const positions = readJson<Record<string, number>>(SCROLL_POS_KEY, {});
    positions[chapter.toString()] = Math.round(scrollY);
    writeJson(SCROLL_POS_KEY, positions);
  }, []);

  const getScrollPosition = useCallback((chapter: number): number => {
    return readJson<Record<string, number>>(SCROLL_POS_KEY, {})[chapter.toString()] ?? 0;
  }, []);

  const toggleMode = useCallback(() => {
    setReadingMode(prev => {
      const next = prev === 'read' ? 'experience' : 'read';
      localStorage.setItem(MODE_KEY, next);
      return next;
    });
  }, []);

  return {
    lastChapter,
    saveProgress,
    chapterProgress,
    saveChapterProgress,
    saveScrollPosition,
    getScrollPosition,
    readingMode,
    toggleMode,
  };
}

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>(() =>
    readJson<string[]>(FAVORITES_KEY, [])
  );

  // Merge cloud-saved quotes into local favorites on sign-in so they
  // follow the reader across devices.
  useEffect(() => {
    if (!user) return;
    supabase
      .from('saved_quotes')
      .select('quote_text')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data?.length) return;
        setFavorites(prev => {
          const merged = [...prev];
          data.forEach(r => {
            if (!merged.includes(r.quote_text)) merged.push(r.quote_text);
          });
          writeJson(FAVORITES_KEY, merged);
          return merged;
        });
      });
  }, [user]);

  const toggleFavorite = useCallback(
    (quote: string, chapterSlug?: string) => {
      setFavorites(prev => {
        const removing = prev.includes(quote);
        const next = removing ? prev.filter(q => q !== quote) : [...prev, quote];
        writeJson(FAVORITES_KEY, next);
        if (user) {
          if (removing) {
            supabase
              .from('saved_quotes')
              .delete()
              .eq('user_id', user.id)
              .eq('quote_text', quote)
              .then(() => {});
          } else {
            supabase
              .from('saved_quotes')
              .insert({ user_id: user.id, quote_text: quote, chapter_slug: chapterSlug ?? null })
              .then(() => {});
          }
        }
        return next;
      });
    },
    [user]
  );

  const isFavorite = useCallback((quote: string) => favorites.includes(quote), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
