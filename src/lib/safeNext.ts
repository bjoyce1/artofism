// Same-origin next-path validation for auth flows. Prevents open redirects.
// Accepts only strictly relative paths beginning with "/" (not "//" or "/\").
const SAFE_PATH_RE = /^\/[a-zA-Z0-9/_\-?=&.%~+]*$/;

export function safeNext(raw: string | null | undefined, fallback = '/library'): string {
  if (!raw) return fallback;
  if (raw.length > 512) return fallback;
  if (raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
  if (!SAFE_PATH_RE.test(raw)) return fallback;
  return raw;
}

export function safeNextFromLocation(search: string, fallback = '/library'): string {
  try {
    const p = new URLSearchParams(search);
    return safeNext(p.get('next'), fallback);
  } catch {
    return fallback;
  }
}
