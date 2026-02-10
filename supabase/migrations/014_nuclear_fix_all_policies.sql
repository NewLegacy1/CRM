-- NUCLEAR OPTION: Drop and recreate ALL RLS policies with guaranteed boolean returns
-- This fixes the "argument of OR must be type boolean, not type text" error permanently

-- ============================================================================
-- STEP 1: Fix all helper functions to GUARANTEE boolean/text returns
-- ============================================================================

-- Fix get_user_role to ALWAYS return text (never NULL), even if no profile exists
create or replace function public.get_user_role()
returns text as $$
begin
  return coalesce((select role from public.profiles where id = auth.uid()), '');
end;
$$ language plpgsql security definer stable;

-- Helper: check if user has specific role (GUARANTEED boolean)
create or replace function public.user_has_role(p_role text)
returns boolean as $$
begin
  return (select public.get_user_role() = p_role);
end;
$$ language plpgsql security definer stable;

-- Helper: check if user has any of the roles (GUARANTEED boolean)
create or replace function public.user_has_any_role(p_roles text[])
returns boolean as $$
begin
  return (select public.get_user_role() = any(p_roles));
end;
$$ language plpgsql security definer stable;

-- ============================================================================
-- STEP 2: Drop ALL existing RLS policies on leads, lead_lists, meetings
-- ============================================================================

-- Drop ALL leads policies
drop policy if exists "Owners full access leads" on public.leads;
drop policy if exists "Closers full access leads" on public.leads;
drop policy if exists "Cold callers access assigned leads" on public.leads;
drop policy if exists "All users can read all leads" on public.leads;
drop policy if exists "Owners and closers can manage leads" on public.leads;
drop policy if exists "Cold callers can update assigned leads" on public.leads;

-- Drop ALL lead_lists policies
drop policy if exists "Owners full access lead_lists" on public.lead_lists;
drop policy if exists "Cold callers read assigned lists" on public.lead_lists;
drop policy if exists "All users can read all lead lists" on public.lead_lists;
drop policy if exists "Owners and closers can manage lead lists" on public.lead_lists;

-- Drop ALL meetings policies
drop policy if exists "Owners closers cold_callers meetings" on public.meetings;

-- ============================================================================
-- STEP 3: Recreate ALL policies with GUARANTEED boolean expressions
-- ============================================================================

-- LEADS POLICIES
-- All authenticated users can READ all leads
create policy "All users can read all leads"
  on public.leads for select
  using (auth.uid() is not null);

-- Owners and closers can do EVERYTHING with leads (insert/update/delete)
create policy "Owners and closers can manage leads"
  on public.leads
  for all
  using (public.user_has_any_role(ARRAY['owner', 'closer']))
  with check (public.user_has_any_role(ARRAY['owner', 'closer']));

-- Cold callers can UPDATE their assigned leads only
create policy "Cold callers can update assigned leads"
  on public.leads
  for update
  using (
    public.user_has_role('cold_caller')
    and
    (
      cold_caller_id = auth.uid()
      or
      list_id in (
        select id from public.lead_lists
        where auth.uid() = any(assigned_cold_callers)
      )
    )
  )
  with check (
    public.user_has_role('cold_caller')
    and
    (
      cold_caller_id = auth.uid()
      or
      list_id in (
        select id from public.lead_lists
        where auth.uid() = any(assigned_cold_callers)
      )
    )
  );

-- LEAD LISTS POLICIES
-- All authenticated users can READ all lead lists
create policy "All users can read all lead lists"
  on public.lead_lists for select
  using (auth.uid() is not null);

-- Owners and closers can MANAGE lead lists
create policy "Owners and closers can manage lead lists"
  on public.lead_lists
  for all
  using (public.user_has_any_role(ARRAY['owner', 'closer']))
  with check (public.user_has_any_role(ARRAY['owner', 'closer']));

-- MEETINGS POLICIES
-- Owners, closers, and cold callers can manage meetings
create policy "Owners closers cold_callers meetings"
  on public.meetings
  for all
  using (
    public.user_has_any_role(ARRAY['owner', 'closer'])
    or
    public.user_has_role('cold_caller')
  )
  with check (
    public.user_has_any_role(ARRAY['owner', 'closer'])
    or
    public.user_has_role('cold_caller')
  );

-- ============================================================================
-- DONE: All policies now use helper functions that GUARANTEE boolean returns
-- ============================================================================
