-- Add demo isolation for ads and agency_ads tables

alter table public.ads
  add column if not exists is_demo boolean default false;

alter table public.agency_ads
  add column if not exists is_demo boolean default false;

create index if not exists idx_ads_is_demo on public.ads(is_demo);
create index if not exists idx_agency_ads_is_demo on public.agency_ads(is_demo);

-- Update RLS for ads
drop policy if exists "Owners media_buyers ads" on public.ads;
drop policy if exists "ads_select_policy" on public.ads;
drop policy if exists "ads_insert_policy" on public.ads;
drop policy if exists "ads_update_policy" on public.ads;
drop policy if exists "ads_delete_policy" on public.ads;

create policy "ads_select_policy" on public.ads
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    end
  );

create policy "ads_insert_policy" on public.ads
  for insert with check (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    )
  );

create policy "ads_update_policy" on public.ads
  for update using (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    )
  );

create policy "ads_delete_policy" on public.ads
  for delete using (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    )
  );

-- Update RLS for agency_ads
drop policy if exists "Owners media_buyers agency_ads" on public.agency_ads;
drop policy if exists "agency_ads_select_policy" on public.agency_ads;
drop policy if exists "agency_ads_insert_policy" on public.agency_ads;
drop policy if exists "agency_ads_update_policy" on public.agency_ads;
drop policy if exists "agency_ads_delete_policy" on public.agency_ads;

create policy "agency_ads_select_policy" on public.agency_ads
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    end
  );

create policy "agency_ads_insert_policy" on public.agency_ads
  for insert with check (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    )
  );

create policy "agency_ads_update_policy" on public.agency_ads
  for update using (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    )
  );

create policy "agency_ads_delete_policy" on public.agency_ads
  for delete using (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    )
  );
