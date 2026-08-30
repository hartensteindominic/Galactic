-- Double-entry accounting layer for the SIMULATED white-label fintech ledger.
-- This does not enable real money movement. It adds immutable accounting evidence so
-- future simulated money events are represented by balanced journal entries.

create table if not exists public.fintech_gl_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  profile_id uuid references public.fintech_profiles(id) on delete cascade,
  financial_account_id uuid references public.fintech_accounts(id) on delete cascade,
  code text not null,
  label text not null,
  account_class text not null check (account_class in ('customer_asset', 'clearing', 'revenue', 'expense', 'equity')),
  simulated boolean not null default true,
  created_at timestamptz not null default now(),
  unique (tenant_id, code),
  unique (financial_account_id)
);

create table if not exists public.fintech_gl_journals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.fintech_tenants(id) on delete cascade,
  profile_id uuid references public.fintech_profiles(id) on delete set null,
  provider text not null,
  provider_reference text not null,
  event_type text not null,
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  posted_at timestamptz not null default now(),
  unique (tenant_id, provider, provider_reference)
);

create table if not exists public.fintech_gl_lines (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null references public.fintech_gl_journals(id) on delete restrict,
  gl_account_id uuid not null references public.fintech_gl_accounts(id) on delete restrict,
  amount_cents bigint not null check (amount_cents <> 0),
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists fintech_gl_lines_journal_idx
  on public.fintech_gl_lines(journal_id);
create index if not exists fintech_gl_lines_account_idx
  on public.fintech_gl_lines(gl_account_id, created_at desc);
create index if not exists fintech_gl_journals_tenant_time_idx
  on public.fintech_gl_journals(tenant_id, posted_at desc);

alter table public.fintech_gl_accounts enable row level security;
alter table public.fintech_gl_journals enable row level security;
alter table public.fintech_gl_lines enable row level security;

revoke all on table public.fintech_gl_accounts from anon, authenticated;
revoke all on table public.fintech_gl_journals from anon, authenticated;
revoke all on table public.fintech_gl_lines from anon, authenticated;

grant select, insert on table public.fintech_gl_accounts to service_role;
grant select, insert on table public.fintech_gl_journals to service_role;
grant select, insert on table public.fintech_gl_lines to service_role;

-- Journals and journal lines are append-only. Corrections should be new reversing entries,
-- never destructive edits to accounting evidence.
create or replace function public.prevent_fintech_gl_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Double-entry ledger records are append-only. Post a reversing journal instead.';
end;
$$;

drop trigger if exists fintech_gl_journals_append_only on public.fintech_gl_journals;
create trigger fintech_gl_journals_append_only
before update or delete on public.fintech_gl_journals
for each row execute function public.prevent_fintech_gl_mutation();

drop trigger if exists fintech_gl_lines_append_only on public.fintech_gl_lines;
create trigger fintech_gl_lines_append_only
before update or delete on public.fintech_gl_lines
for each row execute function public.prevent_fintech_gl_mutation();

-- A deferred constraint trigger checks the complete journal at transaction commit.
create or replace function public.assert_fintech_journal_balanced()
returns trigger
language plpgsql
as $$
declare
  v_journal_id uuid;
  v_sum bigint;
begin
  v_journal_id := coalesce(new.journal_id, old.journal_id);

  select coalesce(sum(amount_cents), 0)::bigint
  into v_sum
  from public.fintech_gl_lines
  where journal_id = v_journal_id;

  if v_sum <> 0 then
    raise exception 'Double-entry journal is unbalanced by % cents.', v_sum;
  end if;

  return null;
end;
$$;

drop trigger if exists fintech_gl_lines_balanced on public.fintech_gl_lines;
create constraint trigger fintech_gl_lines_balanced
after insert on public.fintech_gl_lines
deferrable initially deferred
for each row execute function public.assert_fintech_journal_balanced();

-- Seed one clearing account per tenant.
insert into public.fintech_gl_accounts (tenant_id, code, label, account_class, simulated)
select id, 'external-clearing', 'External Simulation Clearing', 'clearing', true
from public.fintech_tenants
on conflict (tenant_id, code) do nothing;

-- Create one GL account for each simulated customer financial account.
insert into public.fintech_gl_accounts (
  tenant_id,
  profile_id,
  financial_account_id,
  code,
  label,
  account_class,
  simulated
)
select
  a.tenant_id,
  a.profile_id,
  a.id,
  'customer-' || a.id::text,
  a.label || ' GL',
  'customer_asset',
  true
from public.fintech_accounts a
where a.simulated = true
on conflict (financial_account_id) do nothing;

-- Anchor the new accounting ledger to each account's CURRENT simulated balance.
-- Historical prototype transactions before this migration are not replayed into the GL;
-- they are represented by this explicit migration-opening journal.
do $$
declare
  v_account record;
  v_customer_gl uuid;
  v_clearing_gl uuid;
  v_journal uuid;
begin
  for v_account in
    select id, tenant_id, profile_id, label, balance_cents
    from public.fintech_accounts
    where simulated = true and balance_cents <> 0
  loop
    select id into v_customer_gl
    from public.fintech_gl_accounts
    where financial_account_id = v_account.id;

    select id into v_clearing_gl
    from public.fintech_gl_accounts
    where tenant_id = v_account.tenant_id and code = 'external-clearing';

    insert into public.fintech_gl_journals (
      tenant_id,
      profile_id,
      provider,
      provider_reference,
      event_type,
      description,
      metadata
    ) values (
      v_account.tenant_id,
      v_account.profile_id,
      'ledger_migration',
      'opening:' || v_account.id::text,
      'opening_balance',
      'Opening double-entry balance for ' || v_account.label,
      jsonb_build_object('simulation_only', true, 'historical_transactions_backfilled', false)
    )
    on conflict (tenant_id, provider, provider_reference) do nothing
    returning id into v_journal;

    if v_journal is not null then
      insert into public.fintech_gl_lines (journal_id, gl_account_id, amount_cents, memo)
      values
        (v_journal, v_customer_gl, v_account.balance_cents, 'Customer simulated balance'),
        (v_journal, v_clearing_gl, -v_account.balance_cents, 'Opening clearing offset');
    end if;
  end loop;
end;
$$;

-- Replace the simulated transfer RPC so balance, transaction log, audit event, and
-- double-entry journal are all created atomically in the same database transaction.
drop function if exists public.simulate_fintech_transfer(text, text, uuid, text, bigint, text, text);

create or replace function public.simulate_fintech_transfer(
  p_tenant_key text,
  p_user_external_id text,
  p_from_account_id uuid,
  p_recipient text,
  p_amount_cents bigint,
  p_memo text,
  p_idempotency_key text
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
  v_existing_id uuid;
  v_existing_amount bigint;
  v_existing_recipient text;
  v_customer_gl uuid;
  v_clearing_gl uuid;
  v_journal_id uuid;
begin
  if p_amount_cents < 1 or p_amount_cents > 1000000 then
    raise exception 'Prototype transfers must be between $0.01 and $10,000.00.';
  end if;

  if length(trim(coalesce(p_recipient, ''))) < 1 then
    raise exception 'Recipient is required.';
  end if;

  if length(trim(coalesce(p_idempotency_key, ''))) < 8
     or length(trim(coalesce(p_idempotency_key, ''))) > 200 then
    raise exception 'A valid idempotency key is required.';
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

  select id, amount_cents, name
  into v_existing_id, v_existing_amount, v_existing_recipient
  from public.fintech_transactions
  where tenant_id = v_tenant_id
    and profile_id = v_profile_id
    and provider = 'prototype'
    and provider_reference = trim(p_idempotency_key)
  limit 1;

  if v_existing_id is not null then
    if v_existing_amount <> p_amount_cents or v_existing_recipient <> trim(p_recipient) then
      raise exception 'Idempotency key was already used with different transfer details.';
    end if;

    return jsonb_build_object(
      'id', v_existing_id,
      'status', 'simulated',
      'amount_cents', v_existing_amount,
      'recipient', v_existing_recipient,
      'idempotent_replay', true,
      'message', 'Duplicate simulated transfer request safely replayed. No second debit or journal occurred.'
    );
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

  select id into v_customer_gl
  from public.fintech_gl_accounts
  where financial_account_id = p_from_account_id and simulated = true;

  select id into v_clearing_gl
  from public.fintech_gl_accounts
  where tenant_id = v_tenant_id and code = 'external-clearing' and simulated = true;

  if v_customer_gl is null or v_clearing_gl is null then
    raise exception 'Double-entry ledger accounts are not configured for this simulated transfer.';
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
    provider_reference,
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
    trim(p_idempotency_key),
    jsonb_build_object('memo', nullif(trim(coalesce(p_memo, '')), ''))
  ) returning id into v_transaction_id;

  insert into public.fintech_gl_journals (
    tenant_id,
    profile_id,
    provider,
    provider_reference,
    event_type,
    description,
    metadata
  ) values (
    v_tenant_id,
    v_profile_id,
    'prototype',
    trim(p_idempotency_key),
    'simulated_transfer',
    'Simulated transfer to ' || trim(p_recipient),
    jsonb_build_object('transaction_id', v_transaction_id, 'simulation_only', true)
  ) returning id into v_journal_id;

  insert into public.fintech_gl_lines (journal_id, gl_account_id, amount_cents, memo)
  values
    (v_journal_id, v_customer_gl, -p_amount_cents, 'Decrease simulated customer balance'),
    (v_journal_id, v_clearing_gl, p_amount_cents, 'Increase simulated external clearing');

  insert into public.fintech_audit_events (
    tenant_id,
    actor_type,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    v_tenant_id,
    'demo_user',
    'simulated_transfer.created',
    'transaction',
    v_transaction_id::text,
    jsonb_build_object(
      'amount_cents', p_amount_cents,
      'journal_id', v_journal_id,
      'idempotency_key_digest', encode(digest(trim(p_idempotency_key), 'sha256'), 'hex')
    )
  );

  return jsonb_build_object(
    'id', v_transaction_id,
    'journal_id', v_journal_id,
    'status', 'simulated',
    'amount_cents', p_amount_cents,
    'recipient', trim(p_recipient),
    'idempotent_replay', false,
    'message', 'Simulated transfer recorded once with a balanced double-entry journal. No real money moved.'
  );
end;
$$;

revoke all on function public.simulate_fintech_transfer(text, text, uuid, text, bigint, text, text) from public, anon, authenticated;
grant execute on function public.simulate_fintech_transfer(text, text, uuid, text, bigint, text, text) to service_role;

-- Compare each simulated customer account balance to its GL balance.
create or replace function public.reconcile_fintech_gl_profile(
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
  v_gl_balance bigint;
  v_delta bigint;
  v_mismatched integer := 0;
  v_results jsonb := '[]'::jsonb;
begin
  select id into v_tenant_id from public.fintech_tenants where tenant_key = p_tenant_key;
  if v_tenant_id is null then raise exception 'Unknown tenant.'; end if;

  select id into v_profile_id
  from public.fintech_profiles
  where tenant_id = v_tenant_id and external_user_id = p_user_external_id;
  if v_profile_id is null then raise exception 'Unknown prototype user.'; end if;

  for v_account in
    select a.id, a.label, a.balance_cents, a.simulated, g.id as gl_account_id
    from public.fintech_accounts a
    left join public.fintech_gl_accounts g on g.financial_account_id = a.id
    where a.tenant_id = v_tenant_id and a.profile_id = v_profile_id
    order by a.created_at asc
  loop
    if not v_account.simulated then
      raise exception 'Prototype GL reconciliation cannot inspect non-simulated accounts.';
    end if;
    if v_account.gl_account_id is null then
      raise exception 'Missing double-entry account for simulated financial account.';
    end if;

    select coalesce(sum(l.amount_cents), 0)::bigint
    into v_gl_balance
    from public.fintech_gl_lines l
    where l.gl_account_id = v_account.gl_account_id;

    v_delta := v_account.balance_cents - v_gl_balance;
    if v_delta <> 0 then v_mismatched := v_mismatched + 1; end if;

    v_results := v_results || jsonb_build_array(jsonb_build_object(
      'account_id', v_account.id,
      'label', v_account.label,
      'recorded_balance_cents', v_account.balance_cents,
      'gl_balance_cents', v_gl_balance,
      'delta_cents', v_delta,
      'status', case when v_delta = 0 then 'balanced' else 'mismatch' end
    ));
  end loop;

  return jsonb_build_object(
    'tenant_key', p_tenant_key,
    'user_external_id', p_user_external_id,
    'mismatched_accounts', v_mismatched,
    'status', case when v_mismatched = 0 then 'balanced' else 'attention' end,
    'accounts', v_results,
    'message', 'Simulation double-entry reconciliation completed. No real money moved.'
  );
end;
$$;

revoke all on function public.reconcile_fintech_gl_profile(text, text) from public, anon, authenticated;
grant execute on function public.reconcile_fintech_gl_profile(text, text) to service_role;
