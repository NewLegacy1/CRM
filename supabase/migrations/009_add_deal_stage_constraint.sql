-- Add check constraint to deals.stage to ensure valid stages
-- This ensures closed_won and closed_lost are allowed values

alter table public.deals drop constraint if exists deals_stage_check;
alter table public.deals add constraint deals_stage_check
  check (stage in ('qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'));
