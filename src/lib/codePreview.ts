import { allCodes } from '@/data/bookContent';

// Chapter 1's code is available in the free chapter. The teaser lists paid codes only.
export const codePreviewTitles = allCodes
  .filter(code => code.chapterNumber !== 1)
  .map(({ chapterNumber, title }) => ({ chapterNumber, title }));