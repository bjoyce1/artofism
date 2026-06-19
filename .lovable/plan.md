Improve narration audio quality by upgrading the TTS model and tuning voice settings for better pacing and pronunciation. No UI changes.

## Changes to `supabase/functions/generate-narration/index.ts`

1. **Switch model** from `eleven_multilingual_v2` to `eleven_turbo_v2_5` (higher fidelity on long-form, better pacing, supports request stitching). If pronunciation issues persist, we can later switch to `eleven_multilingual_v2` per-voice — but turbo v2.5 is the recommended narration model.
2. **Retune voice settings** for natural narration:
   - `stability: 0.45` (was 0.55) — slightly more expressive, less monotone
   - `similarity_boost: 0.85` (was 0.8)
   - `style: 0.15` (was 0.35) — lower style avoids over-acting and mispronunciations
   - `use_speaker_boost: true`
   - add `speed: 0.95` for a calmer, audiobook-like cadence
3. **Smaller chunks for better prosody**: reduce `maxChars` from 2200 → 1400 and split on paragraph breaks first, then sentences. This gives ElevenLabs cleaner prosodic units and smoother stitched seams.
4. **Better text preprocessing** before TTS:
   - Normalize curly quotes/em-dashes
   - Expand common abbreviations (Mr. → Mister, ISM stays as-is, etc.)
   - Convert "..." to a real ellipsis "…" and ensure a space after for natural pause
   - Collapse multiple blank lines to a single paragraph break
5. **Keep request stitching** (`previous_text` / `next_text`) which is already in place — but pass full adjacent chunks (capped at 600 chars) instead of 400 for stronger context.

## Deploy & test

- Redeploy `generate-narration`.
- On the live chapter, click **Regenerate** as admin and listen to the new output.

## Notes

- No frontend changes; the player, polling, and storage path stay the same.
- Old MP3 in `narration/chapter-1.mp3` will be overwritten by the regenerate action.
- If you'd later like a different narrator voice, we'd only need to update the `ELEVENLABS_NARRATOR_VOICE_ID` secret — no code change required.
