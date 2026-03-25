-- If you already have public.promos but it's missing valid_until,
-- run this in Supabase SQL Editor to upgrade the schema safely.

ALTER TABLE public.promos
  ADD COLUMN IF NOT EXISTS valid_until DATE NULL;

-- Optional: ensure promos table is included in Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.promos;

