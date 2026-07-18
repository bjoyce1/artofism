// Verify + capture + atomically persist a PayPal order. Only returns success
// after the finalize_paypal_purchase RPC commits and an entitlement lookup
// confirms the buyer's access is active. Never log-and-continue.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  buildCorsHeaders,
  paypalAccessToken,
  PAYPAL_API_BASE,
  PRODUCT_AMOUNT,
  PRODUCT_CURRENCY,
  PRODUCT_SLUG,
} from "../_shared/paypal.ts";

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return new Response(JSON.stringify({ error: "Missing orderId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claimsData, error: claimsErr } = await supabaseUser.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;
    const userEmail = claimsData?.claims?.email ?? null;
    if (claimsErr || !userId) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Idempotency: if this order is already recorded and completed for this user
    // AND the entitlement is active, short-circuit success.
    const { data: existing } = await supabaseAdmin
      .from("purchases")
      .select("id, user_id, status")
      .eq("provider", "paypal")
      .eq("provider_order_id", orderId)
      .maybeSingle();

    if (existing && existing.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Order already claimed by another account" }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (existing?.status === "completed") {
      const { data: ent } = await supabaseAdmin
        .from("entitlements")
        .select("active")
        .eq("user_id", userId)
        .eq("product_slug", PRODUCT_SLUG)
        .maybeSingle();
      if (ent?.active) {
        await logServerEvent(supabaseAdmin, "purchase_confirmed", userId, { idempotent: true });
        return new Response(JSON.stringify({ success: true, alreadyProcessed: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const accessToken = await paypalAccessToken();

    // 1. Fetch the order and validate BEFORE capturing.
    const getRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const orderData = await getRes.json();
    if (!getRes.ok) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const unit = orderData?.purchase_units?.[0];
    const preAmount = unit?.amount?.value;
    const preCurrency = unit?.amount?.currency_code;
    const preCustomId = unit?.custom_id ?? unit?.reference_id;
    if (
      preAmount !== PRODUCT_AMOUNT ||
      preCurrency !== PRODUCT_CURRENCY ||
      preCustomId !== userId ||
      !["APPROVED", "COMPLETED"].includes(orderData.status)
    ) {
      console.error("pre-capture validation failed", {
        orderId, preAmount, preCurrency, preCustomId, status: orderData.status, userId,
      });
      return new Response(JSON.stringify({ error: "Order validation failed" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Capture the order (idempotent via PayPal-Request-Id).
    const captureRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": `aoi-capture-${orderId}`,
      },
    });
    let finalData = await captureRes.json();
    if (finalData?.name === "UNPROCESSABLE_ENTITY" &&
        finalData?.details?.[0]?.issue === "ORDER_ALREADY_CAPTURED") {
      const re = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      finalData = await re.json();
    }
    if (finalData.status !== "COMPLETED") {
      return new Response(JSON.stringify({ error: "Payment not completed" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Re-validate the capture.
    const capNode = finalData.purchase_units?.[0]?.payments?.captures?.[0];
    const capAmount = capNode?.amount?.value;
    const capCurrency = capNode?.amount?.currency_code;
    const capId = capNode?.id;
    if (capAmount !== PRODUCT_AMOUNT || capCurrency !== PRODUCT_CURRENCY) {
      console.error("post-capture validation failed", { orderId, capAmount, capCurrency });
      return new Response(JSON.stringify({ error: "Capture amount mismatch" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payerEmail = finalData?.payer?.email_address ?? null;

    // 4. Atomically persist purchase + entitlement.
    const { data: finRow, error: finErr } = await supabaseAdmin.rpc("finalize_paypal_purchase", {
      _user_id: userId,
      _order_id: orderId,
      _amount: Number(PRODUCT_AMOUNT),
      _currency: PRODUCT_CURRENCY,
      _payer_email: payerEmail,
      _capture_id: capId,
      _raw: finalData,
    });
    if (finErr) {
      console.error("finalize_paypal_purchase failed", finErr);
      return new Response(JSON.stringify({ error: "Failed to record purchase" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Confirm entitlement really is active before returning success.
    const { data: ent, error: entErr } = await supabaseAdmin
      .from("entitlements")
      .select("active")
      .eq("user_id", userId)
      .eq("product_slug", PRODUCT_SLUG)
      .maybeSingle();
    if (entErr || !ent?.active) {
      console.error("entitlement confirmation failed", { entErr, ent });
      return new Response(JSON.stringify({ error: "Entitlement not active after purchase" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Fire-and-forget confirmation email + server-authored analytics.
    (async () => {
      try {
        if (userEmail) {
          await supabaseAdmin.functions.invoke("send-transactional-email", {
            body: {
              templateName: "purchase-confirmation",
              recipientEmail: userEmail,
              idempotencyKey: `purchase-confirm-${orderId}`,
              templateData: { name: userEmail.split("@")[0], amount: PRODUCT_AMOUNT, currency: PRODUCT_CURRENCY, orderId },
            },
          });
        }
      } catch (e) { console.error("purchase email error", e); }
    })();
    await logServerEvent(supabaseAdmin, "purchase_confirmed", userId, {});

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("verify-paypal error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});

async function logServerEvent(supabase: any, name: string, userId: string | null, props: Record<string, unknown>) {
  try {
    await supabase.from("analytics_events").insert({
      event_name: name, user_id: userId, properties: props,
    });
  } catch (e) { console.error("analytics insert failed", e); }
}
