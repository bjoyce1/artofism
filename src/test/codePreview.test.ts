import { describe, expect, it } from 'vitest';
import { codePreviewTitles } from '@/lib/codePreview';

describe('public Codes preview', () => {
  it('lists exactly the ten paid codes, with Chapter 1 remaining free', () => {
    expect(codePreviewTitles.map(code => code.chapterNumber)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  });

  it('exposes titles only, never paid principles or closing text', () => {
    for (const code of codePreviewTitles) {
      expect(Object.keys(code).sort()).toEqual(['chapterNumber', 'title']);
    }
  });
});