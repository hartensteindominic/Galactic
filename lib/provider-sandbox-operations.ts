import { Pool } from 'pg';
import { BankingError } from './banking';
import { providerSandboxDatabaseStatus } from './banking-sandbox-database';
import type { BankingOperationsSnapshot } from './banking-persistence-contract';
import { PROVIDER_EVENT_LEASE_MS, PROVIDER_EVENT_MAX_ATTEMPTS } from './provider-sandbox-event-processor';

function number(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new BankingError(500, 'OPERATIONS_METRIC_INVALID', 'Provider sandbox operations metric is invalid.');
  }
  return parsed;
}

export async function getProviderSandboxOperationsSnapshot(): Promise<BankingOperationsSnapshot> {
  const status = providerSandboxDatabaseStatus();
  if (!status.enabled) {
    throw new BankingError(503, 'SANDBOX_DATABASE_DISABLED', 'Provider-sandbox durable storage is not enabled.');
  }

  const connectionString = (process.env.BANKING_SANDBOX_DATABASE_URL || '').trim();
  const pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 5_000,
    application_name: 'galactic-trust-sandbox-operations-readonly',
    ssl: status.sslEnabled ? { rejectUnauthorized: true } : false
  });

  const asOf = new Date();
  const staleBefore = new Date(asOf.getTime() - PROVIDER_EVENT_LEASE_MS).toISOString();

  try {
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
  } finally {
    await pool.end();
  }
}
