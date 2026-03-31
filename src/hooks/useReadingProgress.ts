import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'ism-reading-progress';
const FAVORITES_KEY = 'ism-favorites';
const MODE_KEY = 'ism-reading-mode';

export function useReadingProgress() {
  const [lastChapter, setLastChapter] = useState<number>(0);
  const [readingMode, setReadingMode] = useState<'read' | 'experience'>(() => {
    const saved = localStorage.getItem(MODE_KEY);
    return (saved as 'read' | 'experience') || 'experience';
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setLastChapter(parseInt(saved, 10));
  }, []);

  const saveProgress = useCallback((chapter: number) => {
    setLastChapter(chapter);
    localStorage.setItem(STORAGE_KEY, chapter.toString());
  }, []);

  const toggleMode = useCallback(() => {
    setReadingMode(prev => {
      const next = prev === 'read' ? 'experience' : 'read';
      localStorage.setItem(MODE_KEY, next);
      return next;
    });
  }, []);

  return { lastChapter, saveProgress, readingMode, toggleMode };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem(FAVORITES_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = useCallback((quote: string) => {
    setFavorites(prev => {
      const next = prev.includes(quote)
        ? prev.filter(q => q !== quote)
        : [...prev, quote];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((quote: string) => favorites.includes(quote), [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
