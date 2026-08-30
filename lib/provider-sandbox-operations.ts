import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { BankingError } from './banking';
import { getProviderSandboxBankingStore, providerSandboxDatabaseStatus } from './banking-sandbox-database';
import type { BankingOperationsSnapshot, ReconciliationRecord } from './banking-persistence-contract';
import { getGatewayBankingSandboxAdapter } from './gateway-banking-sandbox-adapter';
import { PROVIDER_EVENT_LEASE_MS, PROVIDER_EVENT_MAX_ATTEMPTS } from './provider-sandbox-event-processor';

export type OpenReconciliationSummary = {
  id: string;
  provider: string;
  resourceId: string;
  createdAt: string;
  providerAmountCents: number;
  internalAmountCents: number;
  discrepancyCents: number;
};

function number(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new BankingError(500, 'OPERATIONS_METRIC_INVALID', 'Provider sandbox operations metric is invalid.');
  }
  return parsed;
}

function signedNumber(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new BankingError(500, 'OPERATIONS_METRIC_INVALID', 'Provider sandbox reconciliation metric is invalid.');
  }
  return parsed;
}

function jsonObject<T>(value: unknown): T {
  if (typeof value === 'string') return JSON.parse(value) as T;
  return value as T;
}

function requireDatabaseStatus() {
  const status = providerSandboxDatabaseStatus();
  if (!status.enabled) {
    throw new BankingError(503, 'SANDBOX_DATABASE_DISABLED', 'Provider-sandbox durable storage is not enabled.');
  }
  return status;
}

async function withReadOnlyPool<T>(work: (pool: Pool) => Promise<T>) {
  const status = requireDatabaseStatus();
  const pool = new Pool({
    connectionString: (process.env.BANKING_SANDBOX_DATABASE_URL || '').trim(),
    max: 1,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 5_000,
    application_name: 'galactic-trust-sandbox-operations-readonly',
    ssl: status.sslEnabled ? { rejectUnauthorized: true } : false
  });

  try {
    return await work(pool);
  } finally {
    await pool.end();
  }
}

async function getInternalAccountLedgerBalance(providerAccountId: string) {
  return withReadOnlyPool(async (pool) => {
    const result = await pool.query(
      `SELECT
         COALESCE(SUM(lines.credit_cents - lines.debit_cents), 0) AS internal_balance_cents,
         COALESCE(SUM(lines.debit_cents), 0) AS liability_debits_cents,
         COALESCE(SUM(lines.credit_cents), 0) AS liability_credits_cents,
         COUNT(DISTINCT lines.event_id) AS event_count
       FROM banking_ledger_lines AS lines
       JOIN banking_ledger_journals AS journals
         ON journals.journal_id = lines.journal_id
       JOIN banking_provider_events AS events
         ON events.event_id = journals.event_id
      WHERE journals.environment = 'provider_sandbox'
        AND events.environment = 'provider_sandbox'
        AND events.status = 'processed'
        AND events.canonical_event ->> 'accountId' = $1
        AND lines.account = 'customer_deposit_liability'`,
      [providerAccountId]
    );
    const row = result.rows[0] || {};
    return {
      internalBalanceCents: signedNumber(row.internal_balance_cents ?? 0),
      liabilityDebitsCents: number(row.liability_debits_cents ?? 0),
      liabilityCreditsCents: number(row.liability_credits_cents ?? 0),
      eventCount: number(row.event_count ?? 0)
    };
  });
}

