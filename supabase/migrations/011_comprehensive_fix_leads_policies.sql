-- Comprehensive fix for all leads RLS policies
-- Drop ALL possible policies that might exist (from various migrations)
-- and recreate them with proper boolean handling

-- Helper function to check if user has role (returns boolean, never NULL)
create or replace function public.user_has_role(p_role text)
returns boolean as $$
begin
  return coalesce(public.get_user_role(), '') = p_role;
end;
$$ language plpgsql security definer stable;

-- Helper function to check if user has any of the roles (returns boolean, never NULL)
create or replace function public.user_has_any_role(p_roles text[])
returns boolean as $$
begin
  return coalesce(public.get_user_role(), '') = any(p_roles);
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
