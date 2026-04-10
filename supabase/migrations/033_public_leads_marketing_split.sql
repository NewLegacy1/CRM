-- Ensures `public.leads` exists for cold-call list leads (CSV/scraper) only.
-- Marketing modal captures use `website_leads` (migration 034). Showroom Auto Care stays separate.

CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text NOT NULL DEFAULT '',
  niche text,
  list_id uuid REFERENCES public.lead_lists(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new',
  cold_caller_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  city text,
  website text,
  is_demo boolean DEFAULT false,
  inquiry jsonb,
  CONSTRAINT leads_status_check CHECK (
    status IN (
      'new',
      'called',
      'no_answer',
      'didnt_book',
      'booked',
      'called_no_answer',
      'answered_declined_demo',
      'answered_accepted_demo'
    )
  )
);

COMMENT ON TABLE public.leads IS
  'Cold-call list leads (scraped/CSV). Marketing captures: website_leads. Showroom: showroom_organic.';

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_update_policy" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_policy" ON public.leads;

CREATE POLICY "leads_select_policy" ON public.leads
  FOR SELECT USING (
    CASE
      WHEN get_user_role(auth.uid()) = 'demo' THEN is_demo = true
      ELSE is_demo = false OR is_demo IS NULL
    END
  );

CREATE POLICY "leads_insert_policy" ON public.leads
  FOR INSERT WITH CHECK (
    get_user_role(auth.uid()) IN ('owner', 'account_manager', 'cold_caller')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "leads_update_policy" ON public.leads
  FOR UPDATE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager', 'cold_caller', 'closer')
    AND (is_demo = false OR is_demo IS NULL)
  );

CREATE POLICY "leads_delete_policy" ON public.leads
  FOR DELETE USING (
    get_user_role(auth.uid()) IN ('owner', 'account_manager', 'cold_caller')
    AND (is_demo = false OR is_demo IS NULL)
  );
