-- Tie onboarding links to CRM projects for in-project contract review + notifications.

ALTER TABLE public.client_onboarding_links
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_client_onboarding_links_project_id
  ON public.client_onboarding_links(project_id);

COMMENT ON COLUMN public.client_onboarding_links.project_id IS
  'CRM project this onboarding link belongs to — drives Contracts tab + alerts.';

-- Napshine: attach existing link to project + client
UPDATE public.client_onboarding_links
SET
  project_id = '773d0d38-3dfe-466a-abb1-d49db8c61e42',
  client_id = 'cdb32f60-6b58-44b1-b376-238f18c99dc3',
  business_name = 'Napshine Cleaning Solutions'
WHERE token = 'napshine-mkp2026';
