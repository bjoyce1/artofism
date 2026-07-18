// Public analytics ingest. Optionally accepts a user JWT to attach user_id.
// Rate limited per source IP using an in-memory token bucket. Writes with the
// service role so the analytics_events table can enforce strict INSERT RLS.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { ALLOWED_ORIGINS } from "../_shared/paypal.ts";

const ALLOWED_EVENTS = new Set([
  // planned funnel events
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
  "chapter_open",
  // in-use events already shipped
  "library_enter",
  "pdf_download",
  "checkout_success",
  "checkout_success_view",
  "entitlement_confirmed",
  "chapter_locked_view",
  "unlock_page_view",
  "get_book_click",
]);

const CAPACITY = 30;
const REFILL_PER_MS = CAPACITY / 60000;
const buckets = new Map<string, { tokens: number; ts: number }>();
function allow(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip) ?? { tokens: CAPACITY, ts: now };
  b.tokens = Math.min(CAPACITY, b.tokens + (now - b.ts) * REFILL_PER_MS);
  b.ts = now;
  if (b.tokens < 1) { buckets.set(ip, b); return false; }
  b.tokens -= 1; buckets.set(ip, b); return true;
}

const MAX_BODY_BYTES = 4096;
const MAX_PROPS = 20;
const MAX_STRING = 200;
const PII_KEY_RE = /email|order|token|secret|password|address|phone|ssn|cardnum|cc[-_ ]?num|dob/i;

function scrub(value: unknown, depth = 0): unknown {
  if (depth > 3) return null;
  if (value === null) return null;
  if (typeof value === "string") return value.length > MAX_STRING ? value.slice(0, MAX_STRING) : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) return value.slice(0, 10).map((v) => scrub(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    let n = 0;
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (n >= MAX_PROPS) break;
      if (PII_KEY_RE.test(k)) continue;
      out[k] = scrub(v, depth + 1);
      n++;
    }
    return out;
  }
  return null;
}

function buildCors(origin: string | null) {
  let allowOrigin = ALLOWED_ORIGINS[0];
  if (origin) {
    try {
      const host = new URL(origin).hostname;
      if (ALLOWED_ORIGINS.includes(origin) || /\.lovable\.app$/.test(host)) allowOrigin = origin;
    } catch { /* ignore */ }
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

Deno.serve(async (req) => {
  const cors = buildCors(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (!allow(ip)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ error: "payload too large" }), {
      status: 413, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  let body: { eventName?: unknown; properties?: unknown };
  try { body = JSON.parse(raw); } catch {
    return new Response(JSON.stringify({ error: "bad json" }), { status: 400, headers: cors });
  }
  const eventName = String(body?.eventName ?? "");
  if (!ALLOWED_EVENTS.has(eventName)) {
    return new Response(JSON.stringify({ error: "event not allowed" }), {
      status: 400, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
  const scrubbed = (typeof body?.properties === "object" && body.properties)
    ? scrub(body.properties) as Record<string, unknown>
    : {};

  let userId: string | null = null;
  const auth = req.headers.get("Authorization");
  if (auth) {
    try {
      const supabaseUser = createClient(
        Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: auth } } },
      );
      const token = auth.replace(/^Bearer\s+/i, "");
      const { data } = await supabaseUser.auth.getClaims(token);
      userId = data?.claims?.sub ?? null;
    } catch { /* anon */ }
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { error } = await admin.from("analytics_events").insert({
    event_name: eventName, user_id: userId, properties: scrubbed,
  });
  if (error) {
    console.error("analytics insert error", error);
    return new Response(JSON.stringify({ error: "insert failed" }), {
      status: 500, headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...cors, "Content-Type": "application/json" },
  });
});
