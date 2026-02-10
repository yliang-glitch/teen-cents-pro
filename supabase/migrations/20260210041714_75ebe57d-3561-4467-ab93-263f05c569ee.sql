
-- Add hustle-specific columns to income table (nullable, only used for gig category)
ALTER TABLE public.income
  ADD COLUMN hustle_type text,
  ADD COLUMN cost numeric,
  ADD COLUMN note text,
  ADD COLUMN screenshot_url text;
