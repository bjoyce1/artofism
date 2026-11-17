import { describe, it, expect } from 'vitest';
import { splitSentences } from '@/lib/narrationSync';
describe('follow-along keeps line breaks', () => {
  it('joined sentences reproduce the paragraph exactly', () => {
    const p = 'Not as a trend.\nNot as a gimmick.\nMr. CAP said so. Done!';
    expect(splitSentences(p).join('')).toBe(p);
  });
});
