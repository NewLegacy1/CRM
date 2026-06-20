-- Tie onboarding links to CRM projects for in-project contract review + notifications.

ALTER TABLE public.client_onboarding_links
  ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_client_onboarding_links_project_id
  ON public.client_onboarding_links(project_id);

COMMENT ON COLUMN public.client_onboarding_links.project_id IS
  'CRM project this onboarding link belongs to — drives Contracts tab + alerts.';

-- Link project_id / client_id when creating links in the CRM (/onboarding).
