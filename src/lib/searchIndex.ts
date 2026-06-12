import { chapters, introduction } from '@/data/bookContent';

export interface SearchEntry {
  id: string;
  /** Where selecting this result navigates to. */
  path: string;
  /** Chapter number, or 0 for the introduction. */
  chapter: number;
  chapterTitle: string;
  kind: 'chapter' | 'passage' | 'principle';
  text: string;
}

function snippet(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1) + '…' : clean;
}

// Built once at module load — the book is static content.
export const searchIndex: SearchEntry[] = (() => {
  const entries: SearchEntry[] = [];

  introduction.paragraphs.forEach((p, i) => {
    entries.push({
      id: `intro-${i}`,
      path: '/#introduction',
      chapter: 0,
      chapterTitle: 'Introduction',
      kind: 'passage',
      text: snippet(p),
    });
  });

  chapters.forEach(ch => {
    entries.push({
      id: `ch-${ch.number}`,
      path: `/chapter/${ch.number}`,
      chapter: ch.number,
      chapterTitle: ch.title,
      kind: 'chapter',
      text: `${ch.title} — ${ch.summary}`,
    });
    ch.content.forEach((p, i) => {
      entries.push({
        id: `ch-${ch.number}-p-${i}`,
        path: `/chapter/${ch.number}`,
        chapter: ch.number,
        chapterTitle: ch.title,
        kind: 'passage',
        text: snippet(p),
      });
    });
    ch.code.principles.forEach((p, i) => {
      entries.push({
        id: `ch-${ch.number}-code-${i}`,
        path: `/chapter/${ch.number}`,
        chapter: ch.number,
        chapterTitle: ch.title,
        kind: 'principle',
        text: snippet(p),
      });
    });
  });

  return entries;
})();
