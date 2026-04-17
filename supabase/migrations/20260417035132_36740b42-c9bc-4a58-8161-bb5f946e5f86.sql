-- Add unique constraint on purchases.provider_order_id for idempotency.
-- Partial index so NULL order_ids (manual grants) don't collide.
CREATE UNIQUE INDEX IF NOT EXISTS purchases_provider_order_id_unique
  ON public.purchases (provider_order_id)
  WHERE provider_order_id IS NOT NULL;

-- Helpful non-unique index for lookups by user + product.
CREATE INDEX IF NOT EXISTS purchases_user_product_idx
  ON public.purchases (user_id, product_slug);

-- Required for entitlements upsert with onConflict: "user_id,product_slug"
CREATE UNIQUE INDEX IF NOT EXISTS entitlements_user_product_unique
  ON public.entitlements (user_id, product_slug);