-- Idempotency hardening for the SIMULATED fintech ledger.
-- Prevents a retried prototype transfer request from double-debiting an account.

create unique index if not exists fintech_transactions_provider_reference_unique
  on public.fintech_transactions(tenant_id, provider, provider_reference)
  where provider_reference is not null;

drop function if exists public.simulate_fintech_transfer(text, text, uuid, text, bigint, text);

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
      'message', 'Duplicate simulated transfer request safely replayed. No second debit occurred.'
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
    jsonb_build_object('amount_cents', p_amount_cents, 'idempotency_key_digest', encode(digest(trim(p_idempotency_key), 'sha256'), 'hex'))
  );

  return jsonb_build_object(
    'id', v_transaction_id,
    'status', 'simulated',
    'amount_cents', p_amount_cents,
    'recipient', trim(p_recipient),
    'idempotent_replay', false,
    'message', 'Simulated transfer recorded once. No real money moved.'
  );
end;
$$;

revoke all on function public.simulate_fintech_transfer(text, text, uuid, text, bigint, text, text) from public, anon, authenticated;
grant execute on function public.simulate_fintech_transfer(text, text, uuid, text, bigint, text, text) to service_role;
