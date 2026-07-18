// Public analytics ingest. Optionally accepts a user JWT to attach user_id.
// Rate limited per source IP using an in-memory token bucket. Writes with the
// service role so the analytics_events table can enforce strict INSERT RLS.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ALLOWED_EVENTS = new Set([
  "landing_cta_click",
  "free_preview_start",
  "auth_start",
  "magic_link_sent",
  "auth_complete",
  "checkout_rendered",
  "checkout_start",
  "checkout_cancel",
  "checkout_error",
  "chapter_completed",
  "chapter_locked_view",
  "unlock_page_view",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Token bucket: 30 events per minute per IP.
const buckets = new Map<string, { tokens: number; ts: number }>();
const CAPACITY = 30;
const REFILL_PER_MS = CAPACITY / 60000;

function allow(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip) ?? { tokens: CAPACITY, ts: now };
  const refill = (now - b.ts) * REFILL_PER_MS;
  b.tokens = Math.min(CAPACITY, b.tokens + refill);
  b.ts = now;
  if (b.tokens < 1) { buckets.set(ip, b); return false; }
  b.tokens -= 1;
  buckets.set(ip, b);
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!allow(ip)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "bad json" }), { status: 400, headers: corsHeaders });
  }
  const eventName = String(body?.eventName ?? "");
  if (!ALLOWED_EVENTS.has(eventName)) {
    return new Response(JSON.stringify({ error: "event not allowed" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const properties = body?.properties && typeof body.properties === "object" ? body.properties : {};

  // Strip anything that looks like PII from client-supplied props.
  for (const key of Object.keys(properties)) {
    const lower = key.toLowerCase();
    if (lower.includes("email") || lower.includes("order")) delete properties[key];
  }

  let userId: string | null = null;
  const auth = req.headers.get("Authorization");
  if (auth) {
    try {
      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: auth } } },
      );
      const token = auth.replace(/^Bearer\s+/i, "");
      const { data } = await supabaseUser.auth.getClaims(token);
      userId = data?.claims?.sub ?? null;
    } catch { /* anon */ }
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  await admin.from("analytics_events").insert({
    event_name: eventName, user_id: userId, properties,
  });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
