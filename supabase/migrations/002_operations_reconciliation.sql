-- Operations and reconciliation controls for the SIMULATED white-label fintech ledger.
-- This migration does not enable real money movement or provider write access.

alter table public.fintech_accounts
  add column if not exists opening_balance_cents bigint;

-- Establish a reconciliation anchor from the current simulated balance and posted ledger history.
-- After this migration, expected balance = opening balance + posted credits - posted debits.
with posted_totals as (
  select
    account_id,
    coalesce(sum(case when direction = 'credit' then amount_cents else -amount_cents end), 0)::bigint as posted_delta_cents
  from public.fintech_transactions
  where status = 'posted'
  group by account_id
)
update public.fintech_accounts a
set opening_balance_cents = a.balance_cents - coalesce(p.posted_delta_cents, 0)
from posted_totals p
where a.id = p.account_id
  and a.opening_balance_cents is null;

update public.fintech_accounts
set opening_balance_cents = balance_cents
where opening_balance_cents is null;

alter table public.fintech_accounts
  alter column opening_balance_cents set not null;

alter table public.fintech_linked_accounts
  add column if not exists sync_status text not null default 'idle'
    check (sync_status in ('idle', 'syncing', 'healthy', 'attention', 'error')),
  add column if not exists last_synced_at timestamptz,
  add column if not exists last_event_at timestamptz;

create table if not exists public.fintech_provider_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  status text not null default 'received'
    check (status in ('received', 'processed', 'ignored', 'failed')),
  payload_digest text not null,
  metadata jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (tenant_id, provider, provider_event_id)
);

create index if not exists fintech_provider_events_tenant_time_idx
  on public.fintech_provider_events(tenant_id, received_at desc);

create table if not exists public.fintech_reconciliation_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  profile_id uuid not null references public.fintech_profiles(id) on delete cascade,
  account_id uuid not null references public.fintech_accounts(id) on delete cascade,
  recorded_balance_cents bigint not null,
  expected_balance_cents bigint not null,
  delta_cents bigint not null,
  status text not null check (status in ('balanced', 'mismatch')),
  checked_at timestamptz not null default now()
);

create index if not exists fintech_reconciliation_runs_account_time_idx
  on public.fintech_reconciliation_runs(account_id, checked_at desc);

create table if not exists public.fintech_audit_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  actor_type text not null check (actor_type in ('system', 'demo_user', 'operator', 'provider')),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists fintech_audit_events_tenant_time_idx
  on public.fintech_audit_events(tenant_id, created_at desc);

alter table public.fintech_provider_events enable row level security;
alter table public.fintech_reconciliation_runs enable row level security;
alter table public.fintech_audit_events enable row level security;

revoke all on table public.fintech_provider_events from anon, authenticated;
revoke all on table public.fintech_reconciliation_runs from anon, authenticated;
revoke all on table public.fintech_audit_events from anon, authenticated;

grant select, insert, update, delete on table public.fintech_provider_events to service_role;
grant select, insert, update, delete on table public.fintech_reconciliation_runs to service_role;
grant select, insert, update, delete on table public.fintech_audit_events to service_role;

create or replace function public.reconcile_fintech_profile(
  p_tenant_key text,
  p_user_external_id text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
  v_profile_id uuid;
  v_account record;
  v_expected bigint;
  v_delta bigint;
  v_status text;
  v_balanced integer := 0;
  v_mismatched integer := 0;
  v_results jsonb := '[]'::jsonb;
begin
  select id into v_tenant_id
  from public.fintech_tenants
  where tenant_key = p_tenant_key;

  if v_tenant_id is null then
    raise exception 'Unknown tenant.';
  end if;

  select id into v_profile_id
  from public.fintech_profiles
  where tenant_id = v_tenant_id
    and external_user_id = p_user_external_id;

  if v_profile_id is null then
    raise exception 'Unknown prototype user.';
  end if;

  for v_account in
    select id, label, balance_cents, opening_balance_cents, simulated
    from public.fintech_accounts
    where tenant_id = v_tenant_id
      and profile_id = v_profile_id
    order by created_at asc
  loop
    if not v_account.simulated then
      raise exception 'Prototype reconciliation cannot inspect non-simulated accounts.';
    end if;

    select v_account.opening_balance_cents + coalesce(sum(
      case
        when status <> 'posted' then 0
        when direction = 'credit' then amount_cents
        else -amount_cents
      end
    ), 0)::bigint
    into v_expected
    from public.fintech_transactions
    where account_id = v_account.id;

    v_delta := v_account.balance_cents - v_expected;
    v_status := case when v_delta = 0 then 'balanced' else 'mismatch' end;

    insert into public.fintech_reconciliation_runs (
      tenant_id,
      profile_id,
      account_id,
      recorded_balance_cents,
      expected_balance_cents,
      delta_cents,
      status
    ) values (
      v_tenant_id,
      v_profile_id,
      v_account.id,
      v_account.balance_cents,
      v_expected,
      v_delta,
      v_status
    );

    if v_status = 'balanced' then
      v_balanced := v_balanced + 1;
    else
      v_mismatched := v_mismatched + 1;
    end if;

    v_results := v_results || jsonb_build_array(jsonb_build_object(
      'account_id', v_account.id,
      'label', v_account.label,
      'recorded_balance_cents', v_account.balance_cents,
      'expected_balance_cents', v_expected,
      'delta_cents', v_delta,
      'status', v_status
    ));
  end loop;

  insert into public.fintech_audit_events (
    tenant_id,
    actor_type,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    v_tenant_id,
    'system',
    'reconciliation.completed',
    'profile',
    v_profile_id::text,
    jsonb_build_object('balanced_accounts', v_balanced, 'mismatched_accounts', v_mismatched)
  );

  return jsonb_build_object(
    'tenant_key', p_tenant_key,
    'user_external_id', p_user_external_id,
    'balanced_accounts', v_balanced,
    'mismatched_accounts', v_mismatched,
    'status', case when v_mismatched = 0 then 'balanced' else 'attention' end,
    'accounts', v_results,
    'message', 'Simulation ledger reconciliation completed. No real money moved.'
  );
end;
$$;

revoke all on function public.reconcile_fintech_profile(text, text) from public, anon, authenticated;
grant execute on function public.reconcile_fintech_profile(text, text) to service_role;
