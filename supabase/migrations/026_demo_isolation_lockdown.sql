-- Lock down demo data visibility across all demo-enabled tables
-- Demo users see only is_demo=true, non-demo users never see is_demo=true

-- Clients
drop policy if exists "clients_select_policy" on public.clients;
create policy "clients_select_policy" on public.clients
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- Lead lists
drop policy if exists "lead_lists_select_policy" on public.lead_lists;
create policy "lead_lists_select_policy" on public.lead_lists
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- Leads
drop policy if exists "leads_select_policy" on public.leads;
create policy "leads_select_policy" on public.leads
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- Projects
drop policy if exists "projects_select_policy" on public.projects;
create policy "projects_select_policy" on public.projects
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- Deals
drop policy if exists "deals_select_policy" on public.deals;
create policy "deals_select_policy" on public.deals
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- Meetings
drop policy if exists "meetings_select_policy" on public.meetings;
create policy "meetings_select_policy" on public.meetings
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- Invoices
drop policy if exists "invoices_select_policy" on public.invoices;
create policy "invoices_select_policy" on public.invoices
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- Ads
drop policy if exists "ads_select_policy" on public.ads;
create policy "ads_select_policy" on public.ads
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- Agency ads
drop policy if exists "agency_ads_select_policy" on public.agency_ads;
create policy "agency_ads_select_policy" on public.agency_ads
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- Ad creatives
drop policy if exists "ad_creatives_select_policy" on public.ad_creatives;
create policy "ad_creatives_select_policy" on public.ad_creatives
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- AI insights
drop policy if exists "ai_insights_select_policy" on public.ai_insights;
create policy "ai_insights_select_policy" on public.ai_insights
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );

-- Activity log
drop policy if exists "activity_log_select_policy" on public.activity_log;
create policy "activity_log_select_policy" on public.activity_log
  for select using (
    case
      when get_user_role(auth.uid()) = 'demo' then is_demo = true
      else is_demo = false or is_demo is null
    end
  );
