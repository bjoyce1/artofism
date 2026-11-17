import { describe, it, expect } from 'vitest';
import { buildFlipPages, paginate } from '@/lib/flipbookPages';
import { chapters } from '@/data/bookContent';

describe('flip book pages', () => {
  it('starts with the front cover and ends with the back cover on an even page count', () => {
    for (const access of [true, false]) {
      const p = buildFlipPages(access);
      expect(p[0].kind).toBe('cover');
      expect(p[p.length - 1].kind).toBe('back-cover');
      expect(p.length % 2).toBe(0);
    }
  });
  it('non-members see only Chapter 1 then a locked page', () => {
    const p = buildFlipPages(false);
    const starts = p.filter((x) => x.kind === 'chapter-start');
    expect(starts.map((s) => (s as { number: number }).number)).toEqual([1]);
    expect(p.some((x) => x.kind === 'locked')).toBe(true);
  });
  it('members get all 11 chapters', () => {
    const p = buildFlipPages(true);
    expect(p.filter((x) => x.kind === 'chapter-start')).toHaveLength(11);
    expect(p.some((x) => x.kind === 'locked')).toBe(false);
  });
  it('never drops chapter text', () => {
    const text = chapters[0].content.join('').replace(/\s/g, '');
    const pages = paginate(chapters[0].content.map((t) => ({ type: 'p' as const, text: t })), 'x');
    const out = pages.flatMap((pg) => (pg.kind === 'text' ? pg.blocks.map((b) => b.text) : [])).join('').replace(/\s/g, '');
    expect(out).toBe(text);
  });
});
