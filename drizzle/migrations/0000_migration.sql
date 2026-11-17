DROP POLICY IF EXISTS "Vault quotes are public" ON public.vault_quotes;

CREATE POLICY "Free vault quotes are public"
ON public.vault_quotes FOR SELECT
TO anon, authenticated
USING (is_free = true);

CREATE POLICY "Members can read all vault quotes"
ON public.vault_quotes FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.entitlements e
  WHERE e.user_id = auth.uid()
    AND e.product_slug = 'art-of-ism-full-access'
    AND e.active = true
));

-- Title-only teaser for locked quotes: never returns quote text.
CREATE OR REPLACE FUNCTION public.vault_locked_previews()
RETURNS TABLE(id uuid, code_number integer, chapter_slug text, chapter_title text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT q.id, q.code_number, q.chapter_slug, q.chapter_title
  FROM public.vault_quotes q
  WHERE q.is_free = false
  ORDER BY q.code_number;
$$;

REVOKE ALL ON FUNCTION public.vault_locked_previews() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.vault_locked_previews() TO anon, authenticated;