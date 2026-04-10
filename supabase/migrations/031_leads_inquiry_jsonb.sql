-- Rich context from marketing lead form (message, UTM, services, etc.) on POST /api/lead
-- Idempotent. Never fails: adds inquiry jsonb only where the table already exists.
-- Targets:
--   public.leads
--   public.showroom_organic
-- If neither exists (e.g. marketing-only DB), this migration still succeeds — add your lead
-- table later, then run the ADD COLUMN below manually or re-deploy this migration after 001.

DO $$
DECLARE
  has_leads boolean;
  has_showroom boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'leads'
  ) INTO has_leads;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'showroom_organic'
  ) INTO has_showroom;

  IF NOT has_leads AND NOT has_showroom THEN
    RAISE NOTICE '031_leads_inquiry_jsonb: skipped — no public.leads or public.showroom_organic. When your CRM lead table exists, add: ALTER TABLE <table> ADD COLUMN IF NOT EXISTS inquiry jsonb;';
    RETURN;
  END IF;

  IF has_leads AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'inquiry'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN inquiry jsonb;
  END IF;

  IF has_showroom AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'showroom_organic' AND column_name = 'inquiry'
  ) THEN
    ALTER TABLE public.showroom_organic ADD COLUMN inquiry jsonb;
  END IF;
END $$;
