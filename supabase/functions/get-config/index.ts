const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const config = {
    paypalClientId: Deno.env.get('PAYPAL_CLIENT_ID') || '',
    bonusPdfUrl: Deno.env.get('BONUS_PDF_URL') || '',
    productSlug: 'art-of-ism-full-access',
    priceUsd: '9.99',
  };

  return new Response(JSON.stringify(config), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
