import { chapters, dedication, introduction, aboutAuthor } from '@/data/bookContent';
import { codeTitle } from '@/lib/codeTitle';

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string }
  | { type: 'principle'; text: string };

export type FlipPage =
  | { kind: 'cover' }
  | { kind: 'back-cover' }
  | { kind: 'endpaper' }
  | { kind: 'title' }
  | { kind: 'chapter-start'; number: number; title: string; summary: string }
  | { kind: 'text'; header: string; blocks: Block[] }
  | { kind: 'locked' }
  | { kind: 'blank' };

/** Approximate character budget for one interior page at the flip book's fixed type scale. */
export const PAGE_BUDGET = 1000;
const BLOCK_COST = { p: 40, h: 110, principle: 50 } as const;

const cost = (b: Block) => b.text.length + BLOCK_COST[b.type] + (b.text.split('\n').length - 1) * 30;

function splitLong(b: Block, budget: number): Block[] {
  if (cost(b) <= budget) return [b];
  const sentences = b.text.match(/[^.!?…]+[.!?…]*["”’]?\s*/g) ?? [b.text];
  const out: Block[] = [];
  let cur = '';
  for (const s of sentences) {
    if (cur && cur.length + s.length + BLOCK_COST[b.type] > budget) {
      out.push({ ...b, text: cur.trim() });
      cur = '';
    }
    cur += s;
  }
  if (cur.trim()) out.push({ ...b, text: cur.trim() });
  return out;
}

/** Flow blocks onto pages without exceeding the budget; text is never dropped. */
export function paginate(blocks: Block[], header: string, budget = PAGE_BUDGET): FlipPage[] {
  const pages: FlipPage[] = [];
  let cur: Block[] = [];
  let used = 0;
  for (const raw of blocks) {
    for (const b of splitLong(raw, budget)) {
      const c = cost(b);
      if (cur.length && used + c > budget) {
        pages.push({ kind: 'text', header, blocks: cur });
        cur = [];
        used = 0;
      }
      cur.push(b);
      used += c;
    }
  }
  if (cur.length) pages.push({ kind: 'text', header, blocks: cur });
  return pages;
}

const ps = (arr: string[]): Block[] => arr.map((text) => ({ type: 'p', text }));

/** Build the ordered page list. Non-members get the opening matter and Chapter 1, then a locked page. */
export function buildFlipPages(hasAccess: boolean): FlipPage[] {
  const pages: FlipPage[] = [{ kind: 'cover' }, { kind: 'endpaper' }, { kind: 'title' }];
  pages.push(...paginate([{ type: 'h', text: 'Dedication' }, ...ps(dedication.text)], 'Dedication'));
  pages.push(...paginate([{ type: 'h', text: 'Introduction' }, ...ps(introduction.paragraphs)], 'Introduction'));

  for (const ch of chapters) {
    if (!hasAccess && ch.number > 1) {
      pages.push({ kind: 'locked' });
      break;
    }
    if (pages.length % 2 === 1) pages.push({ kind: 'blank' }); // chapters open on a right-hand page
    pages.push({ kind: 'chapter-start', number: ch.number, title: ch.title, summary: ch.summary });
    const header = `Chapter ${ch.number} · ${ch.title}`;
    pages.push(
      ...paginate(
        [
          ...ps(ch.content),
          { type: 'h', text: codeTitle(ch.code.title) },
          ...ch.code.principles.map((text): Block => ({ type: 'principle', text })),
          { type: 'p', text: ch.code.closing },
        ],
        header,
      ),
    );
  }

  if (hasAccess) {
    pages.push(
      ...paginate(
        [
          { type: 'h', text: 'About the Author' },
          ...ps([aboutAuthor.bio, aboutAuthor.extended, aboutAuthor.lineage, aboutAuthor.location, aboutAuthor.closing]),
        ],
        'About the Author',
      ),
    );
  }

  // Back cover must sit on the outside of the final leaf: even page count overall.
  if (pages.length % 2 === 0) pages.push({ kind: 'blank' });
  pages.push({ kind: 'endpaper' }, { kind: 'back-cover' });
  if (pages.length % 2 === 1) pages.splice(pages.length - 2, 0, { kind: 'blank' });
  return pages;
}
