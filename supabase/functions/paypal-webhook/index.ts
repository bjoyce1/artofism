// PayPal webhook receiver. Verifies signatures against PayPal's REST API
// using PAYPAL_WEBHOOK_ID before mutating any data. Reconciles completed
// captures and revokes entitlements on refund/reversal/denial/dispute.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  paypalAccessToken,
  PAYPAL_API_BASE,
  PRODUCT_AMOUNT,
  PRODUCT_CURRENCY,
} from "../_shared/paypal.ts";

const REVOKE_EVENTS = new Set([
  "PAYMENT.CAPTURE.REFUNDED",
  "PAYMENT.CAPTURE.REVERSED",
  "PAYMENT.CAPTURE.DENIED",
  "CUSTOMER.DISPUTE.CREATED",
]);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID not configured");
    return new Response(JSON.stringify({ error: "Webhook not configured" }), { status: 503 });
  }

  const raw = await req.text();
  let event: any;
  try { event = JSON.parse(raw); } catch {
    return new Response("bad json", { status: 400 });
  }

  const h = req.headers;
  const verifyBody = {
    auth_algo: h.get("paypal-auth-algo"),
    cert_url: h.get("paypal-cert-url"),
    transmission_id: h.get("paypal-transmission-id"),
    transmission_sig: h.get("paypal-transmission-sig"),
    transmission_time: h.get("paypal-transmission-time"),
    webhook_id: webhookId,
    webhook_event: event,
  };
  for (const [k, v] of Object.entries(verifyBody)) {
    if (v === null || v === undefined) {
      console.warn("missing header", k);
      return new Response("missing signature headers", { status: 400 });
    }
  }

  try {
    const accessToken = await paypalAccessToken();
    const verifyRes = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(verifyBody),
    });
    const verifyData = await verifyRes.json();
    if (verifyData.verification_status !== "SUCCESS") {
      console.error("webhook signature verification failed", verifyData);
      return new Response("invalid signature", { status: 401 });
    }
  } catch (e) {
    console.error("webhook verify error", e);
    return new Response("verification error", { status: 500 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const eventType: string = event.event_type;
  const resource = event.resource ?? {};
  // Order id may live in different places depending on event.
  const orderId: string | undefined =
    resource?.supplementary_data?.related_ids?.order_id ??
    resource?.custom_id ??
    resource?.invoice_id ??
    resource?.id;

  try {
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const userId = resource?.custom_id;
      const amount = resource?.amount?.value;
      const currency = resource?.amount?.currency_code;
      if (userId && amount === PRODUCT_AMOUNT && currency === PRODUCT_CURRENCY && orderId) {
        await supabaseAdmin.rpc("finalize_paypal_purchase", {
          _user_id: userId,
          _order_id: orderId,
          _amount: Number(amount),
          _currency: currency,
          _payer_email: null,
          _capture_id: resource.id,
          _raw: event,
        });
        await supabaseAdmin.from("analytics_events").insert({
          event_name: "purchase_confirmed", user_id: userId, properties: { source: "webhook" },
        });
      }
    } else if (REVOKE_EVENTS.has(eventType) && orderId) {
      await supabaseAdmin.rpc("revoke_entitlement_by_order", {
        _order_id: orderId, _reason: eventType.toLowerCase(),
      });
      await supabaseAdmin.from("analytics_events").insert({
        event_name: "entitlement_revoked", user_id: null, properties: { orderId, reason: eventType },
      });
    }
  } catch (e) {
    console.error("webhook handler error", e);
    return new Response("handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
