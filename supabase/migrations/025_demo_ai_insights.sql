-- Add demo isolation for AI insights

alter table public.ai_insights
  add column if not exists is_demo boolean default false;

create index if not exists idx_ai_insights_is_demo on public.ai_insights(is_demo);

-- Update RLS for ai_insights to support demo isolation
drop policy if exists "Owners ai_insights" on public.ai_insights;

create policy "ai_insights_select_policy" on public.ai_insights
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else get_user_role(auth.uid()) = 'owner' and (is_demo = false or is_demo is null)
    end
  );

create policy "ai_insights_insert_policy" on public.ai_insights
  for insert with check (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) = 'owner' and (is_demo = false or is_demo is null)
    )
  );

create policy "ai_insights_update_policy" on public.ai_insights
  for update using (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) = 'owner' and (is_demo = false or is_demo is null)
    )
  );

create policy "ai_insights_delete_policy" on public.ai_insights
  for delete using (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) = 'owner' and (is_demo = false or is_demo is null)
    )
  );
