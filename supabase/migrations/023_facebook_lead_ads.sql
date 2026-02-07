-- Facebook Lead Ads table to store leads from Facebook Lead Ads webhook
create table if not exists public.facebook_lead_ads (
  id uuid primary key default uuid_generate_v4(),
  leadgen_id text unique not null,
  page_id text,
  ad_id text,
  adset_id text,
  campaign_id text,
  form_id text,
  name text,
  email text,
  phone text,
  custom_fields jsonb default '{}',
  raw_data jsonb,
  created_at timestamptz not null default now(),
  synced_at timestamptz
);

-- Index for faster lookups
create index if not exists facebook_lead_ads_leadgen_id_idx on public.facebook_lead_ads(leadgen_id);
create index if not exists facebook_lead_ads_created_at_idx on public.facebook_lead_ads(created_at desc);

-- Enable RLS
alter table public.facebook_lead_ads enable row level security;

-- RLS policy: accessible by owners and media_buyers (matching agency_ads pattern)
create policy "Owners media_buyers facebook_lead_ads"
  on public.facebook_lead_ads for all
  using (public.get_user_role() in ('owner', 'media_buyer'));
