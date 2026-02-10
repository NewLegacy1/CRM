-- Fix meetings RLS policy to avoid OR text errors
-- Use boolean helper functions for clarity and safety

drop policy if exists "Owners closers cold_callers meetings" on public.meetings;

create policy "Owners closers cold_callers meetings"
  on public.meetings for all
  using (
    public.user_has_any_role(ARRAY['owner', 'closer']) or
    public.user_has_role('cold_caller')
  )
  with check (
    public.user_has_any_role(ARRAY['owner', 'closer']) or
    public.user_has_role('cold_caller')
  );
