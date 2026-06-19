## Goal

Add the wide gold-accented "MR. CAP NARRATES" player bar (per the attached screenshot) to each chapter, wired to the existing narration audio files in the `audio` bucket (`chapter_NN.mp3`). No backend changes — the files and `useSectionAudio` hook already exist.

## What changes

1. **New component `src/components/ChapterNarrationBar.tsx`**
   - Full-width bar styled to match the screenshot: black surface (`bg-card/80`), 1px gold-dim border top + bottom, gold accents (`#c9a227`), Inter small-caps label.
   - Left: mic glyph + label `MR. CAP NARRATES` (letter-spaced uppercase).
   - Center: round gold play/pause button, current time (mm:ss), seekable progress track (gold fill on muted track with draggable thumb on hover), total duration.
   - Right: speed toggle (1x → 1.25x → 1.5x → 0.75x cycle) and mute/volume button.
   - Uses the existing `useSectionAudio` provider so it shares state with the music player and avoids two audio elements playing at once. Wires `currentTime`/`duration` from context; seek uses `audioRef.current.currentTime`.
   - Source: `supabase.storage.from('audio').getPublicUrl(\`chapter_${nn}.mp3\`)`.
   - Hidden if the file 404s (gracefully fails: `onError` sets a `missing` flag and the bar unmounts).

2. **`src/pages/ChapterReader.tsx`**
   - Replace the small inline `SectionAudioButton` (the "Audiobook" pill at lines 422–429) and the floating narration button block (lines 544–557) with a single `ChapterNarrationBar` mounted as a **sticky bar** directly below the chapter header (inside the main column, `sticky top-16 z-30`), so it's always reachable while reading and visually anchors the chapter.
   - Keep the music `ChapterAudioPlayer` (the small mini-toggle at bottom-left) unchanged.

3. **Styling tokens**
   - Reuse existing tokens: `bg-card`, `border-border`, `text-primary`, `text-muted-foreground`, `font-ui`. No new globals.
   - Tabular-nums for timecodes. Smooth 100ms width transition on the progress fill.

## Out of scope

- No edge function, no ElevenLabs generation (files already in storage).
- No changes to music player, reading-progress tracking, vault, or auth.
- No changes to other pages or to chapters where the file is missing (bar simply hides).

## Verification

- Load `/chapter/1`, confirm the bar matches the screenshot proportions, play/pause works, seek by clicking the track, speed cycles, mute toggles.
- Confirm switching to the music player auto-pauses narration (existing `useSectionAudio` behavior).
- Check `/chapter/N` for N where the mp3 doesn't exist: bar hides instead of erroring.
