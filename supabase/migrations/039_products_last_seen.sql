-- Track when owner last viewed Products so we can badge new Stripe subscribers.
alter table public.profiles
  add column if not exists products_last_seen_at timestamptz;

-- Existing owners shouldn't get badges for subscribers already in Stripe.
update public.profiles
set products_last_seen_at = now()
where role = 'owner' and products_last_seen_at is null;
