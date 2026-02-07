-- Activity log table to track all changes in the system
create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  entity_type text not null, -- 'client', 'project', 'deal', 'lead', 'invoice', 'meeting', 'ad', 'funnel', 'site'
  entity_id uuid not null,
  action text not null, -- 'created', 'updated', 'deleted', 'status_changed'
  user_id uuid references auth.users(id) on delete set null,
  user_name text, -- cached user name for display
  details jsonb, -- flexible details about what changed
  created_at timestamptz not null default now()
);

-- Index for efficient queries
create index if not exists idx_activity_log_created_at on public.activity_log(created_at desc);
create index if not exists idx_activity_log_entity on public.activity_log(entity_type, entity_id);
create index if not exists idx_activity_log_user on public.activity_log(user_id);

-- Enable RLS
alter table public.activity_log enable row level security;

-- Only owners can view activity log
create policy "Owners can view activity log" on public.activity_log
  for select using (public.get_user_role() = 'owner');

-- Function to log activity
create or replace function public.log_activity(
  p_entity_type text,
  p_entity_id uuid,
  p_action text,
  p_user_id uuid,
  p_details jsonb default '{}'::jsonb
)
returns void as $$
declare
  v_user_name text;
begin
  -- Get user name from profiles
  select display_name or email into v_user_name
  from public.profiles
  where id = p_user_id;
  
  if v_user_name is null then
    select email into v_user_name from auth.users where id = p_user_id;
  end if;
  
  insert into public.activity_log (
    entity_type,
    entity_id,
    action,
    user_id,
    user_name,
    details
  ) values (
    p_entity_type,
    p_entity_id,
    p_action,
    p_user_id,
    v_user_name,
    p_details
  );
end;
$$ language plpgsql security definer;

-- Trigger function for clients
create or replace function public.log_client_activity()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(
      'client',
      new.id,
      'created',
      new.created_by,
      jsonb_build_object('name', new.name, 'email', new.email)
    );
  elsif TG_OP = 'UPDATE' then
    perform public.log_activity(
      'client',
      new.id,
      'updated',
      auth.uid(),
      jsonb_build_object('name', new.name, 'changes', jsonb_build_object())
    );
  elsif TG_OP = 'DELETE' then
    perform public.log_activity(
      'client',
      old.id,
      'deleted',
      auth.uid(),
      jsonb_build_object('name', old.name)
    );
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Triggers for clients
drop trigger if exists log_client_insert on public.clients;
create trigger log_client_insert after insert on public.clients
  for each row execute function public.log_client_activity();

drop trigger if exists log_client_update on public.clients;
create trigger log_client_update after update on public.clients
  for each row execute function public.log_client_activity();

drop trigger if exists log_client_delete on public.clients;
create trigger log_client_delete after delete on public.clients
  for each row execute function public.log_client_activity();

-- Trigger function for projects
create or replace function public.log_project_activity()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(
      'project',
      new.id,
      'created',
      auth.uid(),
      jsonb_build_object('name', new.name, 'status', new.status, 'client_id', new.client_id)
    );
  elsif TG_OP = 'UPDATE' then
    -- Check if status changed
    if old.status is distinct from new.status then
      perform public.log_activity(
        'project',
        new.id,
        'status_changed',
        auth.uid(),
        jsonb_build_object('name', new.name, 'old_status', old.status, 'new_status', new.status)
      );
    else
      perform public.log_activity(
        'project',
        new.id,
        'updated',
        auth.uid(),
        jsonb_build_object('name', new.name)
      );
    end if;
  elsif TG_OP = 'DELETE' then
    perform public.log_activity(
      'project',
      old.id,
      'deleted',
      auth.uid(),
      jsonb_build_object('name', old.name)
    );
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Triggers for projects
drop trigger if exists log_project_insert on public.projects;
create trigger log_project_insert after insert on public.projects
  for each row execute function public.log_project_activity();

drop trigger if exists log_project_update on public.projects;
create trigger log_project_update after update on public.projects
  for each row execute function public.log_project_activity();

drop trigger if exists log_project_delete on public.projects;
create trigger log_project_delete after delete on public.projects
  for each row execute function public.log_project_activity();

-- Trigger function for deals
create or replace function public.log_deal_activity()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(
      'deal',
      new.id,
      'created',
      auth.uid(),
      jsonb_build_object('name', new.name, 'value', new.value, 'stage', new.stage, 'client_id', new.client_id)
    );
  elsif TG_OP = 'UPDATE' then
    -- Check if stage changed
    if old.stage is distinct from new.stage then
      perform public.log_activity(
        'deal',
        new.id,
        'status_changed',
        auth.uid(),
        jsonb_build_object(
          'name', new.name,
          'old_stage', old.stage,
          'new_stage', new.stage,
          'value', new.value
        )
      );
    else
      perform public.log_activity(
        'deal',
        new.id,
        'updated',
        auth.uid(),
        jsonb_build_object('name', new.name, 'value', new.value)
      );
    end if;
  elsif TG_OP = 'DELETE' then
    perform public.log_activity(
      'deal',
      old.id,
      'deleted',
      auth.uid(),
      jsonb_build_object('name', old.name)
    );
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Triggers for deals
drop trigger if exists log_deal_insert on public.deals;
create trigger log_deal_insert after insert on public.deals
  for each row execute function public.log_deal_activity();

