-- Add image_url column to promos table
ALTER TABLE public.promos
  ADD COLUMN IF NOT EXISTS image_url TEXT NULL;
