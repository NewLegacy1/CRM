-- Cold-calling outcomes: callback + objection reasons; call_logs outcomes aligned

alter table public.leads
  drop constraint if exists leads_status_check;

alter table public.leads
  add constraint leads_status_check check (
    status in (
      'new',
      'called',
      'no_answer',
      'didnt_book',
      'booked',
      'called_no_answer',
      'answered_declined_demo',
      'answered_accepted_demo',
      'call_back',
      'no_price',
      'no_dont_want'
    )
  );

do $$
declare
  con_name text;
begin
  select c.conname into con_name
  from pg_constraint c
  join pg_class t on c.conrelid = t.oid
  join pg_namespace n on t.relnamespace = n.oid
  where n.nspname = 'public'
    and t.relname = 'call_logs'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) ilike '%outcome%'
  limit 1;
  if con_name is not null then
    execute format('alter table public.call_logs drop constraint %I', con_name);
  end if;
end $$;

alter table public.call_logs
  add constraint call_logs_outcome_check check (
    outcome in (
      'no_answer',
      'didnt_book',
      'booked',
      'call_back',
      'no_price',
      'no_dont_want'
    )
  );
