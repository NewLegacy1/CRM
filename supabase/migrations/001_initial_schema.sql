-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'cold_caller' check (role in ('owner', 'closer', 'media_buyer', 'cold_caller')),
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Clients
create table public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text,
  phone text,
  company text,
  notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Lead lists
create table public.lead_lists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  niche text,
  total_count int not null default 0,
  assigned_cold_callers uuid[] default '{}',
  created_at timestamptz not null default now()
);

-- Leads
create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete set null,
  name text not null,
  email text,
  phone text not null,
  niche text,
  list_id uuid references public.lead_lists(id) on delete set null,
  status text not null default 'new' check (status in ('new', 'called', 'no_answer', 'didnt_book', 'booked')),
  cold_caller_id uuid references auth.users(id) on delete set null,
  source text,
  created_at timestamptz not null default now()
);

-- Projects
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  milestones jsonb,
  owner_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Deals
create table public.deals (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  name text not null,
  value decimal(12,2) not null default 0,
  stage text not null default 'qualification',
  closer_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Meetings
create table public.meetings (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid references public.leads(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  scheduled_at timestamptz not null,
  booked_by uuid not null references auth.users(id) on delete cascade,
  closer_id uuid references auth.users(id) on delete set null,
  source text not null default 'cold_call',
  notes text,
  created_at timestamptz not null default now()
);

-- Ads
create table public.ads (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  platform text,
  spend decimal(12,2) default 0,
  revenue decimal(12,2) default 0,
  status text default 'active',
  created_at timestamptz not null default now()
);

-- Funnels
create table public.funnels (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  steps jsonb,
  conversion_rate decimal(5,2),
  created_at timestamptz not null default now()
);

-- Sites
create table public.sites (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  funnel_id uuid references public.funnels(id) on delete set null,
  url text not null,
  name text,
  created_at timestamptz not null default now()
);

-- Call logs
create table public.call_logs (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  cold_caller_id uuid not null references auth.users(id) on delete cascade,
  outcome text not null check (outcome in ('no_answer', 'didnt_book', 'booked')),
  duration_sec int,
  notes text,
  created_at timestamptz not null default now()
);

-- AI insights
create table public.ai_insights (
  id uuid primary key default uuid_generate_v4(),
  date date not null unique,
  summary text,
  actionable_items jsonb,
  created_at timestamptz not null default now()
);

-- Analytics snapshots
create table public.analytics_snapshots (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  client_id uuid references public.clients(id) on delete set null,
  roas decimal(10,2),
  aov decimal(12,2),
  ad_spend decimal(12,2),
  revenue decimal(12,2),
  created_at timestamptz not null default now()
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    'cold_caller',
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS: Enable on all tables
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.lead_lists enable row level security;
alter table public.leads enable row level security;
alter table public.projects enable row level security;
alter table public.deals enable row level security;
alter table public.meetings enable row level security;
alter table public.ads enable row level security;
alter table public.funnels enable row level security;
alter table public.sites enable row level security;
alter table public.call_logs enable row level security;
alter table public.ai_insights enable row level security;
alter table public.analytics_snapshots enable row level security;

-- Helper: get current user role
create or replace function public.get_user_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql security definer stable;

-- Profiles: users can read their own
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Profiles: owners can read/update all
create policy "Owners can manage all profiles"
  on public.profiles for all
  using (public.get_user_role() = 'owner');

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Clients: owner full access
create policy "Owners full access clients"
  on public.clients for all
  using (public.get_user_role() = 'owner');

-- Clients: closer, media_buyer can select
create policy "Closers and media buyers can read clients"
  on public.clients for select
  using (public.get_user_role() in ('closer', 'media_buyer'));

-- Clients: closer can insert/update
create policy "Closers can manage clients"
  on public.clients for all
  using (public.get_user_role() = 'closer');

-- Lead lists: owner full, cold_callers read assigned
create policy "Owners full access lead_lists"
  on public.lead_lists for all
  using (public.get_user_role() = 'owner');

create policy "Cold callers read assigned lists"
  on public.lead_lists for select
  using (
    auth.uid() = any(assigned_cold_callers) or
    public.get_user_role() in ('owner', 'closer')
  );

-- Leads: owner full, cold_callers assigned, closers full
create policy "Owners full access leads"
  on public.leads for all
  using (public.get_user_role() = 'owner');

create policy "Closers full access leads"
  on public.leads for all
  using (public.get_user_role() = 'closer');

create policy "Cold callers access assigned leads"
  on public.leads for all
  using (
    cold_caller_id = auth.uid() or
    list_id in (
      select id from public.lead_lists
      where auth.uid() = any(assigned_cold_callers)
    )
  );

-- Projects: owner and closer
create policy "Owners and closers projects"
  on public.projects for all
  using (public.get_user_role() in ('owner', 'closer'));

-- Deals: owner and closer
create policy "Owners and closers deals"
  on public.deals for all
  using (public.get_user_role() in ('owner', 'closer'));

-- Meetings: owner, closer, cold_caller (for booking)
create policy "Owners closers cold_callers meetings"
  on public.meetings for all
  using (
    public.get_user_role() in ('owner', 'closer') or
    public.get_user_role() = 'cold_caller'
  );

-- Ads, funnels, sites: owner and media_buyer
create policy "Owners media_buyers ads"
  on public.ads for all
  using (public.get_user_role() in ('owner', 'media_buyer'));

create policy "Owners media_buyers funnels"
  on public.funnels for all
  using (public.get_user_role() in ('owner', 'media_buyer'));

create policy "Owners media_buyers sites"
  on public.sites for all
  using (public.get_user_role() in ('owner', 'media_buyer'));

-- Call logs: owner full, cold_callers own
create policy "Owners full call_logs"
  on public.call_logs for all
  using (public.get_user_role() = 'owner');

create policy "Cold callers own call_logs"
  on public.call_logs for all
  using (cold_caller_id = auth.uid());

-- AI insights: owner only
create policy "Owners ai_insights"
  on public.ai_insights for all
  using (public.get_user_role() = 'owner');

-- Analytics snapshots: owner and media_buyer
create policy "Owners media_buyers analytics"
  on public.analytics_snapshots for all
  using (public.get_user_role() in ('owner', 'media_buyer'));
