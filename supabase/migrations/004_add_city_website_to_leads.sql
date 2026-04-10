-- Add city and website fields to leads table
alter table public.leads
  add column if not exists city text,
  add column if not exists website text;