drop trigger if exists log_deal_update on public.deals;
create trigger log_deal_update after update on public.deals
  for each row execute function public.log_deal_activity();

drop trigger if exists log_deal_delete on public.deals;
create trigger log_deal_delete after delete on public.deals
  for each row execute function public.log_deal_activity();

-- Trigger function for leads
create or replace function public.log_lead_activity()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(
      'lead',
      new.id,
      'created',
      auth.uid(),
      jsonb_build_object('name', new.name, 'phone', new.phone, 'status', new.status, 'list_id', new.list_id)
    );
  elsif TG_OP = 'UPDATE' then
    -- Check if status changed
    if old.status is distinct from new.status then
      perform public.log_activity(
        'lead',
        new.id,
        'status_changed',
        auth.uid(),
        jsonb_build_object(
          'name', new.name,
          'old_status', old.status,
          'new_status', new.status
        )
      );
    else
      perform public.log_activity(
        'lead',
        new.id,
        'updated',
        auth.uid(),
        jsonb_build_object('name', new.name)
      );
    end if;
  elsif TG_OP = 'DELETE' then
    perform public.log_activity(
      'lead',
      old.id,
      'deleted',
      auth.uid(),
      jsonb_build_object('name', old.name)
    );
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Triggers for leads
drop trigger if exists log_lead_insert on public.leads;
create trigger log_lead_insert after insert on public.leads
  for each row execute function public.log_lead_activity();

drop trigger if exists log_lead_update on public.leads;
create trigger log_lead_update after update on public.leads
  for each row execute function public.log_lead_activity();

drop trigger if exists log_lead_delete on public.leads;
create trigger log_lead_delete after delete on public.leads
  for each row execute function public.log_lead_activity();

-- Trigger function for invoices
create or replace function public.log_invoice_activity()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(
      'invoice',
      new.id,
      'created',
      new.created_by,
      jsonb_build_object('client_id', new.client_id, 'amount', new.amount_total, 'status', new.status)
    );
  elsif TG_OP = 'UPDATE' then
    -- Check if status changed
    if old.status is distinct from new.status then
      perform public.log_activity(
        'invoice',
        new.id,
        'status_changed',
        auth.uid(),
        jsonb_build_object(
          'old_status', old.status,
          'new_status', new.status,
          'amount', new.amount_total
        )
      );
    else
      perform public.log_activity(
        'invoice',
        new.id,
        'updated',
        auth.uid(),
        jsonb_build_object('amount', new.amount_total)
      );
    end if;
  elsif TG_OP = 'DELETE' then
    perform public.log_activity(
      'invoice',
      old.id,
      'deleted',
      auth.uid(),
      jsonb_build_object('amount', old.amount_total)
    );
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Triggers for invoices
drop trigger if exists log_invoice_insert on public.invoices;
create trigger log_invoice_insert after insert on public.invoices
  for each row execute function public.log_invoice_activity();

drop trigger if exists log_invoice_update on public.invoices;
create trigger log_invoice_update after update on public.invoices
  for each row execute function public.log_invoice_activity();

drop trigger if exists log_invoice_delete on public.invoices;
create trigger log_invoice_delete after delete on public.invoices
  for each row execute function public.log_invoice_activity();

-- Trigger function for meetings
create or replace function public.log_meeting_activity()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(
      'meeting',
      new.id,
      'created',
      new.booked_by,
      jsonb_build_object('scheduled_at', new.scheduled_at, 'source', new.source, 'lead_id', new.lead_id, 'client_id', new.client_id)
    );
  elsif TG_OP = 'UPDATE' then
    perform public.log_activity(
      'meeting',
      new.id,
      'updated',
      auth.uid(),
      jsonb_build_object('scheduled_at', new.scheduled_at)
    );
  elsif TG_OP = 'DELETE' then
    perform public.log_activity(
      'meeting',
      old.id,
      'deleted',
      auth.uid(),
      jsonb_build_object('scheduled_at', old.scheduled_at)
    );
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- Triggers for meetings
drop trigger if exists log_meeting_insert on public.meetings;
create trigger log_meeting_insert after insert on public.meetings
  for each row execute function public.log_meeting_activity();

drop trigger if exists log_meeting_update on public.meetings;
create trigger log_meeting_update after update on public.meetings
  for each row execute function public.log_meeting_activity();

drop trigger if exists log_meeting_delete on public.meetings;
create trigger log_meeting_delete after delete on public.meetings
  for each row execute function public.log_meeting_activity();

-- Trigger function for call logs (track no_answer, didnt_book, booked)
create or replace function public.log_call_log_activity()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    perform public.log_activity(
      'lead',
      new.lead_id,
      'status_changed',
      new.cold_caller_id,
      jsonb_build_object('outcome', new.outcome, 'action', 'call_logged')
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for call logs
drop trigger if exists log_call_log_insert on public.call_logs;
create trigger log_call_log_insert after insert on public.call_logs
  for each row execute function public.log_call_log_activity();
