import { describe, expect, it } from 'vitest';
import { codeTitle } from '@/lib/codeTitle';
import { allCodes, chapters } from '@/data/bookContent';
import { searchIndex } from '@/lib/searchIndex';

describe('code label projection', () => {
  it('normalizes the Focus Code display without changing its manuscript label', () => {
    expect(codeTitle('THE FOCUS CODE')).toBe('The Focus Code');
    expect(allCodes.find(code => code.title === 'The Focus Code')).toBeDefined();
    expect(chapters.find(chapter => chapter.code.title === 'THE FOCUS CODE')).toBeDefined();
  });

  it('includes normalized code names in searchable principle metadata', () => {
    const focus = chapters.find(chapter => chapter.code.title === 'THE FOCUS CODE');
    expect(searchIndex.find(entry => entry.kind === 'principle' && entry.chapter === focus?.number)?.chapterTitle).toContain('The Focus Code');
  });
});