-- Fix leads insert policy to handle NULL role properly
-- The issue is that get_user_role() can return NULL, and when PostgreSQL combines
-- multiple RLS policies with OR, NULL values cause "argument of OR must be type boolean" error
-- 
-- Solution: Use CASE WHEN to explicitly return boolean false when role is NULL or doesn't match

-- Drop existing policies
drop policy if exists "Owners and closers can manage leads" on public.leads;
drop policy if exists "Cold callers can update assigned leads" on public.leads;

-- Recreate "Owners and closers can manage leads" with explicit boolean return
create policy "Owners and closers can manage leads"
  on public.leads for all
  using (
    case 
      when public.get_user_role() in ('owner', 'closer') then true
      else false
    end
  );

-- Recreate "Cold callers can update assigned leads" with explicit boolean return
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
