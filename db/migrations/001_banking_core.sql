-- Galactic Trust durable banking core
-- Provider sandbox first; production use requires separate program approval.
-- PostgreSQL 14+ compatible.

BEGIN;

CREATE TABLE IF NOT EXISTS banking_provider_events (
  event_id text PRIMARY KEY,
  provider text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('provider_sandbox', 'production')),
  raw_provider_event_id text NOT NULL,
  canonical_event jsonb NOT NULL,
  received_at timestamptz NOT NULL,
  processed_at timestamptz,
  status text NOT NULL CHECK (status IN ('received', 'processed', 'failed')),
  failure_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, environment, raw_provider_event_id)
);

CREATE INDEX IF NOT EXISTS banking_provider_events_status_idx
  ON banking_provider_events (environment, status, received_at);

CREATE TABLE IF NOT EXISTS banking_ledger_journals (
  journal_id text PRIMARY KEY,
  event_id text NOT NULL UNIQUE,
  environment text NOT NULL CHECK (environment IN ('provider_sandbox', 'production')),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  occurred_at timestamptz NOT NULL,
  inserted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banking_ledger_lines (
  line_id text PRIMARY KEY,
  journal_id text NOT NULL REFERENCES banking_ledger_journals(journal_id) ON DELETE RESTRICT,
  event_id text NOT NULL,
  account text NOT NULL CHECK (account IN (
    'partner_settlement_cash',
    'customer_deposit_liability',
    'ach_in_transit_asset',
    'ach_return_receivable'
  )),
  debit_cents bigint NOT NULL DEFAULT 0 CHECK (debit_cents >= 0),
  credit_cents bigint NOT NULL DEFAULT 0 CHECK (credit_cents >= 0),
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (debit_cents > 0 AND credit_cents = 0)
    OR (credit_cents > 0 AND debit_cents = 0)
  )
);

CREATE INDEX IF NOT EXISTS banking_ledger_lines_journal_idx
  ON banking_ledger_lines (journal_id);
CREATE INDEX IF NOT EXISTS banking_ledger_lines_event_idx
  ON banking_ledger_lines (event_id);

CREATE TABLE IF NOT EXISTS banking_provider_resource_links (
  id bigserial PRIMARY KEY,
  galactic_resource_type text NOT NULL CHECK (galactic_resource_type IN ('customer', 'account', 'transfer', 'card')),
  galactic_resource_id text NOT NULL,
  provider text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('provider_sandbox', 'production')),
  provider_resource_id text NOT NULL,
  created_at timestamptz NOT NULL,
  UNIQUE (provider, environment, galactic_resource_type, galactic_resource_id),
  UNIQUE (provider, environment, provider_resource_id)
);

CREATE TABLE IF NOT EXISTS banking_reconciliations (
  id text PRIMARY KEY,
  provider text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('provider_sandbox', 'production')),
  scope text NOT NULL CHECK (scope IN ('transfer_event', 'account_balance', 'daily_program')),
  resource_id text NOT NULL,
  snapshot jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('matched', 'discrepancy')),
  created_at timestamptz NOT NULL,
  resolved_at timestamptz,
  resolution_note text
);

CREATE INDEX IF NOT EXISTS banking_reconciliations_open_discrepancy_idx
  ON banking_reconciliations (environment, created_at)
  WHERE status = 'discrepancy' AND resolved_at IS NULL;

CREATE TABLE IF NOT EXISTS banking_audit_events (
  id text PRIMARY KEY,
  actor_type text NOT NULL CHECK (actor_type IN ('system', 'customer', 'admin', 'provider')),
  actor_id text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  environment text NOT NULL CHECK (environment IN ('provider_sandbox', 'production')),
  occurred_at timestamptz NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS banking_audit_events_resource_idx
  ON banking_audit_events (environment, resource_type, resource_id, occurred_at);

-- Journals and audit records are append-only. Application/database roles used by
-- Galactic Trust should not receive DELETE permissions on these tables.
-- Corrections must be represented by new compensating journals/audit events.

COMMIT;
