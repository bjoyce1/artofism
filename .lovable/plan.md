Remove the karaoke-style word-highlighting feature from the chapter reader.

What to change
- ChapterReader.tsx: remove the `KaraokeText` import and the conditional karaoke rendering block (the `isChapterAudioPlaying && duration > 0` branch). Keep the normal paragraph rendering as the only text display path. Keep the audio playback controls (SectionAudioButton, ChapterAudioPlayer) unchanged.
- Delete `src/components/KaraokeText.tsx`.
- Remove the `.karaoke-active` dead CSS rule from `src/index.css`.

What stays
- Section narration audio playback and controls.
- Chapter music player (ChapterAudioPlayer).
- Experience/Read mode toggle and smoke effects.