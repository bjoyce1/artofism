
ALTER TABLE public.reading_progress
  ADD COLUMN IF NOT EXISTS completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_read_at timestamptz NOT NULL DEFAULT now();

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.reading_progress'::regclass
      AND conname = 'reading_progress_progress_percent_range'
  ) THEN
    ALTER TABLE public.reading_progress
      ADD CONSTRAINT reading_progress_progress_percent_range
      CHECK (progress_percent BETWEEN 0 AND 100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS reading_progress_user_last_read_idx
  ON public.reading_progress (user_id, last_read_at DESC);
