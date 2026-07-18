// User-namespaced localStorage. Prevents one signed-in user from seeing
// another user's local reading state on a shared device. Signed-out state
// lives under a "guest" namespace and can be merged into a user's namespace
// on first sign-in.
const NS_PREFIX = 'ism';

let currentNamespace: string = 'guest';

export function setStorageNamespace(userId: string | null | undefined) {
  const next = userId ? `u:${userId}` : 'guest';
  currentNamespace = next;
}

export function getStorageNamespace() {
  return currentNamespace;
}

function keyFor(ns: string, key: string) {
  return `${NS_PREFIX}:${ns}:${key}`;
}

export function nsGet(key: string): string | null {
  try { return localStorage.getItem(keyFor(currentNamespace, key)); } catch { return null; }
}

export function nsSet(key: string, value: string) {
  try { localStorage.setItem(keyFor(currentNamespace, key), value); } catch { /* full */ }
}

export function nsRemove(key: string) {
  try { localStorage.removeItem(keyFor(currentNamespace, key)); } catch { /* noop */ }
}

export function nsGetJson<T>(key: string, fallback: T): T {
  const raw = nsGet(key);
  if (raw == null) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export function nsSetJson(key: string, value: unknown) {
  try { nsSet(key, JSON.stringify(value)); } catch { /* noop */ }
}

// One-time merge on sign-in. For each key, if the user namespace has no value
// and the guest namespace does, copy it over. Then clear guest keys so a
// subsequent guest visit on the same device starts clean.
const MERGE_MARKER = '__merged_from_guest__';

export function mergeGuestIntoUser(userId: string, keys: string[]) {
  const userNs = `u:${userId}`;
  const guestNs = 'guest';
  try {
    if (localStorage.getItem(keyFor(userNs, MERGE_MARKER))) return;
    for (const k of keys) {
      const uKey = keyFor(userNs, k);
      const gKey = keyFor(guestNs, k);
      if (localStorage.getItem(uKey) == null) {
        const gVal = localStorage.getItem(gKey);
        if (gVal != null) localStorage.setItem(uKey, gVal);
      }
      localStorage.removeItem(gKey);
    }
    localStorage.setItem(keyFor(userNs, MERGE_MARKER), '1');
  } catch { /* ignore */ }
}

export const NAMESPACED_KEYS = [
  'reading-progress',
  'favorites',
  'reading-mode',
  'chapter-progress',
  'scroll-positions',
  'font-size',
];
