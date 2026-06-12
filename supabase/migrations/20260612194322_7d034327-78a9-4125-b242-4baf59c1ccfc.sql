
-- 1) analytics_events: replace permissive INSERT with a user-bound check
DROP POLICY IF EXISTS "Anyone can insert events" ON public.analytics_events;

CREATE POLICY "Anon can insert anonymous events"
ON public.analytics_events
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

CREATE POLICY "Authenticated can insert own events"
ON public.analytics_events
FOR INSERT
TO authenticated
WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- 2) storage.objects: restrict writes on music/audio buckets to service_role; reads remain public (buckets are public)
DROP POLICY IF EXISTS "Service role can manage music objects" ON storage.objects;
DROP POLICY IF EXISTS "Service role can manage audio objects" ON storage.objects;

CREATE POLICY "Service role can manage music objects"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'music' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'music' AND auth.role() = 'service_role');

CREATE POLICY "Service role can manage audio objects"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'audio' AND auth.role() = 'service_role')
WITH CHECK (bucket_id = 'audio' AND auth.role() = 'service_role');

-- 3) Lock down SECURITY DEFINER email queue helper functions: restrict EXECUTE to service_role and set search_path
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
