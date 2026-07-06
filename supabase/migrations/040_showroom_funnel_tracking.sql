-- Showroom AutoCare conversion funnel tracking.
-- Events land here from two sources: the public showroomautocare.ca site
-- (page views / CTA clicks, via /api/track/showroom) and DetailOps' booking
-- flow (step progress / completion, via /api/webhooks/detailops-session).
-- Both writers use the service role key, so there are no insert/update/delete
-- policies below — RLS only needs to gate reads for the CRM dashboard.

CREATE TABLE IF NOT EXISTS public.showroom_funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  session_id text NOT NULL,
  source text NOT NULL CHECK (source IN ('showroom_site', 'detailops')),
  event_type text NOT NULL CHECK (
    event_type IN (
      'page_view',
      'cta_click',
      'step_reached',
      'booking_confirmed',
      'booking_abandoned',
      'checkout_started',
      'checkout_completed',
      'checkout_expired'
    )
  ),
  step text CHECK (step IS NULL OR step IN ('contact', 'catalog', 'details', 'datetime')),
  page_path text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.showroom_funnel_events IS
  'Conversion funnel events for showroomautocare.ca + its DetailOps booking flow only. Not used for any other DetailOps org.';

CREATE INDEX IF NOT EXISTS idx_showroom_funnel_events_session_id ON public.showroom_funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_showroom_funnel_events_created_at ON public.showroom_funnel_events(created_at);
CREATE INDEX IF NOT EXISTS idx_showroom_funnel_events_event_type ON public.showroom_funnel_events(event_type);

ALTER TABLE public.showroom_funnel_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "showroom_funnel_events_owner_select" ON public.showroom_funnel_events;
CREATE POLICY "showroom_funnel_events_owner_select" ON public.showroom_funnel_events
  FOR SELECT USING (get_user_role(auth.uid()) = 'owner');

-- Manually-logged before/after experiments (e.g. "moved catalog step before contact step").
-- Sessions are split into control/variant by comparing showroom_funnel_events.created_at
-- against started_at (and ended_at, once set) — there is no live variant assignment yet.
CREATE TABLE IF NOT EXISTS public.experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_experiments_started_at ON public.experiments(started_at);

ALTER TABLE public.experiments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "experiments_owner_select" ON public.experiments;
CREATE POLICY "experiments_owner_select" ON public.experiments
  FOR SELECT USING (get_user_role(auth.uid()) = 'owner');

DROP POLICY IF EXISTS "experiments_owner_insert" ON public.experiments;
CREATE POLICY "experiments_owner_insert" ON public.experiments
  FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'owner');

DROP POLICY IF EXISTS "experiments_owner_update" ON public.experiments;
CREATE POLICY "experiments_owner_update" ON public.experiments
  FOR UPDATE USING (get_user_role(auth.uid()) = 'owner');

DROP POLICY IF EXISTS "experiments_owner_delete" ON public.experiments;
CREATE POLICY "experiments_owner_delete" ON public.experiments
  FOR DELETE USING (get_user_role(auth.uid()) = 'owner');
