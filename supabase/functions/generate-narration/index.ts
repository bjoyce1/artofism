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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const voiceId = Deno.env.get("ELEVENLABS_NARRATOR_VOICE_ID");
    const elevenKey = Deno.env.get("ELEVENLABS_API_KEY");

    if (!voiceId) {
      return new Response(JSON.stringify({ error: "ELEVENLABS_NARRATOR_VOICE_ID is not set" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!elevenKey) {
      return new Response(JSON.stringify({ error: "ElevenLabs is not connected" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.error("auth.getUser failed", userErr);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;
    console.log("authed user", userId);

    const { data: isAdmin, error: roleErr } = await admin.rpc("has_role", { _user_id: userId, _role: "admin" });
    if (roleErr) console.error("has_role err", roleErr);
    console.log("isAdmin", isAdmin);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    if (!body?.sectionId || typeof body.sectionId !== "string" || !/^[a-z0-9-]+$/.test(body.sectionId)) {
      return new Response(JSON.stringify({ error: "Invalid sectionId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body.text || typeof body.text !== "string" || body.text.length < 20 || body.text.length > MAX_TEXT) {
      return new Response(JSON.stringify({ error: "Invalid text length" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const chunks = chunkText(body.text);
    const parts: Uint8Array[] = [];
    let totalLen = 0;

    for (let i = 0; i < chunks.length; i++) {
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
        return new Response(JSON.stringify({ error: `ElevenLabs failed (${ttsRes.status}): ${errTxt.slice(0, 400)}` }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const buf = new Uint8Array(await ttsRes.arrayBuffer());
      parts.push(buf);
      totalLen += buf.byteLength;
    }

    const merged = new Uint8Array(totalLen);
    let off = 0;
    for (const p of parts) { merged.set(p, off); off += p.byteLength; }

    const filePath = `narration/${body.sectionId}.mp3`;
    const { error: upErr } = await admin.storage.from("audio").upload(filePath, merged, {
      contentType: "audio/mpeg",
      upsert: true,
      cacheControl: "3600",
    });
    if (upErr) {
      return new Response(JSON.stringify({ error: `Upload failed: ${upErr.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: dbErr } = await admin
      .from("chapter_narration")
      .upsert({
        section_id: body.sectionId,
        voice_id: voiceId,
        file_path: filePath,
        char_count: body.text.length,
        updated_at: new Date().toISOString(),
      });
    if (dbErr) {
      return new Response(JSON.stringify({ error: `DB write failed: ${dbErr.message}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: pub } = admin.storage.from("audio").getPublicUrl(filePath);

    return new Response(JSON.stringify({
      ok: true,
      sectionId: body.sectionId,
      filePath,
      publicUrl: pub.publicUrl,
      chunks: chunks.length,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err?.message || err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
