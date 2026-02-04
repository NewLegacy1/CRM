-- FIX: The actual bug causing "argument of OR must be type boolean, not type text"
-- The log_activity function had "display_name or email" which is invalid SQL
-- It should use COALESCE instead

create or replace function public.log_activity(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_user_id uuid,
  p_details jsonb default '{}'::jsonb
)
returns void as $$
declare
  v_user_name text;
begin
  -- Get user name from profiles (profiles table only has display_name, not email)
  select display_name into v_user_name
  from public.profiles
  where id = p_user_id;
  
  -- If no display_name in profiles, get email from auth.users
  if v_user_name is null then
    select email into v_user_name from auth.users where id = p_user_id;
  end if;
  
  insert into public.activity_log (
    entity_type,
    entity_id,
    action,
    user_id,
    user_name,
    details
  ) values (
    p_entity_type,
    p_entity_id,
    p_action,
    p_user_id,
    v_user_name,
    p_details
  );
end;
$$ language plpgsql security definer;
