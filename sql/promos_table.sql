-- Promos table + policies for QuickTap
-- Run this in Supabase SQL Editor.

-- 1) Create promos table if missing
CREATE TABLE IF NOT EXISTS public.promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  valid_until DATE NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Enable realtime for promos (optional but recommended)
-- (Supabase Realtime listens to WAL; table must be in the publication)
ALTER PUBLICATION supabase_realtime ADD TABLE public.promos;

-- 3) RLS: choose ONE approach

-- Approach A (simplest for school/demo): disable RLS
-- ALTER TABLE public.promos DISABLE ROW LEVEL SECURITY;

-- Approach B (recommended): keep RLS on but allow app (anon key) to read/write promos.
-- WARNING: This allows anyone with your anon key to write promos.
ALTER TABLE public.promos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promos_read_all" ON public.promos;
CREATE POLICY "promos_read_all"
ON public.promos
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "promos_insert_all" ON public.promos;
CREATE POLICY "promos_insert_all"
ON public.promos
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "promos_update_all" ON public.promos;
CREATE POLICY "promos_update_all"
ON public.promos
FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "promos_delete_all" ON public.promos;
CREATE POLICY "promos_delete_all"
ON public.promos
FOR DELETE
USING (true);

