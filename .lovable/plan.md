The admin check is working now. The failure is happening after the function logs `generating 5 chunks` and before anything is saved, which strongly points to the narration request timing out or being killed while waiting on the long ElevenLabs audio generation calls.

Plan:

1. **Stop making the browser wait for the full audiobook generation**
   - Change `generate-narration` so clicking **Generate** immediately creates a generation job and returns `queued` instead of holding the request open until all MP3 chunks finish.

2. **Add a narration job table**
   - Store `section_id`, requesting admin, status, progress, error message, output path, and timestamps.
   - Add safe access rules so admins can create/read generation jobs, while the backend can update them.

3. **Process narration in the background**
   - Use the Edge Function background task pattern to generate the chunks, upload the MP3, and update `chapter_narration` after the request has already returned to the app.
   - Add detailed progress/error logging around each audio chunk so the next failure shows the exact ElevenLabs response instead of a generic non-2xx message.

4. **Update the admin UI**
   - After clicking **Generate**, show `Queued` / `Generating` / `Complete` / `Failed` states.
   - Poll the job status every few seconds.
   - Refresh the narration player automatically when the job completes.
   - If generation fails, show the real backend error message instead of only “Edge Function returned a non-2xx status code.”

Technical notes:
- This keeps reader playback unchanged.
- Existing generated narration will still use `chapter_narration` and the `audio` bucket.
- This is the standard fix for long-running media generation because a single browser-triggered function call can time out before audio creation finishes.