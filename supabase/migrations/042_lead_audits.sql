CREATE TABLE IF NOT EXISTS public.lead_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  website_lead_id uuid NOT NULL REFERENCES public.website_leads (id) ON DELETE CASCADE,
  score integer,
  status text NOT NULL DEFAULT 'queued',
  payload jsonb,
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_audits_status_check CHECK (
    status IN ('queued', 'review', 'ready', 'failed', 'sent')
  )
);

COMMENT ON TABLE public.lead_audits IS
  'Google visibility audits for booked-jobs leads. First 10 stay in review.';

ALTER TABLE public.lead_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lead_audits_staff_select" ON public.lead_audits;
CREATE POLICY "lead_audits_staff_select" ON public.lead_audits
  FOR SELECT USING (
    auth.role() = 'authenticated'
    AND get_user_role(auth.uid()) IN (
      'owner',
      'account_manager',
      'closer',
      'media_buyer',
      'demo'
    )
  );
