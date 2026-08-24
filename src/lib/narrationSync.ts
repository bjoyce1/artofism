/**
 * Follow-along narration sync.
 *
 * Word-level timestamps are not available for the narration MP3s, so the
 * position of the currently narrated sentence is derived from the real audio
 * duration plus the weight (length) of each sentence, with a small allowance
 * for the pauses a narrator takes at sentence and paragraph ends. This tracks
 * continuous narration closely and never drifts past the end of the chapter,
 * because the weights are normalised against the actual duration.
 */

export interface SyncUnit {
  /** Index of the paragraph in chapter.content this sentence belongs to. */
  paragraph: number;
  /** The sentence text, including its trailing punctuation. */
  text: string;
  /** Relative time weight of this sentence. */
  weight: number;
  /** Cumulative start fraction (0..1) of the narration. */
  start: number;
  /** Cumulative end fraction (0..1) of the narration. */
  end: number;
}

/** Extra weight standing in for the breath a narrator takes. */
const SENTENCE_PAUSE = 6;
const PARAGRAPH_PAUSE = 16;

/** Splits a paragraph into sentences, keeping punctuation attached. */
export function splitSentences(paragraph: string): string[] {
  const parts = paragraph.match(/[^.!?…]+(?:[.!?…]+["'”’)\]]*)?\s*/g) ?? [paragraph];
  const out: string[] = [];
  for (const raw of parts) {
    const piece = raw.replace(/\s+$/, '');
    if (!piece.trim()) continue;
    // Merge stubs (initials, "Mr.", stray punctuation) into the previous piece.
    if (out.length > 0 && piece.trim().length < 3) {
      out[out.length - 1] = `${out[out.length - 1]} ${piece.trim()}`;
      continue;
    }
    out.push(piece);
  }
  return out.length > 0 ? out : [paragraph];
}

/** Builds the normalised timeline of sentences for a chapter's paragraphs. */
export function buildSyncUnits(paragraphs: string[]): SyncUnit[] {
  const raw: Array<Omit<SyncUnit, 'start' | 'end'>> = [];

  paragraphs.forEach((paragraph, pIndex) => {
    const sentences = splitSentences(paragraph);
    sentences.forEach((text, sIndex) => {
      const isLast = sIndex === sentences.length - 1;
      raw.push({
        paragraph: pIndex,
        text,
        weight:
          Math.max(1, text.trim().length) +
          SENTENCE_PAUSE +
          (isLast ? PARAGRAPH_PAUSE : 0),
      });
    });
  });

  const total = raw.reduce((sum, u) => sum + u.weight, 0) || 1;
  let acc = 0;
  return raw.map((u) => {
    const start = acc / total;
    acc += u.weight;
    return { ...u, start, end: acc / total };
  });
}

/** Groups units by paragraph index, preserving their global index. */
export function unitsByParagraph(
  units: SyncUnit[]
): Array<Array<{ index: number; unit: SyncUnit }>> {
  const groups: Array<Array<{ index: number; unit: SyncUnit }>> = [];
  units.forEach((unit, index) => {
    if (!groups[unit.paragraph]) groups[unit.paragraph] = [];
    groups[unit.paragraph].push({ index, unit });
  });
  return groups;
}

/**
 * Index of the sentence being narrated, or -1 when it can't be determined.
 * `offsetSeconds` lets the reader nudge the highlight earlier or later.
 */
export function activeUnitIndex(
  units: SyncUnit[],
  currentTime: number,
  duration: number,
  offsetSeconds = 0
): number {
  if (!units.length || !Number.isFinite(duration) || duration <= 0) return -1;
  const t = currentTime - offsetSeconds;
  if (t <= 0) return 0;
  const fraction = Math.min(0.999999, t / duration);
  // Binary search the normalised timeline.
  let lo = 0;
  let hi = units.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (units[mid].end <= fraction) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
