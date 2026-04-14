

# Karaoke-Style Word Highlighting for Chapter Audio

## Overview
Add synchronized word-by-word gold highlighting to chapter text as audio plays, with auto-scroll to keep the active word visible.

## Architecture

```text
ElevenLabs API ──► Edge Function ──► Storage (audio bucket)
  (with-timestamps)     │                ├── chapter_01.mp3
                         │                ├── chapter_01_timestamps.json
                         └────────────────├── chapter_02.mp3
                                          └── chapter_02_timestamps.json
                                                    │
                                                    ▼
                              ChapterReader ──► KaraokeText component
                                  │                 ├── Fetches timestamps JSON
                                  │                 ├── Wraps words in <span>
                                  │                 ├── Highlights current word (gold)
                                  └─── Audio ───────└── Auto-scrolls to active word
```

## Steps

### 1. Store ElevenLabs API key as a secret
Use the `add_secret` tool to store `ELEVENLABS_API_KEY` with the provided key so edge functions can access it securely.

### 2. Create `generate-karaoke-audio` edge function
- Accepts `{ chapterNumber }` in the request body
- Reads the chapter text from `bookContent.ts` data (hardcoded in the function or fetched)
- Splits text into chunks at sentence boundaries, respecting the 5,000-character limit
- For each chunk, calls `POST https://api.elevenlabs.io/v1/text-to-speech/{voiceId}/with-timestamps` with model `eleven_multilingual_v2`
- Converts character-level timestamps from the `alignment` response into word-level `{ word, start, end }` objects
- Merges audio (base64 MP3 segments concatenated) and offsets timestamps for each subsequent chunk
- Uploads the final MP3 to `audio/chapter_XX.mp3` (replacing existing files) and the timestamps JSON to `audio/chapter_XX_timestamps.json` in the `audio` storage bucket
- Returns success/failure status

### 3. Create an admin trigger mechanism
- Add a simple admin page or button (protected) that calls the edge function for each chapter sequentially
- Could also be triggered via curl for each chapter number (1–11)
- Also generate for introduction, dedication, about-mrcap, and acknowledgments sections if desired

### 4. Build `KaraokeText` component
- Props: `paragraphs: string[]`, `audioRef: HTMLAudioElement | null`, `isPlaying: boolean`, `timestampsUrl: string`
- On mount, fetches the timestamps JSON from storage
- Flattens all paragraphs into a single word list, maps each word to its timestamp entry
- Renders each paragraph with each word wrapped in a `<span>` with a unique index
- Uses `requestAnimationFrame` loop when playing to:
  - Check `audio.currentTime` against word timestamps
  - Apply gold highlight (`background: rgba(200, 168, 78, 0.35)`, `color: #D4AF37`) to the current word
  - Call `scrollIntoView({ behavior: 'smooth', block: 'center' })` on the active word span
- Clears all highlights when paused/stopped
- Only one word highlighted at a time

### 5. Update `ChapterReader` to use karaoke mode
- When the `SectionAudioButton` is playing for the current chapter, render `KaraokeText` instead of the plain paragraph rendering
- Pass the audio element reference from `useSectionAudio` (needs to be exposed from the context)
- The timestamps URL is constructed as `audio/chapter_XX_timestamps.json` from the storage bucket

### 6. Update `useSectionAudio` hook
- Expose `audioRef` from the context so `KaraokeText` can read `currentTime`
- Add `currentTime` state updated via `timeupdate` event for reactivity

## Technical Details

**ElevenLabs API call per chunk:**
```
POST https://api.elevenlabs.io/v1/text-to-speech/3htg31YmpSA7auH6oqDp/with-timestamps
Headers: { "xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json" }
Body: { "text": "...", "model_id": "eleven_multilingual_v2" }
Response: { "audio_base64": "...", "alignment": { "characters": [...], "character_start_times_seconds": [...], "character_end_times_seconds": [...] } }
```

**Word timestamp format (JSON):**
```json
[
  { "word": "Some", "start": 0.0, "end": 0.23 },
  { "word": "things", "start": 0.23, "end": 0.51 },
  ...
]
```

**Highlight styling:**
- Active word: `background: rgba(200, 168, 78, 0.35); color: #D4AF37; border-radius: 2px; transition: background 0.1s`
- All other words: default text color

**Audio merging approach:** Since ElevenLabs returns base64 MP3 per chunk, the edge function will decode each to binary, concatenate them, and upload as a single MP3. Timestamps for chunk N are offset by the cumulative duration of chunks 0..N-1.

**Edge function timeout consideration:** Processing all chunks for a long chapter may take time. The function processes one chapter per invocation. The admin page calls each chapter sequentially.

