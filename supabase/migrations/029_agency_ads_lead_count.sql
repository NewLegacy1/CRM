-- Add number of leads to agency ads table
alter table public.agency_ads
  add column if not exists lead_count integer not null default 0;
