-- Cash-flow planning data for the SIMULATED white-label prototype.
-- This migration stores synthetic schedules and goals only. It does not schedule or move real money.

create table if not exists public.fintech_cashflow_items (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  profile_id uuid not null references public.fintech_profiles(id) on delete cascade,
  kind text not null check (kind in ('income', 'bill', 'planned_savings')),
  name text not null,
  amount_cents bigint not null check (amount_cents > 0),
  scheduled_for date not null,
  confidence text not null default 'scheduled' check (confidence in ('scheduled', 'estimated')),
  recurring boolean not null default false,
  simulated boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists fintech_cashflow_items_profile_date_idx
  on public.fintech_cashflow_items(tenant_id, profile_id, scheduled_for asc);

create table if not exists public.fintech_savings_goals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  profile_id uuid not null references public.fintech_profiles(id) on delete cascade,
  name text not null,
  target_cents bigint not null check (target_cents > 0),
  saved_cents bigint not null default 0 check (saved_cents >= 0),
  target_date date,
  simulated boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.fintech_cashflow_items enable row level security;
alter table public.fintech_savings_goals enable row level security;

revoke all on table public.fintech_cashflow_items from anon, authenticated;
revoke all on table public.fintech_savings_goals from anon, authenticated;

grant select, insert, update, delete on table public.fintech_cashflow_items to service_role;
grant select, insert, update, delete on table public.fintech_savings_goals to service_role;

-- Seed deterministic synthetic planning data for the Galactic Trust demo user.
-- Existing rows are replaced only for this seeded demo profile to keep reruns predictable.
delete from public.fintech_cashflow_items c
using public.fintech_tenants t, public.fintech_profiles p
where c.tenant_id = t.id
  and c.profile_id = p.id
  and p.tenant_id = t.id
  and t.tenant_key = 'galactic-trust'
  and p.external_user_id = 'demo-nova'
  and c.metadata->>'seed_key' = 'cashflow-v1';

insert into public.fintech_cashflow_items (
  tenant_id, profile_id, kind, name, amount_cents, scheduled_for, confidence, recurring, simulated, metadata
)
select t.id, p.id, x.kind, x.name, x.amount_cents, current_date + x.day_offset, x.confidence, x.recurring, true,
       jsonb_build_object('seed_key', 'cashflow-v1')
from public.fintech_tenants t
join public.fintech_profiles p on p.tenant_id = t.id and p.external_user_id = 'demo-nova'
cross join (values
  ('bill'::text, 'Rent', 140000::bigint, 4, 'scheduled'::text, true),
  ('income', 'Payroll', 285000, 7, 'scheduled', true),
  ('bill', 'Phone', 7800, 9, 'scheduled', true),
  ('bill', 'Music subscription', 1199, 12, 'scheduled', true),
  ('planned_savings', 'Emergency fund', 50000, 14, 'estimated', true),
  ('bill', 'Utilities', 12400, 18, 'estimated', true),
  ('income', 'Payroll', 285000, 21, 'scheduled', true),
  ('bill', 'Internet', 6900, 24, 'scheduled', true),
  ('planned_savings', 'Emergency fund', 50000, 28, 'estimated', true)
) as x(kind, name, amount_cents, day_offset, confidence, recurring)
where t.tenant_key = 'galactic-trust';

insert into public.fintech_savings_goals (
  id, tenant_id, profile_id, name, target_cents, saved_cents, target_date, simulated
)
select
  '55555555-5555-4555-8555-555555555555'::uuid,
  t.id,
  p.id,
  'Emergency fund',
  300000,
  125000,
  current_date + 120,
  true
from public.fintech_tenants t
join public.fintech_profiles p on p.tenant_id = t.id and p.external_user_id = 'demo-nova'
where t.tenant_key = 'galactic-trust'
on conflict (id) do update set
  target_cents = excluded.target_cents,
  saved_cents = excluded.saved_cents,
  target_date = excluded.target_date,
  simulated = true;
