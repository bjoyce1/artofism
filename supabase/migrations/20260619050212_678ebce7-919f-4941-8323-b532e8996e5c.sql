CREATE TABLE public.narration_generation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id text NOT NULL,
  requested_by uuid NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  total_chunks integer NOT NULL DEFAULT 0,
  completed_chunks integer NOT NULL DEFAULT 0,
  error_message text,
  file_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CONSTRAINT narration_generation_jobs_status_check CHECK (status IN ('queued', 'generating', 'completed', 'failed'))
);

GRANT SELECT, INSERT ON public.narration_generation_jobs TO authenticated;
GRANT ALL ON public.narration_generation_jobs TO service_role;

ALTER TABLE public.narration_generation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view narration jobs"
ON public.narration_generation_jobs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create narration jobs"
ON public.narration_generation_jobs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') AND requested_by = auth.uid());

CREATE TRIGGER update_narration_generation_jobs_updated_at
BEFORE UPDATE ON public.narration_generation_jobs
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();