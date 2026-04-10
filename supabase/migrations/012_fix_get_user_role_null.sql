-- Fix get_user_role() function to never return NULL
-- This is the root cause: when get_user_role() returns NULL, RLS policies
-- that use it can cause "argument of OR must be type boolean" errors
-- because NULL comparisons don't return boolean values properly

-- Update get_user_role() to return empty string instead of NULL
-- This ensures all comparisons will return proper boolean values
create or replace function public.get_user_role()
returns text as $$
  select coalesce(role, '') from public.profiles where id = auth.uid();
$$ language sql security definer stable;
