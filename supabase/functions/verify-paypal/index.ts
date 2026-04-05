import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "Missing orderId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user from auth header
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

    // Get PayPal access token
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
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

    // Capture the order
    const captureRes = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const captureData = await captureRes.json();

    if (captureData.status !== "COMPLETED") {
      return new Response(JSON.stringify({ error: "Payment not completed", details: captureData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value || "9.99";
    const currency = captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.currency_code || "USD";

    // Use service role to insert purchase and entitlement
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { error: purchaseError } = await supabaseAdmin.from("purchases").insert({
      user_id: user.id,
      provider: "paypal",
      provider_order_id: orderId,
      product_slug: "art-of-ism-full-access",
      amount: parseFloat(amount),
      currency,
      status: "completed",
    });

    if (purchaseError) {
      console.error("Purchase insert error:", purchaseError);
    }

    const { error: entitlementError } = await supabaseAdmin.from("entitlements").upsert({
      user_id: user.id,
      product_slug: "art-of-ism-full-access",
      active: true,
      granted_at: new Date().toISOString(),
    }, { onConflict: "user_id,product_slug" });

    if (entitlementError) {
      console.error("Entitlement upsert error:", entitlementError);
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
