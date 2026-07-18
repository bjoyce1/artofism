
-- Constants enforced server-side
CREATE OR REPLACE FUNCTION public.finalize_paypal_purchase(
  _user_id uuid,
  _order_id text,
  _amount numeric,
  _currency text,
  _payer_email text,
  _capture_id text,
  _raw jsonb
)
RETURNS TABLE(entitlement_active boolean, purchase_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_price          numeric := 9.99;
  v_currency       text    := 'USD';
  v_product        text    := 'art-of-ism-full-access';
  v_purchase_id    uuid;
  v_existing_owner uuid;
BEGIN
  IF _user_id IS NULL OR _order_id IS NULL THEN
    RAISE EXCEPTION 'missing required arguments';
  END IF;

  -- Enforce the exact product and price server-side. Do not trust caller amounts.
  IF _amount IS NULL OR _amount::numeric(10,2) <> v_price OR upper(coalesce(_currency,'')) <> v_currency THEN
    RAISE EXCEPTION 'invalid amount/currency for %', v_product
      USING ERRCODE = 'check_violation';
  END IF;

  -- The buyer must be a real auth user.
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = _user_id) THEN
    RAISE EXCEPTION 'unknown user %', _user_id USING ERRCODE = 'foreign_key_violation';
  END IF;

  -- Idempotency + ownership check: if the order already exists, it must belong
  -- to this user. Prevents an attacker from re-submitting someone else's order.
  SELECT id, user_id INTO v_purchase_id, v_existing_owner
    FROM public.purchases
   WHERE provider = 'paypal' AND provider_order_id = _order_id
   LIMIT 1;

  IF v_purchase_id IS NOT NULL THEN
    IF v_existing_owner <> _user_id THEN
      RAISE EXCEPTION 'order % already owned by another user', _order_id
        USING ERRCODE = 'unique_violation';
    END IF;
    UPDATE public.purchases
       SET status      = 'completed',
           capture_id  = COALESCE(_capture_id, capture_id),
           amount      = v_price,
           currency    = v_currency,
           product_slug= v_product
     WHERE id = v_purchase_id;
  ELSE
    INSERT INTO public.purchases (
      user_id, provider, provider_order_id, product_slug,
      amount, currency, status, capture_id
    ) VALUES (
      _user_id, 'paypal', _order_id, v_product,
      v_price, v_currency, 'completed', _capture_id
    )
    RETURNING id INTO v_purchase_id;
  END IF;

  INSERT INTO public.entitlements (user_id, product_slug, active, granted_at, source)
  VALUES (_user_id, v_product, true, now(), 'purchase')
  ON CONFLICT (user_id, product_slug) DO UPDATE
    SET active = true, granted_at = now();

  RETURN QUERY SELECT true, v_purchase_id;
END;
$function$;

-- Source-aware revoke: keep access if another valid source still grants it.
CREATE OR REPLACE FUNCTION public.revoke_entitlement_by_order(
  _order_id text,
  _reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id      uuid;
  v_product      text;
  v_still_valid  boolean;
  v_is_complim   boolean;
BEGIN
  SELECT user_id, product_slug INTO v_user_id, v_product
    FROM public.purchases
   WHERE provider = 'paypal' AND provider_order_id = _order_id
   LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.purchases
     SET status = COALESCE(_reason, 'revoked')
   WHERE provider = 'paypal' AND provider_order_id = _order_id;

  -- Keep entitlement active if a manually-granted (complimentary) source exists
  -- OR if the user still has another completed purchase for the same product.
  SELECT EXISTS (
    SELECT 1 FROM public.entitlements
     WHERE user_id = v_user_id AND product_slug = v_product AND source = 'complimentary' AND active = true
  ) INTO v_is_complim;

  SELECT EXISTS (
    SELECT 1 FROM public.purchases
     WHERE user_id = v_user_id
       AND product_slug = v_product
       AND status = 'completed'
       AND NOT (provider = 'paypal' AND provider_order_id = _order_id)
  ) INTO v_still_valid;

  IF NOT v_is_complim AND NOT v_still_valid THEN
    UPDATE public.entitlements
       SET active = false
     WHERE user_id = v_user_id
       AND product_slug = v_product;
  END IF;

  RETURN true;
END;
$function$;

-- Reactivate after merchant-win dispute resolution.
CREATE OR REPLACE FUNCTION public.reactivate_entitlement_by_order(_order_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_product text;
BEGIN
  SELECT user_id, product_slug INTO v_user_id, v_product
    FROM public.purchases
   WHERE provider = 'paypal' AND provider_order_id = _order_id
   LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.purchases
     SET status = 'completed'
   WHERE provider = 'paypal' AND provider_order_id = _order_id;

  INSERT INTO public.entitlements (user_id, product_slug, active, granted_at, source)
  VALUES (v_user_id, v_product, true, now(), 'purchase')
  ON CONFLICT (user_id, product_slug) DO UPDATE
    SET active = true, granted_at = now();

  RETURN true;
END;
$function$;

-- Resolve a PayPal capture id back to the original order id via recorded purchases.
CREATE OR REPLACE FUNCTION public.order_id_for_capture(_capture_id text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT provider_order_id
    FROM public.purchases
   WHERE provider = 'paypal'
     AND capture_id = _capture_id
   ORDER BY created_at DESC
   LIMIT 1;
$function$;

-- Lock down SECURITY DEFINER EXECUTE — only service_role calls these.
REVOKE ALL ON FUNCTION public.finalize_paypal_purchase(uuid, text, numeric, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.revoke_entitlement_by_order(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reactivate_entitlement_by_order(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.order_id_for_capture(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_paypal_purchase(uuid, text, numeric, text, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_entitlement_by_order(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.reactivate_entitlement_by_order(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.order_id_for_capture(text) TO service_role;
