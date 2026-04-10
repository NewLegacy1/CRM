-- Add 'demo' role to profiles role check constraint
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('pending', 'owner', 'account_manager', 'closer', 'media_buyer', 'cold_caller', 'demo'));
