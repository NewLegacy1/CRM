-- Track SaaS subscriptions (DetailOps, future apps) synced from Stripe webhooks.

create table if not exists public.app_products (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text,
  url text,
  stripe_product_ids text[] not null default '{}',
  created_at timestamptz not null default now()
);

insert into public.app_products (slug, name, description, url, stripe_product_ids)
values (
  'detailops',
  'DetailOps',
  'CRM for auto detailers — booking, deposits, reminders, invoicing.',
  'https://detailops.ca',
  array['prod_U3zgHA1XvSVodu', 'prod_U3zjAQI36qyOZY']
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  url = excluded.url,
  stripe_product_ids = excluded.stripe_product_ids;

create table if not exists public.stripe_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  app_slug text not null references public.app_products(slug) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  customer_email text,
  customer_name text,
  status text not null,
  plan_name text,
  stripe_product_id text,
  stripe_price_id text,
  amount_cents integer,
  currency text not null default 'cad',
  billing_interval text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  canceled_at timestamptz,
  trial_end timestamptz,
  stripe_created_at timestamptz not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_stripe_subscriptions_app_slug
  on public.stripe_subscriptions(app_slug);

create index if not exists idx_stripe_subscriptions_status
  on public.stripe_subscriptions(status);

create index if not exists idx_stripe_subscriptions_stripe_created_at
  on public.stripe_subscriptions(stripe_created_at desc);

create table if not exists public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.app_products enable row level security;
alter table public.stripe_subscriptions enable row level security;
alter table public.stripe_webhook_events enable row level security;

create policy "Owners can view app products"
  on public.app_products for select
  using (public.get_user_role() = 'owner');

create policy "Owners can view stripe subscriptions"
  on public.stripe_subscriptions for select
  using (public.get_user_role() = 'owner');
