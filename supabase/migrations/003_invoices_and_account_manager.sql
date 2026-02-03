-- Add account_manager role to profiles (drop and re-add check)
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('owner', 'account_manager', 'closer', 'media_buyer', 'cold_caller'));

-- Invoices table (Stripe-ready shell)
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.clients(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  -- Stripe fields (populated when Stripe is configured)
  stripe_invoice_id text,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  -- Invoice data
  status text not null default 'draft' check (status in ('draft', 'pending', 'sent', 'paid', 'void')),
  currency text not null default 'usd',
  amount_total decimal(12,2) not null default 0,
  amount_due decimal(12,2),
  due_date date,
  -- Line items: [{ description, quantity, unit_amount, amount }]
  line_items jsonb not null default '[]',
  memo text,
  footer text,
  -- Timestamps
  sent_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.invoices enable row level security;

create policy "Owners and account_managers invoices"
  on public.invoices for all
  using (public.get_user_role() in ('owner', 'account_manager'));

-- Allow account_manager to read clients (for invoice dropdown)
create policy "Account managers read clients"
  on public.clients for select
  using (public.get_user_role() = 'account_manager');