export async function getProviderSandboxOperationsSnapshot(): Promise<BankingOperationsSnapshot> {
  return withReadOnlyPool(async (pool) => {
    const asOf = new Date();
    const staleBefore = new Date(asOf.getTime() - PROVIDER_EVENT_LEASE_MS).toISOString();
    const [eventsResult, reconciliationResult] = await Promise.all([
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'received') AS received,
           COUNT(*) FILTER (WHERE status = 'processing') AS processing,
           COUNT(*) FILTER (WHERE status = 'processing' AND processing_started_at <= $2::timestamptz) AS stale_processing,
           COUNT(*) FILTER (WHERE status = 'failed' AND attempt_count < $3) AS retryable_failed,
           COUNT(*) FILTER (WHERE status = 'failed' AND attempt_count >= $3) AS terminal_failed,
           COUNT(*) FILTER (WHERE status = 'processed') AS processed
         FROM banking_provider_events
         WHERE environment = $1`,
        ['provider_sandbox', staleBefore, PROVIDER_EVENT_MAX_ATTEMPTS]
      ),
      pool.query(
        `SELECT COUNT(*) AS open_discrepancies
           FROM banking_reconciliations
          WHERE environment = $1
            AND status = 'discrepancy'
            AND resolved_at IS NULL`,
        ['provider_sandbox']
      )
    ]);

    const eventRow = eventsResult.rows[0] || {};
    const reconciliationRow = reconciliationResult.rows[0] || {};

    return {
      environment: 'provider_sandbox',
      asOf: asOf.toISOString(),
      events: {
        received: number(eventRow.received ?? 0),
        processing: number(eventRow.processing ?? 0),
        staleProcessing: number(eventRow.stale_processing ?? 0),
        retryableFailed: number(eventRow.retryable_failed ?? 0),
        terminalFailed: number(eventRow.terminal_failed ?? 0),
        processed: number(eventRow.processed ?? 0)
      },
      reconciliations: {
        openDiscrepancies: number(reconciliationRow.open_discrepancies ?? 0)
      }
    };
  });
}

export async function listOpenProviderSandboxReconciliations(): Promise<OpenReconciliationSummary[]> {
  return withReadOnlyPool(async (pool) => {
    const result = await pool.query(
      `SELECT id, provider, resource_id, snapshot, created_at
         FROM banking_reconciliations
        WHERE environment = $1
          AND status = 'discrepancy'
          AND resolved_at IS NULL
        ORDER BY created_at
        LIMIT 25`,
      ['provider_sandbox']
    );

    return result.rows.map((row) => {
      const snapshot = jsonObject<ReconciliationRecord['snapshot']>(row.snapshot);
      return {
        id: String(row.id),
        provider: String(row.provider),
        resourceId: String(row.resource_id),
        createdAt: new Date(row.created_at).toISOString(),
        providerAmountCents: signedNumber(snapshot.providerAmountCents),
        internalAmountCents: signedNumber(snapshot.internalAmountCents),
        discrepancyCents: signedNumber(snapshot.discrepancyCents)
      };
    });
  });
}

export async function reconcileProviderSandboxAccount(input: {
  operatorId: string;
  accountResourceId: string;
}) {
  const accountResourceId = input.accountResourceId.trim();
  if (!accountResourceId || accountResourceId.length > 240) {
    throw new BankingError(400, 'ACCOUNT_RESOURCE_ID_INVALID', 'A valid Galactic sandbox account resource ID is required.');
  }

  requireDatabaseStatus();
  const store = getProviderSandboxBankingStore();
  const adapter = getGatewayBankingSandboxAdapter();
  const link = await store.getProviderResourceLink({
    provider: adapter.providerName,
    environment: 'provider_sandbox',
    galacticResourceType: 'account',
    galacticResourceId: accountResourceId
  });
  if (!link) {
    throw new BankingError(404, 'ACCOUNT_RESOURCE_MAPPING_NOT_FOUND', 'Provider mapping for this Galactic sandbox account was not found.');
  }

  const [providerBalance, internal] = await Promise.all([
    adapter.getAccountBalance(link.providerResourceId),
    getInternalAccountLedgerBalance(link.providerResourceId)
  ]);

  if (providerBalance.accountId !== link.providerResourceId) {
    throw new BankingError(409, 'PROVIDER_BALANCE_ACCOUNT_MISMATCH', 'Provider balance response does not match the mapped sandbox account.');
  }

  const discrepancyCents = providerBalance.currentBalanceCents - internal.internalBalanceCents;
  const snapshot: ReconciliationRecord['snapshot'] = {
    providerAmountCents: providerBalance.currentBalanceCents,
    internalAmountCents: internal.internalBalanceCents,
    ledgerDebitsCents: internal.liabilityDebitsCents,
    ledgerCreditsCents: internal.liabilityCreditsCents,
    eventCount: internal.eventCount,
    matched: discrepancyCents === 0,
    discrepancyCents
  };
  const reconciliation: ReconciliationRecord = {
    id: `account-reconciliation-${randomUUID()}`,
    provider: adapter.providerName,
    environment: 'provider_sandbox',
    scope: 'account_balance',
    resourceId: accountResourceId,
    snapshot,
    status: snapshot.matched ? 'matched' : 'discrepancy',
    createdAt: new Date().toISOString(),
    resolvedAt: null
  };

  await store.transaction(async (tx) => {
    await tx.saveReconciliation(reconciliation);
    await tx.appendAuditEvent({
      id: randomUUID(),
      actorType: 'admin',
      actorId: input.operatorId,
      action: 'sandbox_account_balance_reconciled',
      resourceType: 'account',
      resourceId: accountResourceId,
      environment: 'provider_sandbox',
      occurredAt: reconciliation.createdAt,
      metadata: {
        reconciliationId: reconciliation.id,
        matched: snapshot.matched,
        discrepancyCents,
        providerAsOf: providerBalance.asOf,
        processedEventCount: internal.eventCount
      }
    });
  });

  return {
    reconciliationId: reconciliation.id,
    accountResourceId,
    provider: adapter.providerName,
    providerBalanceCents: providerBalance.currentBalanceCents,
    providerAvailableBalanceCents: providerBalance.availableBalanceCents,
    internalLedgerBalanceCents: internal.internalBalanceCents,
    discrepancyCents,
    matched: snapshot.matched,
    processedEventCount: internal.eventCount,
    audited: true
  };
}

export async function resolveProviderSandboxReconciliation(input: {
  operatorId: string;
  id: string;
  resolutionNote: string;
}) {
  const id = input.id.trim();
  const resolutionNote = input.resolutionNote.trim();
  if (!id || id.length > 200) {
    throw new BankingError(400, 'RECONCILIATION_ID_INVALID', 'A valid reconciliation ID is required.');
  }
  if (resolutionNote.length < 8 || resolutionNote.length > 500) {
    throw new BankingError(400, 'RECONCILIATION_NOTE_INVALID', 'Resolution note must contain 8-500 characters.');
  }

  requireDatabaseStatus();
  const store = getProviderSandboxBankingStore();
  const resolvedAt = new Date().toISOString();

  await store.transaction(async (tx) => {
    await tx.resolveReconciliation({ id, resolvedAt, resolutionNote });
    await tx.appendAuditEvent({
      id: randomUUID(),
      actorType: 'admin',
      actorId: input.operatorId,
      action: 'reconciliation_resolved',
      resourceType: 'reconciliation',
      resourceId: id,
      environment: 'provider_sandbox',
      occurredAt: resolvedAt,
      metadata: {
        resolutionNoteLength: resolutionNote.length
      }
    });
  });

  return { id, resolvedAt, audited: true };
}

export async function requeueTerminalProviderSandboxEvent(input: {
  operatorId: string;
  eventId: string;
  reason: string;
}) {
  const eventId = input.eventId.trim();
  const reason = input.reason.trim();
  if (!eventId || eventId.length > 240) {
    throw new BankingError(400, 'EVENT_ID_INVALID', 'A valid terminal provider event ID is required.');
  }
  if (reason.length < 12 || reason.length > 500) {
    throw new BankingError(400, 'EVENT_REQUEUE_REASON_INVALID', 'Terminal-event requeue reason must contain 12-500 characters.');
  }

  requireDatabaseStatus();
  const store = getProviderSandboxBankingStore();
  const requeuedAt = new Date().toISOString();

  return store.transaction(async (tx) => {
    const existing = await tx.getEvent(eventId);
    if (!existing || existing.environment !== 'provider_sandbox') {
      throw new BankingError(404, 'TERMINAL_EVENT_NOT_FOUND', 'Terminal provider-sandbox event was not found.');
    }
    if (existing.status !== 'failed' || existing.attemptCount < PROVIDER_EVENT_MAX_ATTEMPTS) {
      throw new BankingError(409, 'EVENT_NOT_TERMINAL', 'Only a terminal failed provider-sandbox event may be manually requeued.');
    }

    const requeued = await tx.requeueTerminalEvent({
      eventId,
      environment: 'provider_sandbox',
      maxAttempts: PROVIDER_EVENT_MAX_ATTEMPTS
    });
    if (!requeued) {
      throw new BankingError(409, 'EVENT_REQUEUE_CONFLICT', 'Terminal event changed state before it could be requeued.');
    }

    await tx.appendAuditEvent({
      id: randomUUID(),
      actorType: 'admin',
      actorId: input.operatorId,
      action: 'terminal_provider_event_requeued',
      resourceType: 'provider_event',
      resourceId: eventId,
      environment: 'provider_sandbox',
      occurredAt: requeuedAt,
      metadata: {
        previousAttemptCount: existing.attemptCount,
        previousFailureCode: existing.failureCode ?? null,
        reason
      }
    });

    return {
      eventId,
      previousAttemptCount: existing.attemptCount,
      previousFailureCode: existing.failureCode ?? null,
      status: requeued.status,
      attemptCount: requeued.attemptCount,
      requeuedAt,
      audited: true
    };
  });
}
