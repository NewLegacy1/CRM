-- Comprehensive fix for all leads RLS policies
-- This fixes the root cause: get_user_role() returning NULL causes RLS policy errors
-- when PostgreSQL combines policies with OR

-- STEP 1: Fix get_user_role() to never return NULL (root cause fix)
-- When get_user_role() returns NULL, comparisons like NULL in ('owner', 'closer')
-- don't return proper boolean values, causing "argument of OR must be type boolean" errors
create or replace function public.get_user_role()
returns text as $$
  select coalesce(role, '') from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- STEP 2: Helper function to check if user has role (returns boolean, never NULL)
create or replace function public.user_has_role(p_role text)
returns boolean as $$
begin
  return public.get_user_role() = p_role;
end;
$$ language plpgsql security definer stable;

-- STEP 3: Helper function to check if user has any of the roles (returns boolean, never NULL)
create or replace function public.user_has_any_role(p_roles text[])
returns boolean as $$
begin
  return public.get_user_role() = any(p_roles);
end;
$$ language plpgsql security definer stable;

-- Drop all existing policies (in case some weren't properly dropped)
drop policy if exists "Owners full access leads" on public.leads;
drop policy if exists "Closers full access leads" on public.leads;
drop policy if exists "Cold callers access assigned leads" on public.leads;
drop policy if exists "All users can read all leads" on public.leads;
drop policy if exists "Owners and closers can manage leads" on public.leads;
drop policy if exists "Cold callers can update assigned leads" on public.leads;

-- Recreate all policies with explicit boolean returns

-- 1. All authenticated users can read all leads
create policy "All users can read all leads"
  on public.leads for select
  using (auth.uid() is not null);

-- 2. Owners and closers can insert/update/delete leads
-- Using helper function that guarantees boolean return
create policy "Owners and closers can manage leads"
  on public.leads for all
  using (public.user_has_any_role(ARRAY['owner', 'closer']));

-- 3. Cold callers can update leads they're assigned to
-- Using helper function that guarantees boolean return
create policy "Cold callers can update assigned leads"
  on public.leads for update
  using (
    public.user_has_role('cold_caller') and
    (cold_caller_id = auth.uid() or
     list_id in (
       select id from public.lead_lists
       where auth.uid() = any(assigned_cold_callers)
     ))
  );
