-- Add video uploads and demo isolation for ad creatives

alter table public.ad_creatives
  add column if not exists video_urls text[] default '{}',
  add column if not exists is_demo boolean default false;

create index if not exists idx_ad_creatives_is_demo on public.ad_creatives(is_demo);

-- Update RLS for ad_creatives to support demo isolation
drop policy if exists "Owners media_buyers ad_creatives" on public.ad_creatives;

create policy "ad_creatives_select_policy" on public.ad_creatives
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    end
  );

create policy "ad_creatives_insert_policy" on public.ad_creatives
  for insert with check (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    )
  );

create policy "ad_creatives_update_policy" on public.ad_creatives
  for update using (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    )
  );

create policy "ad_creatives_delete_policy" on public.ad_creatives
  for delete using (
    (
      get_user_role(auth.uid()) = 'demo' and is_demo = true
    )
    or
    (
      get_user_role(auth.uid()) in ('owner', 'media_buyer') and (is_demo = false or is_demo is null)
    )
  );

-- Create storage bucket for ad creatives (public read)
insert into storage.buckets (id, name, public)
values ('ad-creatives', 'ad-creatives', true)
on conflict (id) do nothing;

-- Storage policies for uploads
drop policy if exists "ad_creatives_storage_read" on storage.objects;
drop policy if exists "ad_creatives_storage_insert" on storage.objects;
drop policy if exists "ad_creatives_storage_update" on storage.objects;
drop policy if exists "ad_creatives_storage_delete" on storage.objects;

create policy "ad_creatives_storage_read" on storage.objects
  for select using (
    bucket_id = 'ad-creatives' and (
      (get_user_role(auth.uid()) = 'demo' and name like 'demo/%')
      or
      (get_user_role(auth.uid()) in ('owner', 'media_buyer') and name like 'prod/%')
    )
  );

create policy "ad_creatives_storage_insert" on storage.objects
  for insert with check (
    bucket_id = 'ad-creatives' and (
      (get_user_role(auth.uid()) = 'demo' and name like 'demo/%')
      or
      (get_user_role(auth.uid()) in ('owner', 'media_buyer') and name like 'prod/%')
    )
  );

create policy "ad_creatives_storage_update" on storage.objects
  for update using (
    bucket_id = 'ad-creatives' and (
      (get_user_role(auth.uid()) = 'demo' and name like 'demo/%')
      or
      (get_user_role(auth.uid()) in ('owner', 'media_buyer') and name like 'prod/%')
    )
  );

create policy "ad_creatives_storage_delete" on storage.objects
  for delete using (
    bucket_id = 'ad-creatives' and (
      (get_user_role(auth.uid()) = 'demo' and name like 'demo/%')
      or
      (get_user_role(auth.uid()) in ('owner', 'media_buyer') and name like 'prod/%')
    )
  );
