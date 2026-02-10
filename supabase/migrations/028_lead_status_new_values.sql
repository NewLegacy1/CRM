-- Allow new lead status values: called_no_answer, answered_declined_demo, answered_accepted_demo
-- Drop the existing check constraint and add one that includes the new values

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
      'answered_accepted_demo'
    )
  );
