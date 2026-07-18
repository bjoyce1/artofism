
-- 1. New columns
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS capture_id text;
CREATE INDEX IF NOT EXISTS purchases_capture_id_idx ON public.purchases(capture_id) WHERE capture_id IS NOT NULL;

ALTER TABLE public.entitlements ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'purchase';
-- Mark existing rows without a matching purchase as complimentary so refunds don't revoke them.
UPDATE public.entitlements e
   SET source = 'complimentary'
 WHERE source = 'purchase'
   AND NOT EXISTS (
     SELECT 1 FROM public.purchases p
      WHERE p.user_id = e.user_id
        AND p.product_slug = e.product_slug
        AND p.status = 'completed'
   );

-- 2. finalize_paypal_purchase: strict, idempotent, atomic
CREATE OR REPLACE FUNCTION public.finalize_paypal_purchase(
  _user_id uuid, _order_id text, _amount numeric, _currency text,
  _payer_email text, _capture_id text, _raw jsonb
) RETURNS TABLE(entitlement_active boolean, purchase_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_purchase_id uuid;
  v_existing_user uuid;
BEGIN
  IF _user_id IS NULL OR _order_id IS NULL THEN
    RAISE EXCEPTION 'missing required arguments';
  END IF;

  -- Enforce fixed product/price server-side; ignore caller-supplied amount/currency.
  IF _amount IS DISTINCT FROM 9.99 OR _currency IS DISTINCT FROM 'USD' THEN
    RAISE EXCEPTION 'amount/currency mismatch: expected 9.99 USD, got % %', _amount, _currency;
  END IF;

  -- Verify the user really exists in auth.users.
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id) THEN
    RAISE EXCEPTION 'unknown user %', _user_id;
  END IF;

  -- Reject an existing order owned by a different user (idempotency safety).
  SELECT user_id INTO v_existing_user
    FROM public.purchases
   WHERE provider = 'paypal' AND provider_order_id = _order_id
   LIMIT 1;
  IF v_existing_user IS NOT NULL AND v_existing_user <> _user_id THEN
    RAISE EXCEPTION 'order % already claimed by another user', _order_id;
  END IF;

  INSERT INTO public.purchases (
    user_id, provider, provider_order_id, product_slug, amount, currency, status, capture_id
  ) VALUES (
    _user_id, 'paypal', _order_id, 'art-of-ism-full-access', 9.99, 'USD', 'completed', _capture_id
  )
  ON CONFLICT (provider, provider_order_id) WHERE provider_order_id IS NOT NULL DO UPDATE
    SET status = 'completed',
        capture_id = COALESCE(EXCLUDED.capture_id, public.purchases.capture_id)
  RETURNING id INTO v_purchase_id;

  INSERT INTO public.entitlements (user_id, product_slug, active, granted_at, source)
  VALUES (_user_id, 'art-of-ism-full-access', true, now(), 'purchase')
  ON CONFLICT (user_id, product_slug) DO UPDATE
    SET active = true, granted_at = now();

  RETURN QUERY SELECT true, v_purchase_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.finalize_paypal_purchase(uuid, text, numeric, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;

-- 3. revoke_entitlement_by_order: preserves access if any other valid source still grants it.
CREATE OR REPLACE FUNCTION public.revoke_entitlement_by_order(_order_id text, _reason text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id uuid;
  v_product text;
  v_other_completed integer;
  v_complimentary integer;
BEGIN
  SELECT user_id, product_slug INTO v_user_id, v_product
    FROM public.purchases
   WHERE provider = 'paypal' AND provider_order_id = _order_id
   LIMIT 1;

  IF v_user_id IS NULL THEN RETURN false; END IF;

  UPDATE public.purchases
     SET status = COALESCE(_reason, 'revoked')
   WHERE provider = 'paypal' AND provider_order_id = _order_id;

  SELECT count(*) INTO v_other_completed
    FROM public.purchases
   WHERE user_id = v_user_id
     AND product_slug = v_product
     AND status = 'completed';

  SELECT count(*) INTO v_complimentary
    FROM public.entitlements
   WHERE user_id = v_user_id
     AND product_slug = v_product
     AND source = 'complimentary';

  IF v_other_completed = 0 AND v_complimentary = 0 THEN
    UPDATE public.entitlements
       SET active = false
     WHERE user_id = v_user_id AND product_slug = v_product;
  END IF;

  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.revoke_entitlement_by_order(text, text) FROM PUBLIC, anon, authenticated;

-- 4. Reactivation helper (used by dispute-resolved merchant-win outcomes).
CREATE OR REPLACE FUNCTION public.reactivate_entitlement_by_order(_order_id text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_user_id uuid; v_product text; v_status text;
BEGIN
  SELECT user_id, product_slug, status INTO v_user_id, v_product, v_status
    FROM public.purchases
   WHERE provider = 'paypal' AND provider_order_id = _order_id
   LIMIT 1;
  IF v_user_id IS NULL THEN RETURN false; END IF;
  -- Only reinstate if the buyer's purchase is still (or now) treated as completed.
  UPDATE public.purchases SET status = 'completed'
   WHERE provider = 'paypal' AND provider_order_id = _order_id
     AND status IN ('completed','customer.dispute.created','disputed');
  INSERT INTO public.entitlements (user_id, product_slug, active, granted_at, source)
  VALUES (v_user_id, v_product, true, now(), 'purchase')
  ON CONFLICT (user_id, product_slug) DO UPDATE SET active = true, granted_at = now();
  RETURN true;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.reactivate_entitlement_by_order(text) FROM PUBLIC, anon, authenticated;

-- 5. Lookup helper: resolve order id from a capture id (used by webhook dispute path).
CREATE OR REPLACE FUNCTION public.order_id_for_capture(_capture_id text)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT provider_order_id FROM public.purchases
   WHERE provider = 'paypal' AND capture_id = _capture_id
   LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.order_id_for_capture(text) FROM PUBLIC, anon, authenticated;
