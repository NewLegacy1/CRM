-- Client onboarding: unique links, submissions, contract acceptance, asset uploads.

CREATE TABLE IF NOT EXISTS public.client_onboarding_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE,
  business_name text NOT NULL,
  contact_name text,
  email text NOT NULL,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  line_items jsonb NOT NULL DEFAULT '[]',
  currency text NOT NULL DEFAULT 'cad',
  agreement_version text NOT NULL DEFAULT '1',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'submitted', 'invoiced', 'completed')),
  expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.client_onboarding_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid NOT NULL UNIQUE REFERENCES public.client_onboarding_links(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}',
  signer_name text NOT NULL,
  agreed_at timestamptz NOT NULL,
  logo_urls text[] NOT NULL DEFAULT '{}',
  image_urls text[] NOT NULL DEFAULT '{}',
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.client_onboarding_links IS
  'Tokenized onboarding URLs for post-sale clients (contract + assets + invoice).';
COMMENT ON TABLE public.client_onboarding_submissions IS
  'Completed onboarding forms with e-acceptance metadata and uploaded asset URLs.';

ALTER TABLE public.client_onboarding_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_onboarding_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_all_onboarding_links" ON public.client_onboarding_links;
CREATE POLICY "staff_all_onboarding_links" ON public.client_onboarding_links
  FOR ALL USING (
    auth.role() = 'authenticated'
    AND public.get_user_role() IN ('owner', 'account_manager', 'closer', 'demo')
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_user_role() IN ('owner', 'account_manager', 'closer', 'demo')
  );

DROP POLICY IF EXISTS "staff_all_onboarding_submissions" ON public.client_onboarding_submissions;
CREATE POLICY "staff_all_onboarding_submissions" ON public.client_onboarding_submissions
  FOR ALL USING (
    auth.role() = 'authenticated'
    AND public.get_user_role() IN ('owner', 'account_manager', 'closer', 'demo')
  )
  WITH CHECK (
    auth.role() = 'authenticated'
    AND public.get_user_role() IN ('owner', 'account_manager', 'closer', 'demo')
  );

-- Storage bucket for client onboarding uploads (logos, photos).
INSERT INTO storage.buckets (id, name, public)
VALUES ('intake-uploads', 'intake-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Napshine Cleaning Solutions — post-demo onboarding link
INSERT INTO public.client_onboarding_links (
  token,
  business_name,
  contact_name,
  email,
  line_items,
  currency,
  agreement_version,
  status
) VALUES (
  'napshine-mkp2026',
  'Napshine Cleaning Solutions',
  NULL,
  'sales@napshine.ca',
  '[
    {"description": "Custom landing page website", "quantity": 1, "unit_amount": 1200},
    {"description": "Google Business Profile setup", "quantity": 1, "unit_amount": 500}
  ]'::jsonb,
  'cad',
  '1',
  'pending'
) ON CONFLICT (token) DO NOTHING;
