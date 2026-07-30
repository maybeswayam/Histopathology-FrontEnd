-- =============================================================================
-- HistoAI — Supabase one-shot setup
-- Paste into: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (idempotent).
-- =============================================================================

-- 1) Analysis history (saved after each /analyze run)
CREATE TABLE IF NOT EXISTS public.analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  prediction TEXT NOT NULL,
  confidence DECIMAL(5, 4) NOT NULL,
  probabilities JSONB,
  heatmap TEXT,
  heatmap_url TEXT,
  processing_time INTEGER,
  model_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Align older installs
ALTER TABLE public.analysis_history
  ADD COLUMN IF NOT EXISTS probabilities JSONB;
ALTER TABLE public.analysis_history
  ADD COLUMN IF NOT EXISTS heatmap TEXT;
ALTER TABLE public.analysis_history
  ADD COLUMN IF NOT EXISTS heatmap_url TEXT;
ALTER TABLE public.analysis_history
  ADD COLUMN IF NOT EXISTS processing_time INTEGER;
ALTER TABLE public.analysis_history
  ADD COLUMN IF NOT EXISTS model_version TEXT;

DO $$
BEGIN
  ALTER TABLE public.analysis_history
    ALTER COLUMN confidence TYPE DECIMAL(5, 4);
EXCEPTION
  WHEN others THEN
    NULL;
END $$;

ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own analysis history" ON public.analysis_history;
DROP POLICY IF EXISTS "Users can insert their own analysis history" ON public.analysis_history;
DROP POLICY IF EXISTS "Users can delete their own analysis history" ON public.analysis_history;
DROP POLICY IF EXISTS "Users can update their own analysis history" ON public.analysis_history;

CREATE POLICY "Users can view their own analysis history"
  ON public.analysis_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analysis history"
  ON public.analysis_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analysis history"
  ON public.analysis_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analysis history"
  ON public.analysis_history FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS analysis_history_user_id_created_at_idx
  ON public.analysis_history (user_id, created_at DESC);

-- 2) User profiles (intended-use acceptance gate)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  intended_use_accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3) Storage buckets for slides + heatmaps (paths in DB, binaries in Storage)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'slides',
    'slides',
    false,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  ),
  (
    'heatmaps',
    'heatmaps',
    false,
    10485760,
    ARRAY['image/png', 'image/jpeg', 'image/webp']
  )
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Users may only read/write objects under their own user_id prefix
DROP POLICY IF EXISTS "Users upload own slides" ON storage.objects;
DROP POLICY IF EXISTS "Users read own slides" ON storage.objects;
DROP POLICY IF EXISTS "Users update own slides" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own slides" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own heatmaps" ON storage.objects;
DROP POLICY IF EXISTS "Users read own heatmaps" ON storage.objects;
DROP POLICY IF EXISTS "Users update own heatmaps" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own heatmaps" ON storage.objects;

CREATE POLICY "Users upload own slides"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'slides'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own slides"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'slides'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own slides"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'slides'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own slides"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'slides'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users upload own heatmaps"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'heatmaps'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users read own heatmaps"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'heatmaps'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users update own heatmaps"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'heatmaps'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users delete own heatmaps"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'heatmaps'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Done. Verify: analysis_history + user_profiles + storage buckets slides/heatmaps.
