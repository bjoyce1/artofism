
-- Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Seed admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE email = 'nsanders2009@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Narration tracking
CREATE TABLE IF NOT EXISTS public.chapter_narration (
  section_id text PRIMARY KEY,
  voice_id text NOT NULL,
  file_path text NOT NULL,
  duration_seconds numeric,
  char_count integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.chapter_narration TO authenticated, anon;
GRANT ALL ON public.chapter_narration TO service_role;
ALTER TABLE public.chapter_narration ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read narration" ON public.chapter_narration;
CREATE POLICY "Anyone can read narration" ON public.chapter_narration
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage narration" ON public.chapter_narration;
CREATE POLICY "Admins manage narration" ON public.chapter_narration
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS chapter_narration_touch ON public.chapter_narration;
CREATE TRIGGER chapter_narration_touch BEFORE UPDATE ON public.chapter_narration
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
