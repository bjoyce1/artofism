DROP POLICY IF EXISTS "Admins manage narration" ON public.chapter_narration;
CREATE POLICY "Admins manage narration"
ON public.chapter_narration
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can view narration jobs" ON public.narration_generation_jobs;
CREATE POLICY "Admins can view narration jobs"
ON public.narration_generation_jobs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can create narration jobs" ON public.narration_generation_jobs;
CREATE POLICY "Admins can create narration jobs"
ON public.narration_generation_jobs
FOR INSERT
TO authenticated
WITH CHECK (
  requested_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);