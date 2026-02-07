-- Update lead_lists RLS to allow cold callers to see all lists
-- This matches the policy for leads where all users can read all leads

-- Drop existing cold caller policy
drop policy if exists "Cold callers read assigned lists" on public.lead_lists;

-- New policy: All authenticated users can read all lead lists
-- (matching the leads policy from migration 005)
create policy "All users can read all lead lists"
  on public.lead_lists for select
  using (auth.uid() is not null);

-- Owners and closers can manage lead lists
create policy "Owners and closers can manage lead lists"
  on public.lead_lists for all
  using (public.get_user_role() in ('owner', 'closer'));
