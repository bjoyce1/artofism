## Goal

Add lifelike voice narration (Mr. CAP's cloned ElevenLabs voice) to the Introduction and every chapter. Audio is generated once per section by an owner-only admin button, cached as MP3 in the `audio` Cloud bucket, and played through a new sticky narration bar at the top of the reading view.

## What gets built

### 1. Admin role (server-trusted)
- New `app_role` enum (`admin`, `user`) and `public.user_roles` table with `has_role()` security-definer function, following the project's user-roles pattern.
- Seed your account (`nsanders2009@gmail.com`) as `admin` in the same migration.
- Front-end `useIsAdmin()` hook reads via `has_role`.

### 2. Narration storage
- Reuse the existing public `audio` bucket.
- Naming convention: `narration/introduction.mp3`, `narration/chapter-01.mp3` … `chapter-11.mp3`.
- A `chapter_narration` table tracks `{ section_id, voice_id, duration_seconds, file_path, generated_at, char_count }` so the player knows what exists without probing storage.

### 3. ElevenLabs generation edge function
- `supabase/functions/generate-narration/index.ts` (verify_jwt on; gated by `has_role(auth.uid(), 'admin')`).
- Input: `{ sectionId: "introduction" | "chapter-1" … "chapter-11" }`.
- Server pulls the canonical text from a shared module (`supabase/functions/_shared/narrationText.ts`) mirroring `src/data/bookContent.ts` so the client never sends prose.
- Splits text into ~400-word chunks at sentence boundaries; calls `https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128` with `eleven_multilingual_v2`, request-stitching (`previous_text` / `next_text`) for prosody continuity, and the supplied `voice_id`.
- Concatenates MP3 chunks (binary append — MP3 frames are concat-safe), uploads to the `audio` bucket via service role with `upsert: true`, then upserts the `chapter_narration` row.
- Voice ID lives in a new secret `ELEVENLABS_NARRATOR_VOICE_ID` you set after cloning. Default-safe: if missing, function returns a clear error.

### 4. Admin "Generate narration" button
- Small gold-bordered control rendered only when `useIsAdmin()` is true, placed inside `IntroductionLayout` and `ChapterReader` near the section title.
- States: idle → "Generate narration", running → spinner + "Generating… (~30–60s)", success → "Regenerate" plus generated-at timestamp, error → toast with message.
- One click per section. No bulk action.

### 5. New narration bar (reader UI)
- New component `ChapterNarrationBar.tsx` rendered at the top of `ChapterReader` and `IntroductionLayout`, beneath the chapter title, sticky on scroll (`sticky top-0 z-40`) with site-matching styling: bg `#0a0a0a/95` + backdrop blur, top/bottom borders `#3a352a`, gold accents `#c9a227`.
- Controls: play/pause, progress scrubber, current/total time, 0.85× / 1× / 1.25× / 1.5× speed toggle, mute, and a tiny "MR. CAP NARRATES" label in small-caps Inter.
- Audio element loads the public URL from `chapter_narration.file_path`. If no row exists for that section, the bar renders a quiet line: "Narration coming soon" (and nothing else) for non-admins, or the Generate button for admins.
- Independent of the existing music player and `SectionAudioButton` — pausing one does NOT auto-pause the other, but starting narration mutes the music player (and vice versa) via a small shared `useExclusiveAudio` hook to avoid overlap.

### 6. Remove the legacy `SectionAudioButton` for chapters/intro
- Replaced by the new bar in those views to avoid two competing audio surfaces. Hero/About sections keep `SectionAudioButton` unchanged.

### 7. Signed-out / non-owner behaviour
- Non-owners of the book see no narration bar (same gating as chapter content).
- Owners always see the bar; non-admins never see the Generate control.

## Out of scope (not in this plan)
- Per-paragraph highlighting / karaoke sync.
- Downloadable MP3s for users.
- Background music ducking under narration.
- Live streaming TTS (we explicitly chose pre-generate).

## Setup you'll do
1. Clone your voice at elevenlabs.io and copy the Voice ID.
2. After this ships, I'll request `ELEVENLABS_NARRATOR_VOICE_ID` via the secret tool; you paste it.
3. Open each chapter once and click "Generate narration". The first generation per chapter takes ~30–60s; after that every reader gets instant playback from the cached MP3.

## Files touched
- New: migration (roles + narration table + grants + RLS), `supabase/functions/generate-narration/index.ts`, `supabase/functions/_shared/narrationText.ts`, `src/hooks/useIsAdmin.ts`, `src/hooks/useExclusiveAudio.ts`, `src/components/ChapterNarrationBar.tsx`, `src/components/AdminGenerateNarrationButton.tsx`.
- Edited: `src/components/IntroductionLayout.tsx`, `src/pages/ChapterReader.tsx`, `src/integrations/supabase/types.ts` (auto).

## Verification
- Migration runs and `has_role` returns true for your seeded admin row.
- Edge function deploys; calling it with a non-admin JWT returns 403, with admin returns 200 and the row appears in `chapter_narration`.
- Opening a chapter as owner shows the bar; clicking play streams the stored MP3 with the speed controls working.
- Music player and narration bar do not overlap.