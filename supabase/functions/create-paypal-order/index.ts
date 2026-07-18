// Server-side PayPal Orders v2 creation. The browser must never define the
// amount or currency. This function ensures every checkout order is exactly
// $9.99 USD for the lifetime access product and is tagged with the buyer's
// user id so verify-paypal can validate ownership before capture.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  buildCorsHeaders,
  paypalAccessToken,
  PAYPAL_API_BASE,
  PRODUCT_AMOUNT,
  PRODUCT_CURRENCY,
  PRODUCT_DESCRIPTION,
  PRODUCT_SLUG,
} from "../_shared/paypal.ts";

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseUser = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace(/^Bearer\s+/i, "");
    const { data: claims, error: claimsErr } = await supabaseUser.auth.getClaims(token);
    const userId = claims?.claims?.sub;
    if (claimsErr || !userId) {
      return new Response(JSON.stringify({ error: "Invalid session" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await paypalAccessToken();
    const createRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "PayPal-Request-Id": `aoi-create-${userId}-${crypto.randomUUID()}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: PRODUCT_SLUG,
          description: PRODUCT_DESCRIPTION,
          custom_id: userId,
          amount: { currency_code: PRODUCT_CURRENCY, value: PRODUCT_AMOUNT },
        }],
        application_context: {
          brand_name: "The Art of ISM",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
        },
      }),
    });
    const createData = await createRes.json();
    if (!createRes.ok || !createData.id) {
      console.error("create-paypal-order failed", createData);
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ orderId: createData.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-paypal-order error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
