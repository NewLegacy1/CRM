-- Projects: add type, progress, updates
alter table public.projects
  add column if not exists type text default 'website',
  add column if not exists progress int default 0 check (progress >= 0 and progress <= 100),
  add column if not exists updates jsonb default '[]';

-- Deals: link to meeting (deal created from booked meeting); allow null client for cold-call deals
alter table public.deals
  add column if not exists meeting_id uuid references public.meetings(id) on delete set null;
alter table public.deals alter column client_id drop not null;

-- Lead lists: store CSV column mapping for uploads
alter table public.lead_lists
  add column if not exists csv_column_map jsonb;

-- Our agency ads (Meta/Google API tracking) - new table
create table if not exists public.agency_ads (
  id uuid primary key default uuid_generate_v4(),
  platform text not null check (platform in ('meta', 'google')),
  campaign_name text,
  campaign_id text,
  spend decimal(12,2) default 0,
  impressions bigint default 0,
  clicks bigint default 0,
  conversions decimal(12,2) default 0,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

-- Ad creatives (copy/design for media buyers - plug and play)
create table if not exists public.ad_creatives (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  platform text not null check (platform in ('meta', 'google')),
  name text not null,
  primary_text text,
  headline text,
  cta text,
  image_urls text[] default '{}',
  variants jsonb default '[]',
  created_at timestamptz not null default now()
);

-- Funnels and sites: link to project (for sub-pages under projects)
alter table public.funnels
  add column if not exists project_id uuid references public.projects(id) on delete set null;

alter table public.sites
  add column if not exists project_id uuid references public.projects(id) on delete set null;

-- RLS for new tables
alter table public.agency_ads enable row level security;
alter table public.ad_creatives enable row level security;

create policy "Owners media_buyers agency_ads"
  on public.agency_ads for all
  using (public.get_user_role() in ('owner', 'media_buyer'));

create policy "Owners media_buyers ad_creatives"
  on public.ad_creatives for all
  using (public.get_user_role() in ('owner', 'media_buyer'));

-- Settings table for calendar embed URL etc.
create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create policy "Owners app_settings"
  on public.app_settings for all
  using (public.get_user_role() = 'owner');
