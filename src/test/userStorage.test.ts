import { describe, it, expect, beforeEach } from 'vitest';
import {
  setStorageNamespace,
  nsGet,
  nsSet,
  nsGetJson,
  nsSetJson,
  mergeGuestIntoUser,
  NAMESPACED_KEYS,
} from '@/lib/userStorage';

beforeEach(() => {
  localStorage.clear();
  setStorageNamespace(null);
});

describe('userStorage', () => {
  it('scopes reads and writes to the current namespace', () => {
    setStorageNamespace(null);
    nsSet('reading-progress', '3');
    setStorageNamespace('user-A');
    expect(nsGet('reading-progress')).toBeNull();
    nsSet('reading-progress', '7');
    setStorageNamespace('user-B');
    expect(nsGet('reading-progress')).toBeNull();
    setStorageNamespace('user-A');
    expect(nsGet('reading-progress')).toBe('7');
  });

  it('round-trips JSON via nsSetJson/nsGetJson', () => {
    setStorageNamespace('user-A');
    nsSetJson('favorites', ['q1', 'q2']);
    expect(nsGetJson<string[]>('favorites', [])).toEqual(['q1', 'q2']);
  });

  it('mergeGuestIntoUser copies guest state on first sign-in only', () => {
    setStorageNamespace(null);
    nsSet('reading-progress', '4');
    mergeGuestIntoUser('user-A', NAMESPACED_KEYS);
    setStorageNamespace('user-A');
    expect(nsGet('reading-progress')).toBe('4');
    // Second invocation is a no-op even if guest state is repopulated.
    setStorageNamespace(null);
    nsSet('reading-progress', '999');
    mergeGuestIntoUser('user-A', NAMESPACED_KEYS);
    setStorageNamespace('user-A');
    expect(nsGet('reading-progress')).toBe('4');
  });

  it('does not overwrite existing user state during merge', () => {
    setStorageNamespace('user-A');
    nsSet('reading-progress', '10');
    setStorageNamespace(null);
    nsSet('reading-progress', '2');
    mergeGuestIntoUser('user-A', NAMESPACED_KEYS);
    setStorageNamespace('user-A');
    expect(nsGet('reading-progress')).toBe('10');
  });
});
