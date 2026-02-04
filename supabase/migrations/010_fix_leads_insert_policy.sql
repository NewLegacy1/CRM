-- Fix leads insert policy to handle NULL role properly
-- The issue is that get_user_role() can return NULL, and when PostgreSQL combines
-- multiple RLS policies with OR, NULL values cause "argument of OR must be type boolean" error

-- Drop existing policies
drop policy if exists "Owners and closers can manage leads" on public.leads;
drop policy if exists "Cold callers can update assigned leads" on public.leads;

-- Recreate "Owners and closers can manage leads" with explicit NULL handling
-- Using (coalesce(...) in (...)) ensures it always returns boolean, never NULL
create policy "Owners and closers can manage leads"
  on public.leads for all
  using (
    (coalesce(public.get_user_role(), '') in ('owner', 'closer')) = true
  );

-- Recreate "Cold callers can update assigned leads" with explicit NULL handling
-- This policy only applies to UPDATE operations, but we fix it to prevent any issues
create policy "Cold callers can update assigned leads"
  on public.leads for update
  using (
    (coalesce(public.get_user_role(), '') = 'cold_caller') = true and
    (cold_caller_id = auth.uid() or
     list_id in (
       select id from public.lead_lists
       where auth.uid() = any(assigned_cold_callers)
     ))
  );
