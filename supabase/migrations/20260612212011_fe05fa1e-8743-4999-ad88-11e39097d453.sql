-- vault_quotes: public catalog of standalone codes
CREATE TABLE public.vault_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_number int NOT NULL UNIQUE,
  quote_text text NOT NULL,
  chapter_slug text NOT NULL,
  chapter_title text NOT NULL,
  is_free boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.vault_quotes TO anon, authenticated;
GRANT ALL ON public.vault_quotes TO service_role;

ALTER TABLE public.vault_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vault quotes are public"
  ON public.vault_quotes FOR SELECT
  USING (true);

-- vault_favorites: per-user saved quotes
CREATE TABLE public.vault_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quote_id uuid NOT NULL REFERENCES public.vault_quotes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, quote_id)
);

GRANT SELECT, INSERT, DELETE ON public.vault_favorites TO authenticated;
GRANT ALL ON public.vault_favorites TO service_role;

ALTER TABLE public.vault_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vault favorites"
  ON public.vault_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own vault favorites"
  ON public.vault_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own vault favorites"
  ON public.vault_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);