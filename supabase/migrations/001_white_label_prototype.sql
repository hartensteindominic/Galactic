-- White-label fintech prototype ledger.
-- This migration stores SIMULATED financial data only. Never seed or import real account numbers.

create extension if not exists pgcrypto;

create table if not exists public.fintech_tenants (
  id uuid primary key default gen_random_uuid(),
  tenant_key text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.fintech_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  external_user_id text not null,
  display_name text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, external_user_id)
);

create table if not exists public.fintech_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  profile_id uuid not null references public.fintech_profiles(id) on delete cascade,
  label text not null,
  account_type text not null check (account_type in ('checking', 'savings', 'wallet')),
  routing_number text not null default '000000000',
  account_last4 text not null,
  balance_cents bigint not null default 0,
  currency text not null default 'USD' check (currency = 'USD'),
  simulated boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, id)
);

create table if not exists public.fintech_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  profile_id uuid not null references public.fintech_profiles(id) on delete cascade,
  account_id uuid not null references public.fintech_accounts(id) on delete cascade,
  direction text not null check (direction in ('debit', 'credit')),
  amount_cents bigint not null check (amount_cents > 0),
  name text not null,
  category text not null default 'Other',
  status text not null default 'posted' check (status in ('pending', 'posted', 'failed')),
  provider text not null default 'prototype',
  provider_reference text,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists fintech_transactions_account_time_idx
  on public.fintech_transactions(account_id, occurred_at desc);
create index if not exists fintech_transactions_tenant_profile_idx
  on public.fintech_transactions(tenant_id, profile_id, occurred_at desc);

create table if not exists public.fintech_linked_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  profile_id uuid not null references public.fintech_profiles(id) on delete cascade,
  provider text not null,
  institution_name text not null,
  provider_account_id text not null,
  account_last4 text,
  routing_last4 text,
  subtype text,
  simulated boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, profile_id, provider, provider_account_id)
);

-- Browser clients receive no direct table grants in this prototype. All reads/writes flow
-- through server-only Next.js API routes. This keeps the Supabase secret key off the client.
alter table public.fintech_tenants enable row level security;
alter table public.fintech_profiles enable row level security;
alter table public.fintech_accounts enable row level security;
alter table public.fintech_transactions enable row level security;
alter table public.fintech_linked_accounts enable row level security;

revoke all on table public.fintech_tenants from anon, authenticated;
revoke all on table public.fintech_profiles from anon, authenticated;
revoke all on table public.fintech_accounts from anon, authenticated;
revoke all on table public.fintech_transactions from anon, authenticated;
revoke all on table public.fintech_linked_accounts from anon, authenticated;

grant select, insert, update, delete on table public.fintech_tenants to service_role;
grant select, insert, update, delete on table public.fintech_profiles to service_role;
grant select, insert, update, delete on table public.fintech_accounts to service_role;
grant select, insert, update, delete on table public.fintech_transactions to service_role;
grant select, insert, update, delete on table public.fintech_linked_accounts to service_role;

