-- Marketing / modal captures only — never mixed into cold-call `public.leads` or dialer lists.
-- Written by POST /api/lead (service role). CRM users read via RLS below.

CREATE TABLE IF NOT EXISTS public.website_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  website text,
  niche text,
  source text NOT NULL DEFAULT 'website',
  status text NOT NULL DEFAULT 'new',
  is_demo boolean NOT NULL DEFAULT false,
  inquiry jsonb,
  CONSTRAINT website_leads_status_check CHECK (
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

COMMENT ON TABLE public.website_leads IS
  'Marketing site modal / quick capture. Separate from public.leads (dialer, CSV, scraper) and from showroom_organic.';

ALTER TABLE public.website_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "website_leads_staff_select" ON public.website_leads;
CREATE POLICY "website_leads_staff_select" ON public.website_leads
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND get_user_role(auth.uid()) IN (
      'owner',
      'account_manager',
      'closer',
      'cold_caller',
      'media_buyer',
      'demo'
    )
  );
