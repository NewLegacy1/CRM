-- Booked Jobs Launch funnel tracking on marketing website_leads.
-- Extra qualify fields stay in inquiry jsonb. These columns are for ads + sequences.

ALTER TABLE public.website_leads
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS headline_variant text,
  ADD COLUMN IF NOT EXISTS vsl_b_confirmed_at timestamptz;

COMMENT ON COLUMN public.website_leads.headline_variant IS
  'Ad hook slug from /booked-jobs?h=';
COMMENT ON COLUMN public.website_leads.vsl_b_confirmed_at IS
  'Set when they text READY after VSL B.';

DROP POLICY IF EXISTS "website_leads_staff_update" ON public.website_leads;
CREATE POLICY "website_leads_staff_update" ON public.website_leads
  FOR UPDATE USING (
    auth.role() = 'authenticated'
    AND get_user_role(auth.uid()) IN (
      'owner',
      'account_manager',
      'closer',
      'cold_caller',
      'media_buyer',
      'demo'
    )
  )
  WITH CHECK (
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

CREATE TABLE IF NOT EXISTS public.lead_email_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_lead_id uuid NOT NULL REFERENCES public.website_leads (id) ON DELETE CASCADE,
  sequence text NOT NULL,
  step integer NOT NULL DEFAULT 0,
  last_sent_at timestamptz,
  next_send_at timestamptz,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (website_lead_id, sequence)
);

COMMENT ON TABLE public.lead_email_state IS
  'Seq 0–2 state for booked-jobs email/SMS. Written by service role.';

ALTER TABLE public.lead_email_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lead_email_state_staff_select" ON public.lead_email_state;
CREATE POLICY "lead_email_state_staff_select" ON public.lead_email_state
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