create or replace function public.simulate_fintech_transfer(
  p_tenant_key text,
  p_user_external_id text,
  p_from_account_id uuid,
  p_recipient text,
  p_amount_cents bigint,
  p_memo text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_profile_id uuid;
  v_balance bigint;
  v_simulated boolean;
  v_transaction_id uuid;
begin
  if p_amount_cents < 1 or p_amount_cents > 1000000 then
    raise exception 'Prototype transfers must be between $0.01 and $10,000.00.';
  end if;

  if length(trim(coalesce(p_recipient, ''))) < 1 then
    raise exception 'Recipient is required.';
  end if;

  select id into v_tenant_id
  from public.fintech_tenants
  where tenant_key = p_tenant_key;

  if v_tenant_id is null then
    raise exception 'Unknown tenant.';
  end if;

  select id into v_profile_id
  from public.fintech_profiles
  where tenant_id = v_tenant_id and external_user_id = p_user_external_id;

  if v_profile_id is null then
    raise exception 'Unknown prototype user.';
  end if;

  select balance_cents, simulated into v_balance, v_simulated
  from public.fintech_accounts
  where id = p_from_account_id
    and tenant_id = v_tenant_id
    and profile_id = v_profile_id
  for update;

  if v_balance is null then
    raise exception 'Source account not found.';
  end if;

  if not v_simulated then
    raise exception 'Prototype transfer function cannot touch non-simulated accounts.';
  end if;

  if v_balance < p_amount_cents then
    raise exception 'Insufficient simulated funds.';
  end if;

  update public.fintech_accounts
  set balance_cents = balance_cents - p_amount_cents
  where id = p_from_account_id;

  insert into public.fintech_transactions (
    tenant_id,
    profile_id,
    account_id,
    direction,
    amount_cents,
    name,
    category,
    status,
    provider,
    metadata
  ) values (
    v_tenant_id,
    v_profile_id,
    p_from_account_id,
    'debit',
    p_amount_cents,
    trim(p_recipient),
    'Sandbox Transfer',
    'posted',
    'prototype',
    jsonb_build_object('memo', nullif(trim(coalesce(p_memo, '')), ''))
  ) returning id into v_transaction_id;

  return jsonb_build_object(
    'id', v_transaction_id,
    'status', 'simulated',
    'amount_cents', p_amount_cents,
    'recipient', trim(p_recipient),
    'message', 'Simulated transfer recorded. No real money moved.'
  );
end;
$$;

revoke all on function public.simulate_fintech_transfer(text, text, uuid, text, bigint, text) from public, anon, authenticated;
grant execute on function public.simulate_fintech_transfer(text, text, uuid, text, bigint, text) to service_role;

-- Seed a first tenant and synthetic user for investor/customer demos.
insert into public.fintech_tenants (tenant_key, name)
values ('galactic-trust', 'Galactic Trust')
on conflict (tenant_key) do update set name = excluded.name;

insert into public.fintech_profiles (tenant_id, external_user_id, display_name)
select id, 'demo-nova', 'Nova Star'
from public.fintech_tenants
where tenant_key = 'galactic-trust'
on conflict (tenant_id, external_user_id) do update set display_name = excluded.display_name;

insert into public.fintech_accounts (
  id, tenant_id, profile_id, label, account_type, routing_number, account_last4, balance_cents, simulated
)
select
  '11111111-1111-4111-8111-111111111111'::uuid,
  t.id,
  p.id,
  'Demo Checking',
  'checking',
  '000000000',
  '4532',
  1523045,
  true
from public.fintech_tenants t
join public.fintech_profiles p on p.tenant_id = t.id and p.external_user_id = 'demo-nova'
where t.tenant_key = 'galactic-trust'
on conflict (id) do nothing;

insert into public.fintech_accounts (
  id, tenant_id, profile_id, label, account_type, routing_number, account_last4, balance_cents, simulated
)
select
  '22222222-2222-4222-8222-222222222222'::uuid,
  t.id,
  p.id,
  'Demo Savings',
  'savings',
  '000000000',
  '8756',
  912027,
  true
from public.fintech_tenants t
join public.fintech_profiles p on p.tenant_id = t.id and p.external_user_id = 'demo-nova'
where t.tenant_key = 'galactic-trust'
on conflict (id) do nothing;

insert into public.fintech_transactions (
  id, tenant_id, profile_id, account_id, direction, amount_cents, name, category, provider, occurred_at
)
select
  '33333333-3333-4333-8333-333333333331'::uuid,
  t.id,
  p.id,
  '11111111-1111-4111-8111-111111111111'::uuid,
  'credit',
  285000,
  'Payroll Direct Deposit',
  'Income',
  'seed',
  now() - interval '2 days'
from public.fintech_tenants t
join public.fintech_profiles p on p.tenant_id = t.id and p.external_user_id = 'demo-nova'
where t.tenant_key = 'galactic-trust'
on conflict (id) do nothing;

insert into public.fintech_transactions (
  id, tenant_id, profile_id, account_id, direction, amount_cents, name, category, provider, occurred_at
)
select
  '33333333-3333-4333-8333-333333333332'::uuid,
  t.id,
  p.id,
  '11111111-1111-4111-8111-111111111111'::uuid,
  'debit',
  8932,
  'Demo Marketplace',
  'Shopping',
  'seed',
  now() - interval '1 day'
from public.fintech_tenants t
join public.fintech_profiles p on p.tenant_id = t.id and p.external_user_id = 'demo-nova'
where t.tenant_key = 'galactic-trust'
on conflict (id) do nothing;
