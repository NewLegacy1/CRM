-- Comprehensive fix for all leads RLS policies
-- Drop ALL possible policies that might exist (from various migrations)
-- and recreate them with proper boolean handling

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
-- Using CASE WHEN to ensure boolean return, never NULL
create policy "Owners and closers can manage leads"
  on public.leads for all
  using (
    case 
      when public.get_user_role() in ('owner', 'closer') then true
      else false
    end
  );

-- 3. Cold callers can update leads they're assigned to
-- Using CASE WHEN to ensure boolean return, never NULL
create policy "Cold callers can update assigned leads"
  on public.leads for update
  using (
    case 
      when public.get_user_role() = 'cold_caller' and
           (cold_caller_id = auth.uid() or
            list_id in (
              select id from public.lead_lists
              where auth.uid() = any(assigned_cold_callers)
            )) then true
      else false
    end
  );
