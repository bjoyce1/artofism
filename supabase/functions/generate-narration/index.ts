import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_TEXT = 60_000; // generous cap; protects against runaway requests

interface Body {
  sectionId: string;
  text: string;
}

function chunkText(text: string, maxChars = 2200): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?\n]+|\S+$/g) ?? [text];
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length > maxChars && cur) {
      chunks.push(cur.trim());
      cur = s;
    } else {
      cur += s;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function markJobFailed(admin: ReturnType<typeof createClient>, jobId: string, message: string) {
  console.error(`narration job ${jobId} failed`, message);
  await admin
    .from("narration_generation_jobs")
    .update({ status: "failed", error_message: message.slice(0, 1200), completed_at: new Date().toISOString() })
    .eq("id", jobId);
}

async function processNarrationJob(params: {
  admin: ReturnType<typeof createClient>;
  jobId: string;
  sectionId: string;
  text: string;
  voiceId: string;
  elevenKey: string;
}) {
  const { admin, jobId, sectionId, text, voiceId, elevenKey } = params;

  try {
    const chunks = chunkText(text);
    console.log(`job ${jobId}: generating ${chunks.length} chunks, total chars=${text.length}`);
    await admin
      .from("narration_generation_jobs")
      .update({ status: "generating", total_chunks: chunks.length, completed_chunks: 0, error_message: null })
      .eq("id", jobId);

    const parts: Uint8Array[] = [];
    let totalLen = 0;

    for (let i = 0; i < chunks.length; i++) {
      console.log(`job ${jobId}: requesting chunk ${i + 1}/${chunks.length}, chars=${chunks[i].length}`);
      const prev = i > 0 ? chunks[i - 1].slice(-400) : undefined;
      const next = i < chunks.length - 1 ? chunks[i + 1].slice(0, 400) : undefined;
      const ttsRes = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": elevenKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: chunks[i],
            model_id: "eleven_multilingual_v2",
            previous_text: prev,
            next_text: next,
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.8,
              style: 0.35,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!ttsRes.ok) {
        const errTxt = await ttsRes.text().catch(() => "");
        throw new Error(`ElevenLabs chunk ${i + 1}/${chunks.length} failed (${ttsRes.status}): ${errTxt.slice(0, 800)}`);
      }

      const buf = new Uint8Array(await ttsRes.arrayBuffer());
      parts.push(buf);
      totalLen += buf.byteLength;
      await admin
        .from("narration_generation_jobs")
        .update({ completed_chunks: i + 1 })
        .eq("id", jobId);
    }

    const merged = new Uint8Array(totalLen);
    let off = 0;
    for (const p of parts) { merged.set(p, off); off += p.byteLength; }

    const filePath = `narration/${sectionId}.mp3`;
    console.log(`job ${jobId}: uploading ${totalLen} bytes to ${filePath}`);
    const { error: upErr } = await admin.storage.from("audio").upload(filePath, merged, {
      contentType: "audio/mpeg",
      upsert: true,
      cacheControl: "3600",
    });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

    const { error: dbErr } = await admin
      .from("chapter_narration")
      .upsert({
        section_id: sectionId,
        voice_id: voiceId,
        file_path: filePath,
        char_count: text.length,
        updated_at: new Date().toISOString(),
      });
    if (dbErr) throw new Error(`DB write failed: ${dbErr.message}`);

    await admin
      .from("narration_generation_jobs")
      .update({ status: "completed", file_path: filePath, completed_at: new Date().toISOString() })
      .eq("id", jobId);
    console.log(`job ${jobId}: completed`);
  } catch (err) {
    await markJobFailed(admin, jobId, String(err?.message || err));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const voiceId = Deno.env.get("ELEVENLABS_NARRATOR_VOICE_ID");
    const elevenKey = Deno.env.get("ELEVENLABS_API_KEY");

    if (!voiceId) {
      return json({ error: "ELEVENLABS_NARRATOR_VOICE_ID is not set" }, 500);
    }
    if (!elevenKey) {
      return json({ error: "ElevenLabs is not connected" }, 500);
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.error("auth.getUser failed", userErr);
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = userData.user.id;
    console.log("authed user", userId);

    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (roleErr) console.error("has_role err", roleErr);
    console.log("isAdmin", isAdmin);
    if (!isAdmin) {
      return json({ error: "Forbidden" }, 403);
    }

    const body = (await req.json()) as Body;
    if (!body?.sectionId || typeof body.sectionId !== "string" || !/^[a-z0-9-]+$/.test(body.sectionId)) {
      return json({ error: "Invalid sectionId" }, 400);
    }
    if (!body.text || typeof body.text !== "string" || body.text.length < 20 || body.text.length > MAX_TEXT) {
      return json({ error: "Invalid text length" }, 400);
    }

    const chunks = chunkText(body.text);
    const { data: job, error: jobErr } = await admin
      .from("narration_generation_jobs")
      .insert({
        section_id: body.sectionId,
        requested_by: userId,
        status: "queued",
        total_chunks: chunks.length,
        completed_chunks: 0,
      })
      .select("id,status,total_chunks,completed_chunks")
      .single();

    if (jobErr || !job) {
      return json({ error: `Could not queue narration: ${jobErr?.message ?? "Unknown error"}` }, 500);
    }

    EdgeRuntime.waitUntil(processNarrationJob({
      admin,
      jobId: job.id,
      sectionId: body.sectionId,
      text: body.text,
      voiceId,
      elevenKey,
    }));

    return json({
      ok: true,
      status: "queued",
      jobId: job.id,
      sectionId: body.sectionId,
      chunks: chunks.length,
    });
  } catch (err) {
    return json({ error: String(err?.message || err) }, 500);
  }
});
