-- Add 'pending' role for new users who haven't been assigned a role yet
-- This ensures new signups see nothing until manually approved

-- Update role constraint to include 'pending'
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('pending', 'owner', 'account_manager', 'closer', 'media_buyer', 'cold_caller'));

-- Update default role to 'pending' instead of 'cold_caller'
alter table public.profiles alter column role set default 'pending';

-- Update the trigger to create profiles with 'pending' role
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'pending',  -- Changed from 'cold_caller' to 'pending'
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Update existing users who might not have a role set (set to pending if null)
update public.profiles set role = 'pending' where role is null;

-- RLS: Pending users should see nothing
-- They can only see their own profile

-- Profiles: Pending users can only see their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Note: RLS policies are additive (OR), so we need to ensure pending users are excluded
-- The existing policies will continue to work, but pending users won't match any of them
-- because they don't have the required roles. The get_user_role() function will return 'pending'
-- which won't match any existing role checks.

-- We don't need to recreate all policies - the existing ones already check for specific roles
-- and 'pending' won't match any of those checks, so pending users will see nothing by default.
