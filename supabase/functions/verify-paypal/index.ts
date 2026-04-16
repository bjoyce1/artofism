import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// Lock CORS to known origins (production + preview + local dev)
const ALLOWED_ORIGINS = [
  "https://theartofism.com",
  "https://www.theartofism.com",
  "https://artofism.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

const buildCorsHeaders = (origin: string | null) => {
  let allowOrigin = ALLOWED_ORIGINS[0];
  if (origin) {
    try {
      const host = new URL(origin).hostname;
      if (ALLOWED_ORIGINS.includes(origin) || /\.lovable\.app$/.test(host)) {
        allowOrigin = origin;
      }
    } catch {
      // ignore malformed origin
    }
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
};

const EXPECTED_AMOUNT = 9.99;
const EXPECTED_CURRENCY = "USD";
const PRODUCT_SLUG = "art-of-ism-full-access";

// PAYPAL_ENV: "sandbox" or "live" (defaults to live for safety in production)
const PAYPAL_ENV = (Deno.env.get("PAYPAL_ENV") ?? "live").toLowerCase();
const PAYPAL_API_BASE = PAYPAL_ENV === "sandbox"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req.headers.get("origin"));

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return new Response(JSON.stringify({ error: "Missing orderId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID")!;
    const paypalSecret = Deno.env.get("PAYPAL_SECRET")!;

    // Verify the user
    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Idempotency: if this order is already recorded, short-circuit success.
    // If it belongs to a different user, refuse with 409.
    const { data: existing } = await supabaseAdmin
      .from("purchases")
      .select("id, user_id, status")
      .eq("provider", "paypal")
      .eq("provider_order_id", orderId)
      .maybeSingle();

    if (existing) {
      if (existing.user_id !== user.id) {
        return new Response(JSON.stringify({ error: "Order already claimed by another account" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (existing.status === "completed") {
        await supabaseAdmin.from("entitlements").upsert({
          user_id: user.id,
          product_slug: PRODUCT_SLUG,
          active: true,
          granted_at: new Date().toISOString(),
        }, { onConflict: "user_id,product_slug" });
        return new Response(JSON.stringify({ success: true, alreadyProcessed: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Get PayPal access token
    const tokenRes = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${btoa(`${paypalClientId}:${paypalSecret}`)}`,
      },
      body: "grant_type=client_credentials",
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return new Response(JSON.stringify({ error: "PayPal auth failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Capture the order with an idempotency key
    const captureRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
        "PayPal-Request-Id": `aoi-capture-${orderId}`,
      },
    });
    const captureData = await captureRes.json();

    // PayPal returns ORDER_ALREADY_CAPTURED on retries — refetch the order to read the capture
    let finalData = captureData;
    if (captureData?.name === "UNPROCESSABLE_ENTITY" &&
        captureData?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED") {
      const getRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      finalData = await getRes.json();
    }

    if (finalData.status !== "COMPLETED") {
      return new Response(JSON.stringify({ error: "Payment not completed", details: finalData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const captureNode = finalData.purchase_units?.[0]?.payments?.captures?.[0];
    const amountStr = captureNode?.amount?.value;
    const currency = captureNode?.amount?.currency_code;
    const amount = parseFloat(amountStr ?? "0");

    // 🔒 Server-side amount/currency check — never trust the client-built order
    if (!Number.isFinite(amount) || amount < EXPECTED_AMOUNT || currency !== EXPECTED_CURRENCY) {
      console.error("Amount/currency mismatch", { orderId, amount, currency });
      return new Response(JSON.stringify({
        error: "Payment amount or currency does not match expected price",
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Upsert purchase row (unique on provider+provider_order_id)
    const { error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .upsert({
        user_id: user.id,
        provider: "paypal",
        provider_order_id: orderId,
        product_slug: PRODUCT_SLUG,
        amount,
        currency,
        status: "completed",
      }, { onConflict: "provider,provider_order_id" });

    if (purchaseError) {
      console.error("Purchase upsert error:", purchaseError);
    }

    const { error: entitlementError } = await supabaseAdmin.from("entitlements").upsert({
      user_id: user.id,
      product_slug: PRODUCT_SLUG,
      active: true,
      granted_at: new Date().toISOString(),
    }, { onConflict: "user_id,product_slug" });

    if (entitlementError) {
      console.error("Entitlement upsert error:", entitlementError);
    }

    // Send purchase confirmation email
    try {
      const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Reader";
      await supabaseAdmin.functions.invoke("send-transactional-email", {
        body: {
          templateName: "purchase-confirmation",
          recipientEmail: user.email,
          idempotencyKey: `purchase-confirm-${orderId}`,
          templateData: { name: userName, amount: amountStr, currency, orderId },
        },
      });
    } catch (emailErr) {
      console.error("Purchase confirmation email error:", emailErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
