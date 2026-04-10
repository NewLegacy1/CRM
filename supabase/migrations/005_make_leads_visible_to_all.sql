-- Drop existing lead policies
drop policy if exists "Owners full access leads" on public.leads;
drop policy if exists "Closers full access leads" on public.leads;
drop policy if exists "Cold callers access assigned leads" on public.leads;

-- New policy: All authenticated users can read all leads
create policy "All users can read all leads"
  on public.leads for select
  using (auth.uid() is not null);

-- Owners and closers can insert/update/delete leads
create policy "Owners and closers can manage leads"
  on public.leads for all
  using (public.get_user_role() in ('owner', 'closer'));

-- Cold callers can update leads they're assigned to (for status updates during calling)
create policy "Cold callers can update assigned leads"
  on public.leads for update
  using (
    public.get_user_role() = 'cold_caller' and
    (cold_caller_id = auth.uid() or
     list_id in (
       select id from public.lead_lists
       where auth.uid() = any(assigned_cold_callers)
     ))
  );
