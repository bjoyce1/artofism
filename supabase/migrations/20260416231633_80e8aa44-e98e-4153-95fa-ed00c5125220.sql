-- Prevent duplicate purchase rows for the same PayPal order
CREATE UNIQUE INDEX IF NOT EXISTS purchases_provider_order_id_unique
  ON public.purchases (provider, provider_order_id)
  WHERE provider_order_id IS NOT NULL;