
-- Atomic finalize: record purchase + activate entitlement in one transaction.
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
SET search_path = public
AS $$
DECLARE
  v_purchase_id uuid;
BEGIN
  IF _user_id IS NULL OR _order_id IS NULL OR _amount IS NULL OR _currency IS NULL THEN
    RAISE EXCEPTION 'missing required arguments';
  END IF;

  INSERT INTO public.purchases (
    user_id, provider, provider_order_id, product_slug, amount, currency, status
  ) VALUES (
    _user_id, 'paypal', _order_id, 'art-of-ism-full-access', _amount, _currency, 'completed'
  )
  ON CONFLICT (provider, provider_order_id) DO UPDATE
    SET status = 'completed'
  RETURNING id INTO v_purchase_id;

  INSERT INTO public.entitlements (user_id, product_slug, active, granted_at)
  VALUES (_user_id, 'art-of-ism-full-access', true, now())
  ON CONFLICT (user_id, product_slug) DO UPDATE
    SET active = true, granted_at = now();

  RETURN QUERY SELECT true, v_purchase_id;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_paypal_purchase(uuid, text, numeric, text, text, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finalize_paypal_purchase(uuid, text, numeric, text, text, text, jsonb) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_paypal_purchase(uuid, text, numeric, text, text, text, jsonb) TO service_role;

-- Revoke entitlement tied to a specific PayPal order.
CREATE OR REPLACE FUNCTION public.revoke_entitlement_by_order(
  _order_id text,
  _reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT user_id INTO v_user_id
  FROM public.purchases
  WHERE provider = 'paypal' AND provider_order_id = _order_id
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.purchases
     SET status = COALESCE(_reason, 'revoked')
   WHERE provider = 'paypal' AND provider_order_id = _order_id;

  UPDATE public.entitlements
     SET active = false
   WHERE user_id = v_user_id
     AND product_slug = 'art-of-ism-full-access';

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.revoke_entitlement_by_order(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_entitlement_by_order(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_entitlement_by_order(text, text) TO service_role;

-- Analytics: server-only writes. Drop any existing INSERT policies from public roles.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'analytics_events' AND cmd = 'INSERT'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.analytics_events', r.policyname);
  END LOOP;
END $$;

REVOKE INSERT ON public.analytics_events FROM anon, authenticated;
GRANT INSERT ON public.analytics_events TO service_role;

CREATE POLICY "analytics_events_service_role_insert"
ON public.analytics_events
FOR INSERT
TO service_role
WITH CHECK (true);
