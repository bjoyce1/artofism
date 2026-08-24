import { describe, expect, it } from 'vitest';
import {
  activeUnitIndex,
  buildSyncUnits,
  splitSentences,
  unitsByParagraph,
} from '@/lib/narrationSync';

describe('splitSentences', () => {
  it('keeps punctuation attached and drops empties', () => {
    expect(splitSentences('One. Two! Three?')).toEqual(['One.', 'Two!', 'Three?']);
  });

  it('falls back to the whole paragraph when there is no punctuation', () => {
    expect(splitSentences('International State of Mind')).toEqual([
      'International State of Mind',
    ]);
  });
});

describe('buildSyncUnits', () => {
  const units = buildSyncUnits(['First one. Second one.', 'Third paragraph.']);

  it('creates one unit per sentence with paragraph indexes', () => {
    expect(units).toHaveLength(3);
    expect(units.map((u) => u.paragraph)).toEqual([0, 0, 1]);
  });

  it('produces a contiguous 0..1 timeline', () => {
    expect(units[0].start).toBe(0);
    expect(units[2].end).toBeCloseTo(1, 6);
    for (let i = 1; i < units.length; i++) {
      expect(units[i].start).toBeCloseTo(units[i - 1].end, 6);
    }
  });
});

describe('activeUnitIndex', () => {
  const units = buildSyncUnits(['A short one.', 'Another sentence here.']);

  it('returns -1 without a usable duration', () => {
    expect(activeUnitIndex(units, 5, 0)).toBe(-1);
    expect(activeUnitIndex([], 5, 100)).toBe(-1);
  });

  it('starts at the first sentence and ends on the last', () => {
    expect(activeUnitIndex(units, 0, 100)).toBe(0);
    expect(activeUnitIndex(units, 99.9, 100)).toBe(units.length - 1);
  });

  it('applies the reader offset', () => {
    const late = activeUnitIndex(units, 60, 100, 60);
    expect(late).toBe(0);
  });
});

describe('unitsByParagraph', () => {
  it('groups units while preserving global indexes', () => {
    const units = buildSyncUnits(['One. Two.', 'Three.']);
    const groups = unitsByParagraph(units);
    expect(groups[0].map((g) => g.index)).toEqual([0, 1]);
    expect(groups[1].map((g) => g.index)).toEqual([2]);
  });
});
