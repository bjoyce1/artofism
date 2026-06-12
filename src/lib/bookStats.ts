import type { Chapter } from '@/data/bookContent';

const WORDS_PER_MINUTE = 200;

export function chapterWordCount(chapter: Chapter): number {
  const text = [
    chapter.summary,
    ...chapter.content,
    ...chapter.code.principles,
    chapter.code.closing,
  ].join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}

export function chapterReadingMinutes(chapter: Chapter): number {
  return Math.max(1, Math.round(chapterWordCount(chapter) / WORDS_PER_MINUTE));
}
