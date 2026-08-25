-- Lock down public/anon access.
-- 1. client_form_submissions had RLS off, so the anon key could read/write every row.
-- 2. Many policies targeted PUBLIC. SELECT policies then treated unsigned users as
--    "not demo" and returned all real CRM rows.
-- 3. SECURITY DEFINER helpers were executable by anon over /rest/v1/rpc.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(role, '') FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role text;
BEGIN
  IF user_id IS NULL THEN
    RETURN '';
  END IF;
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = user_id;
  RETURN COALESCE(user_role, '');
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_role(p_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.get_user_role() = p_role;
$$;

CREATE OR REPLACE FUNCTION public.user_has_any_role(p_roles text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.get_user_role() = ANY (p_roles);
$$;

ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_activity(text, uuid, text, uuid, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.log_call_log_activity() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_client_activity() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_deal_activity() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_invoice_activity() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_lead_activity() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_meeting_activity() SET search_path = public, pg_temp;
ALTER FUNCTION public.log_project_activity() SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.get_user_role() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_user_role(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_has_role(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.user_has_any_role(text[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_activity(text, uuid, text, uuid, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_call_log_activity() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_client_activity() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_deal_activity() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_invoice_activity() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_lead_activity() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_meeting_activity() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.log_project_activity() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_has_role(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_has_any_role(text[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin, service_role;
GRANT EXECUTE ON FUNCTION public.log_activity(text, uuid, text, uuid, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_call_log_activity() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_client_activity() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_deal_activity() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_invoice_activity() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_lead_activity() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_meeting_activity() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.log_project_activity() TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Existing PUBLIC policies must not apply to anon
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
      AND 'public' = ANY (roles)
  LOOP
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO authenticated',
      r.policyname,
      r.schemaname,
      r.tablename
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- SELECT policies that previously leaked all non-demo rows to anon
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "activity_log_select_policy" ON public.activity_log;
CREATE POLICY "activity_log_select_policy" ON public.activity_log
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "activity_log_insert_policy" ON public.activity_log;
CREATE POLICY "activity_log_insert_policy" ON public.activity_log
  FOR INSERT TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) IN (
      'owner',
      'account_manager',
      'closer',
      'cold_caller',
      'media_buyer',
      'demo'
    )
    AND (
      CASE
        WHEN public.get_user_role(auth.uid()) = 'demo' THEN is_demo IS TRUE
        ELSE is_demo IS NOT TRUE
      END
    )
  );

DROP POLICY IF EXISTS "ad_creatives_select_policy" ON public.ad_creatives;
CREATE POLICY "ad_creatives_select_policy" ON public.ad_creatives
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "ads_select_policy" ON public.ads;
CREATE POLICY "ads_select_policy" ON public.ads
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "agency_ads_select_policy" ON public.agency_ads;
CREATE POLICY "agency_ads_select_policy" ON public.agency_ads
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "ai_insights_select_policy" ON public.ai_insights;
CREATE POLICY "ai_insights_select_policy" ON public.ai_insights
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "clients_select_policy" ON public.clients;
CREATE POLICY "clients_select_policy" ON public.clients
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "deals_select_policy" ON public.deals;
CREATE POLICY "deals_select_policy" ON public.deals
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;
CREATE POLICY "invoices_select_policy" ON public.invoices
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "lead_lists_select_policy" ON public.lead_lists;
CREATE POLICY "lead_lists_select_policy" ON public.lead_lists
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "leads_select_policy" ON public.leads;
CREATE POLICY "leads_select_policy" ON public.leads
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "meetings_select_policy" ON public.meetings;
CREATE POLICY "meetings_select_policy" ON public.meetings
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "projects_select_policy" ON public.projects;
CREATE POLICY "projects_select_policy" ON public.projects
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

DROP POLICY IF EXISTS "leads_select_policy" ON public.showroom_organic;
CREATE POLICY "leads_select_policy" ON public.showroom_organic
  FOR SELECT TO authenticated
  USING (
    CASE public.get_user_role(auth.uid())
      WHEN 'demo' THEN is_demo IS TRUE
      WHEN 'owner' THEN is_demo IS NOT TRUE
      WHEN 'account_manager' THEN is_demo IS NOT TRUE
      WHEN 'closer' THEN is_demo IS NOT TRUE
      WHEN 'cold_caller' THEN is_demo IS NOT TRUE
      WHEN 'media_buyer' THEN is_demo IS NOT TRUE
      ELSE false
    END
  );

-- ---------------------------------------------------------------------------
-- Table with RLS disabled (Supabase ERROR: rls_disabled_in_public)
-- Public client sites may still INSERT; nobody may SELECT without staff auth.
-- ---------------------------------------------------------------------------
ALTER TABLE public.client_form_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "client_form_submissions_anon_insert" ON public.client_form_submissions;
CREATE POLICY "client_form_submissions_anon_insert" ON public.client_form_submissions
  FOR INSERT TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "client_form_submissions_staff_select" ON public.client_form_submissions;
CREATE POLICY "client_form_submissions_staff_select" ON public.client_form_submissions
  FOR SELECT TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN (
      'owner',
      'account_manager',
      'closer',
      'cold_caller',
      'media_buyer',
      'demo'
    )
  );

DROP POLICY IF EXISTS "showroom_ads_staff_select" ON public.showroom_ads;
CREATE POLICY "showroom_ads_staff_select" ON public.showroom_ads
  FOR SELECT TO authenticated
  USING (
    public.get_user_role(auth.uid()) IN (
      'owner',
      'account_manager',
      'closer',
      'cold_caller',
      'media_buyer',
      'demo'
    )
  );

DROP POLICY IF EXISTS "stripe_webhook_events_owner_select" ON public.stripe_webhook_events;
CREATE POLICY "stripe_webhook_events_owner_select" ON public.stripe_webhook_events
  FOR SELECT TO authenticated
  USING (public.get_user_role(auth.uid()) = 'owner');

-- ---------------------------------------------------------------------------
-- Privilege lockdown: anon cannot read CRM tables even if a policy is missed
-- ---------------------------------------------------------------------------
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;

GRANT INSERT ON public.showroom_organic TO anon;
GRANT INSERT ON public.showroom_ads TO anon;
GRANT INSERT ON public.client_form_submissions TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM PUBLIC;
)