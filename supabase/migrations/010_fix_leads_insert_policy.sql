-- Fix leads insert policy to handle NULL role properly
-- The issue is that get_user_role() can return NULL, and NULL in ('owner', 'closer') 
-- evaluates to NULL (not boolean), causing "argument of OR must be type boolean" error

-- Drop the existing policy
drop policy if exists "Owners and closers can manage leads" on public.leads;

-- Recreate with explicit NULL handling using COALESCE
create policy "Owners and closers can manage leads"
  on public.leads for all
  using (
    coalesce(public.get_user_role(), '') in ('owner', 'closer')
  );
