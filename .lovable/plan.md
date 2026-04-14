

## Problem

The chapter pages have two separate audio controls — a **narration/audiobook button** (SectionAudioButton, small icon-only circle) and a **music/song player** (ChapterAudioPlayer, floating bottom-left pill). Both look similar and have no clear labels, especially on mobile where the song button just says "Play."

## Plan

### 1. Label the narration button clearly

Update `SectionAudioButton` usage in `ChapterReader.tsx` to include a visible text label. Instead of a bare icon circle next to the title, render it as a labeled pill button saying **"Audiobook"** (or **"Narrate"**) with the volume/pause icon beside it. This makes it immediately obvious it's for the spoken narration.

### 2. Label the music player clearly

Update `ChapterAudioPlayer.tsx` collapsed state:
- Change the mobile label from generic "Play" to **"Song"** or the song title truncated
- Add a `Music` icon (already imported) next to the label for visual distinction
- Keep the album art thumbnail as an additional differentiator

### 3. Visual differentiation

- **Narration button**: Use a slightly different accent color or border style (e.g., muted/subtle styling with a `BookOpen` or `Mic` icon + "Audiobook" text label)
- **Music player**: Keep the current primary/gold accent with album art + `Music` icon + song title

### 4. Mobile-specific improvements

- Ensure both controls don't overlap on small screens (narration near the header, music at bottom-left)
- The narration button in the header area gets a text label visible at all breakpoints
- The collapsed music pill shows the song title (truncated) instead of just "Play"

### Files to modify

- `src/pages/ChapterReader.tsx` — Replace the bare `SectionAudioButton` with a labeled version (e.g., wrap with text "Audiobook")
- `src/components/SectionAudioButton.tsx` — Add optional `label` prop to display text beside the icon
- `src/components/ChapterAudioPlayer.tsx` — Change mobile collapsed text from "Play" to song title, add Music icon for clarity

