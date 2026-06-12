import { describe, it, expect } from 'vitest';
import { chapters } from '@/data/bookContent';
import { chapterWordCount, chapterReadingMinutes } from '@/lib/bookStats';
import { searchIndex } from '@/lib/searchIndex';

describe('bookStats', () => {
  it('counts words for every chapter', () => {
    chapters.forEach(ch => {
      expect(chapterWordCount(ch)).toBeGreaterThan(0);
    });
  });

  it('returns at least one minute of reading time', () => {
    chapters.forEach(ch => {
      expect(chapterReadingMinutes(ch)).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('searchIndex', () => {
  it('contains an entry for every chapter', () => {
    const chapterEntries = searchIndex.filter(e => e.kind === 'chapter');
    expect(chapterEntries).toHaveLength(chapters.length);
  });

  it('points every entry at a navigable path', () => {
    searchIndex.forEach(e => {
      expect(e.path).toMatch(/^\/(chapter\/\d+|#introduction)$/);
    });
  });

  it('keeps passage snippets short enough for the results list', () => {
    searchIndex.forEach(e => {
      expect(e.text.length).toBeLessThanOrEqual(160);
    });
  });
});
