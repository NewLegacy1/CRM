-- Drop legacy policies that override demo isolation

-- Clients
drop policy if exists "Owners full access clients" on public.clients;
drop policy if exists "Closers and media buyers can read clients" on public.clients;
drop policy if exists "Closers can manage clients" on public.clients;
drop policy if exists "Account managers read clients" on public.clients;

-- Lead lists
drop policy if exists "Owners full access lead_lists" on public.lead_lists;
drop policy if exists "Cold callers read assigned lists" on public.lead_lists;
drop policy if exists "All users can read all lead lists" on public.lead_lists;
drop policy if exists "Owners and closers can manage lead lists" on public.lead_lists;

-- Leads
drop policy if exists "Owners full access leads" on public.leads;
drop policy if exists "Closers full access leads" on public.leads;
drop policy if exists "Cold callers access assigned leads" on public.leads;
drop policy if exists "All users can read all leads" on public.leads;
drop policy if exists "Owners and closers can manage leads" on public.leads;
drop policy if exists "Cold callers can update assigned leads" on public.leads;

-- Projects
drop policy if exists "Owners and closers projects" on public.projects;

-- Deals
drop policy if exists "Owners and closers deals" on public.deals;

-- Meetings
drop policy if exists "Owners closers cold_callers meetings" on public.meetings;

-- Ads
drop policy if exists "Owners media_buyers ads" on public.ads;

-- Agency ads
drop policy if exists "Owners media_buyers agency_ads" on public.agency_ads;

-- Ad creatives
drop policy if exists "Owners media_buyers ad_creatives" on public.ad_creatives;

-- Invoices
drop policy if exists "Owners and account_managers invoices" on public.invoices;

-- AI insights
drop policy if exists "Owners ai_insights" on public.ai_insights;

-- Activity log
drop policy if exists "Owners can view activity log" on public.activity_log;
