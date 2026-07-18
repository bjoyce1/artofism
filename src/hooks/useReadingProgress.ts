import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { nsGet, nsSet, nsGetJson, nsSetJson, getStorageNamespace } from '@/lib/userStorage';

const LEGACY_KEYS = {
  last: 'ism-reading-progress',
  favorites: 'ism-favorites',
  mode: 'ism-reading-mode',
  chapters: 'ism-chapter-progress',
  scroll: 'ism-scroll-positions',
};
const K = {
  last: 'reading-progress',
  favorites: 'favorites',
  mode: 'reading-mode',
  chapters: 'chapter-progress',
  scroll: 'scroll-positions',
};

// One-time migration from legacy shared keys into the guest namespace, so
// existing readers don't lose progress on this deploy. Runs before any hook
// reads local state.
let migrated = false;
function migrateLegacy() {
  if (migrated) return;
  migrated = true;
  try {
    for (const [nsKey, legacy] of Object.entries(LEGACY_KEYS)) {
      const val = localStorage.getItem(legacy);
      if (val != null) {
        const dest = `ism:guest:${(K as any)[nsKey]}`;
        if (localStorage.getItem(dest) == null) localStorage.setItem(dest, val);
        localStorage.removeItem(legacy);
      }
    }
  } catch { /* ignore */ }
}

export type ChapterProgressMap = Record<string, number>;

export function useReadingProgress() {
  migrateLegacy();
  const { user, hasAccess } = useAuth();
  const [lastChapter, setLastChapter] = useState<number>(() => {
    const saved = nsGet(K.last);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [chapterProgress, setChapterProgress] = useState<ChapterProgressMap>(() =>
    nsGetJson<ChapterProgressMap>(K.chapters, {})
  );
  const [readingMode, setReadingMode] = useState<'read' | 'experience'>(() => {
    const saved = nsGet(K.mode);
    return (saved as 'read' | 'experience') || 'experience';
  });
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSync = useRef<ChapterProgressMap>({});
  const completedRef = useRef<Set<string>>(new Set());

  // Re-read from the active namespace whenever it changes (sign-in/out).
  useEffect(() => {
    const saved = nsGet(K.last);
    setLastChapter(saved ? parseInt(saved, 10) : 0);
    setChapterProgress(nsGetJson<ChapterProgressMap>(K.chapters, {}));
    const mode = nsGet(K.mode);
    if (mode) setReadingMode(mode as 'read' | 'experience');
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('reading_progress')
      .select('chapter_slug, progress_percent, completed')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data?.length) return;
        data.forEach((r: any) => { if (r.completed) completedRef.current.add(r.chapter_slug); });
        setChapterProgress(prev => {
          const merged = { ...prev };
          data.forEach(r => {
            merged[r.chapter_slug] = Math.max(merged[r.chapter_slug] ?? 0, r.progress_percent);
          });
          nsSetJson(K.chapters, merged);
          return merged;
        });
      });
  }, [user]);

  const flushSync = useCallback((userId: string) => {
    const entries = Object.entries(pendingSync.current);
    pendingSync.current = {};
    if (!entries.length) return;
    const nowIso = new Date().toISOString();
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
  }, []);

  const saveProgress = useCallback((chapter: number) => {
    setLastChapter(chapter);
    nsSet(K.last, chapter.toString());
  }, []);

  const saveChapterProgress = useCallback(
    (chapter: number, percent: number) => {
      const slug = chapter.toString();
      const clamped = Math.min(100, Math.max(0, Math.round(percent)));
      setChapterProgress(prev => {
        if (clamped <= (prev[slug] ?? 0)) return prev;
        const next = { ...prev, [slug]: clamped };
        nsSetJson(K.chapters, next);
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

  useEffect(() => {
    if (!user || !hasAccess) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (syncTimer.current) { clearTimeout(syncTimer.current); syncTimer.current = null; }
        flushSync(user.id);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      if (syncTimer.current) { clearTimeout(syncTimer.current); syncTimer.current = null; }
      flushSync(user.id);
    };
  }, [user, hasAccess, flushSync]);

  const saveScrollPosition = useCallback((chapter: number, scrollY: number) => {
    const positions = nsGetJson<Record<string, number>>(K.scroll, {});
    positions[chapter.toString()] = Math.round(scrollY);
    nsSetJson(K.scroll, positions);
  }, []);

  const getScrollPosition = useCallback((chapter: number): number => {
    return nsGetJson<Record<string, number>>(K.scroll, {})[chapter.toString()] ?? 0;
  }, []);

  const toggleMode = useCallback(() => {
    setReadingMode(prev => {
      const next = prev === 'read' ? 'experience' : 'read';
      nsSet(K.mode, next);
      return next;
    });
  }, []);

  // Force reads to depend on the namespace so switching accounts re-renders.
  void getStorageNamespace();

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
  migrateLegacy();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>(() =>
    nsGetJson<string[]>(K.favorites, [])
  );

  useEffect(() => {
    setFavorites(nsGetJson<string[]>(K.favorites, []));
  }, [user?.id]);

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
          data.forEach(r => { if (!merged.includes(r.quote_text)) merged.push(r.quote_text); });
          nsSetJson(K.favorites, merged);
          return merged;
        });
      });
  }, [user]);

  const toggleFavorite = useCallback(
    (quote: string, chapterSlug?: string) => {
      setFavorites(prev => {
        const removing = prev.includes(quote);
        const next = removing ? prev.filter(q => q !== quote) : [...prev, quote];
        nsSetJson(K.favorites, next);
        if (user) {
          if (removing) {
            supabase.from('saved_quotes').delete()
              .eq('user_id', user.id).eq('quote_text', quote).then(() => {});
          } else {
            supabase.from('saved_quotes').insert({
              user_id: user.id, quote_text: quote, chapter_slug: chapterSlug ?? null,
            }).then(() => {});
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
