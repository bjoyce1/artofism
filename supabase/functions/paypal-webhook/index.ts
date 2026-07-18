// PayPal webhook receiver. Verifies signatures against PayPal's REST API
// using PAYPAL_WEBHOOK_ID before mutating any data. Every DB call is
// checked; any reconciliation failure returns a non-2xx so PayPal retries.
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

// Dispute resolution outcomes that mean the buyer got their money back → stay revoked.
const DISPUTE_BUYER_WIN = new Set([
  "RESOLVED_BUYER_FAVOUR",
  "RESOLVED_WITH_REFUND",
]);
// Dispute resolution outcomes where the merchant kept the money → reinstate.
const DISPUTE_MERCHANT_WIN = new Set([
  "RESOLVED_SELLER_FAVOUR",
  "RESOLVED_WITH_PAYOUT",
  "CANCELED_BY_BUYER",
  "DENIED",
]);

function jsonRes(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status, headers: { "Content-Type": "application/json" },
  });
}

async function resolveOrderId(admin: any, resource: any): Promise<string | undefined> {
  // Preferred: documented related_ids path for payment resources.
  const related = resource?.supplementary_data?.related_ids?.order_id;
  if (related) return related;

  // Dispute resources: pull the disputed capture id from documented paths, then
  // resolve to an order id via the purchases we recorded at capture time.
  const disputedTxns: any[] = resource?.disputed_transactions ?? [];
  for (const t of disputedTxns) {
    const cid = t?.seller_transaction_id ?? t?.capture_id;
    if (cid) {
      const { data } = await admin.rpc("order_id_for_capture", { _capture_id: cid });
      if (data) return data as string;
    }
  }
  return undefined;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const webhookId = Deno.env.get("PAYPAL_WEBHOOK_ID");
  if (!webhookId) {
    console.error("PAYPAL_WEBHOOK_ID not configured");
    return jsonRes(503, { error: "Webhook not configured" });
  }

  const raw = await req.text();
  let event: any;
  try { event = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }

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
    if (v === null || v === undefined) return new Response(`missing header ${k}`, { status: 400 });
  }

  try {
    const accessToken = await paypalAccessToken();
    const verifyRes = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(verifyBody),
    });
    const verifyData = await verifyRes.json();
    if (verifyData.verification_status !== "SUCCESS") {
      console.error("webhook signature verification failed", verifyData);
      return new Response("invalid signature", { status: 401 });
    }
  } catch (e) {
    console.error("webhook verify error", e);
    return jsonRes(500, { error: "verification error" });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const eventType: string = event.event_type;
  const resource = event.resource ?? {};

  try {
    if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
      const orderId = await resolveOrderId(supabaseAdmin, resource);
      const userId = resource?.custom_id;
      const amount = resource?.amount?.value;
      const currency = resource?.amount?.currency_code;
      if (!userId || amount !== PRODUCT_AMOUNT || currency !== PRODUCT_CURRENCY || !orderId) {
        console.warn("capture.completed ignored (missing/invalid fields)", { orderId, userId, amount, currency });
        return jsonRes(200, { ok: true, ignored: true });
      }
      const { error: rpcErr } = await supabaseAdmin.rpc("finalize_paypal_purchase", {
        _user_id: userId, _order_id: orderId, _amount: Number(amount), _currency: currency,
        _payer_email: null, _capture_id: resource.id, _raw: event,
      });
      if (rpcErr) { console.error("finalize rpc failed", rpcErr); return jsonRes(500, { error: "finalize failed" }); }
      const { error: aErr } = await supabaseAdmin.from("analytics_events").insert({
        event_name: "purchase_confirmed", user_id: userId, properties: { source: "webhook" },
      });
      if (aErr) console.error("analytics insert failed (non-fatal)", aErr);
      return jsonRes(200, { ok: true });
    }

    if (REVOKE_EVENTS.has(eventType)) {
      const orderId = await resolveOrderId(supabaseAdmin, resource);
      if (!orderId) { console.warn("revoke event without resolvable order id", eventType); return jsonRes(200, { ok: true, ignored: true }); }
      const { error: rErr } = await supabaseAdmin.rpc("revoke_entitlement_by_order", {
        _order_id: orderId, _reason: eventType.toLowerCase(),
      });
      if (rErr) { console.error("revoke rpc failed", rErr); return jsonRes(500, { error: "revoke failed" }); }
      const { error: aErr } = await supabaseAdmin.from("analytics_events").insert({
        event_name: "entitlement_revoked", user_id: null, properties: { orderId, reason: eventType },
      });
      if (aErr) console.error("analytics insert failed (non-fatal)", aErr);
      return jsonRes(200, { ok: true });
    }

    if (eventType === "CUSTOMER.DISPUTE.RESOLVED") {
      const outcome: string = resource?.dispute_outcome?.outcome_code ?? resource?.status ?? "";
      const orderId = await resolveOrderId(supabaseAdmin, resource);
      if (!orderId) { console.warn("dispute.resolved without resolvable order id"); return jsonRes(200, { ok: true, ignored: true }); }

      if (DISPUTE_MERCHANT_WIN.has(outcome)) {
        const { error: rErr } = await supabaseAdmin.rpc("reactivate_entitlement_by_order", { _order_id: orderId });
        if (rErr) { console.error("reactivate rpc failed", rErr); return jsonRes(500, { error: "reactivate failed" }); }
      } else if (DISPUTE_BUYER_WIN.has(outcome)) {
        const { error: rErr } = await supabaseAdmin.rpc("revoke_entitlement_by_order", {
          _order_id: orderId, _reason: "customer.dispute.resolved:" + outcome.toLowerCase(),
        });
        if (rErr) { console.error("revoke rpc failed", rErr); return jsonRes(500, { error: "revoke failed" }); }
      }
      const { error: aErr } = await supabaseAdmin.from("analytics_events").insert({
        event_name: "dispute_resolved", user_id: null, properties: { orderId, outcome },
      });
      if (aErr) console.error("analytics insert failed (non-fatal)", aErr);
      return jsonRes(200, { ok: true });
    }

    return jsonRes(200, { ok: true, ignored: eventType });
  } catch (e) {
    console.error("webhook handler error", e);
    return jsonRes(500, { error: "handler error" });
  }
});
