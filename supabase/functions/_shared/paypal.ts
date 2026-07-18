// Shared PayPal helpers. Kept in _shared so multiple functions can reuse them
// without duplicating OAuth token handling or base URL logic.

export const PAYPAL_ENV = (Deno.env.get("PAYPAL_ENV") ?? "live").toLowerCase();
export const PAYPAL_API_BASE = PAYPAL_ENV === "sandbox"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

export const PRODUCT_SLUG = "art-of-ism-full-access";
export const PRODUCT_AMOUNT = "9.99";
export const PRODUCT_CURRENCY = "USD";
export const PRODUCT_DESCRIPTION = "The Art of ISM — Full Access";

export async function paypalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const secret = Deno.env.get("PAYPAL_SECRET");
  if (!clientId || !secret) throw new Error("PAYPAL credentials missing");

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("PayPal token exchange failed");
  return data.access_token as string;
}

export const ALLOWED_ORIGINS = [
  "https://theartofism.com",
  "https://www.theartofism.com",
  "https://artofism.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

export function buildCorsHeaders(origin: string | null) {
  let allowOrigin = ALLOWED_ORIGINS[0];
  if (origin) {
    try {
      const host = new URL(origin).hostname;
      if (ALLOWED_ORIGINS.includes(origin) || /\.lovable\.app$/.test(host)) {
        allowOrigin = origin;
      }
    } catch { /* ignore */ }
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}
