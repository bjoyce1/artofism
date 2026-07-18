import { describe, it, expect } from 'vitest';
import { safeNext, safeNextFromLocation } from '@/lib/safeNext';

describe('safeNext', () => {
  it('accepts simple relative paths', () => {
    expect(safeNext('/library')).toBe('/library');
    expect(safeNext('/chapter/2')).toBe('/chapter/2');
    expect(safeNext('/vault?filter=all')).toBe('/vault?filter=all');
  });

  it('falls back for null/undefined/empty', () => {
    expect(safeNext(null)).toBe('/library');
    expect(safeNext(undefined)).toBe('/library');
    expect(safeNext('')).toBe('/library');
  });

  it('blocks protocol-relative and backslash open redirects', () => {
    expect(safeNext('//evil.com')).toBe('/library');
    expect(safeNext('/\\evil.com')).toBe('/library');
  });

  it('blocks absolute URLs', () => {
    expect(safeNext('https://evil.com/library')).toBe('/library');
    expect(safeNext('http://evil.com')).toBe('/library');
    expect(safeNext('javascript:alert(1)' as any)).toBe('/library');
  });

  it('blocks paths not starting with /', () => {
    expect(safeNext('library')).toBe('/library');
    expect(safeNext('../etc/passwd')).toBe('/library');
  });

  it('blocks paths with unusual characters', () => {
    expect(safeNext('/lib<script>')).toBe('/library');
    expect(safeNext('/lib\nrary')).toBe('/library');
  });

  it('honors a custom fallback', () => {
    expect(safeNext(null, '/')).toBe('/');
    expect(safeNext('//evil', '/')).toBe('/');
  });

  it('extracts and validates from a location.search string', () => {
    expect(safeNextFromLocation('?next=/chapter/3')).toBe('/chapter/3');
    expect(safeNextFromLocation('?next=https://evil.com')).toBe('/library');
    expect(safeNextFromLocation('')).toBe('/library');
  });
});
