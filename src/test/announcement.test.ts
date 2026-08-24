import { describe, it, expect, beforeEach } from 'vitest';
import { setStorageNamespace } from '@/lib/userStorage';
import {
  addLocalDismissal,
  readLocalDismissals,
  isDismissed,
} from '@/hooks/useAnnouncement';

describe('announcement dismissals', () => {
  beforeEach(() => {
    localStorage.clear();
    setStorageNamespace(null);
  });

  it('starts empty', () => {
    expect(readLocalDismissals()).toEqual([]);
  });

  it('records a dismissal per announcement id', () => {
    addLocalDismissal('a1');
    expect(isDismissed('a1', readLocalDismissals())).toBe(true);
    expect(isDismissed('a2', readLocalDismissals())).toBe(false);
  });

  it('does not duplicate the same id', () => {
    addLocalDismissal('a1');
    addLocalDismissal('a1');
    expect(readLocalDismissals()).toEqual(['a1']);
  });

  it('keeps dismissals separate per namespace', () => {
    setStorageNamespace('user-one');
    addLocalDismissal('a1');
    setStorageNamespace('user-two');
    expect(isDismissed('a1', readLocalDismissals())).toBe(false);
    setStorageNamespace('user-one');
    expect(isDismissed('a1', readLocalDismissals())).toBe(true);
  });

  it('ignores corrupt stored values', () => {
    localStorage.setItem('ism:guest:dismissed-announcements', '{not json');
    expect(readLocalDismissals()).toEqual([]);
  });
});
