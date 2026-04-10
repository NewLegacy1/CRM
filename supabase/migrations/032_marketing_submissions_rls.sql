-- Row level security for marketing intake tables (030).
-- CRM reads these with the logged-in Supabase user; API routes use the service role (bypasses RLS).

ALTER TABLE public.lead_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intake_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_intake_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketing_staff_select_lead_submissions" ON public.lead_submissions;
DROP POLICY IF EXISTS "marketing_staff_select_intake_submissions" ON public.intake_submissions;
DROP POLICY IF EXISTS "marketing_staff_select_crm_intake_submissions" ON public.crm_intake_submissions;

-- Staff roles aligned with Inbound leads nav (nav-config) + media_buyer
CREATE POLICY "marketing_staff_select_lead_submissions"
  ON public.lead_submissions FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_role() IN (
      'owner',
      'account_manager',
      'closer',
      'cold_caller',
      'media_buyer',
      'demo'
    )
  );

CREATE POLICY "marketing_staff_select_intake_submissions"
  ON public.intake_submissions FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_role() IN (
      'owner',
      'account_manager',
      'closer',
      'cold_caller',
      'media_buyer',
      'demo'
    )
  );

CREATE POLICY "marketing_staff_select_crm_intake_submissions"
  ON public.crm_intake_submissions FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND public.get_user_role() IN (
      'owner',
      'account_manager',
      'closer',
      'cold_caller',
      'media_buyer',
      'demo'
    )
  );
