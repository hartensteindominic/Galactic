import { Pool } from 'pg';
import { BankingError } from './banking';
import { providerSandboxDatabaseStatus } from './banking-sandbox-database';
import { getGatewayBankingSandboxAdapter } from './gateway-banking-sandbox-adapter';
import { reconcileProviderSandboxAccount } from './provider-sandbox-operations';

const ACCOUNT_RECONCILIATION_SWEEP_LIMIT = 100;

export type AccountReconciliationSweepItem = {
  accountResourceId: string;
  status: 'matched' | 'discrepancy' | 'failed';
  reconciliationId: string | null;
  discrepancyCents: number | null;
  errorCode: string | null;
};

async function listMappedSandboxAccounts(provider: string) {
  const status = providerSandboxDatabaseStatus();
  if (!status.enabled) {
    throw new BankingError(503, 'SANDBOX_DATABASE_DISABLED', 'Provider-sandbox durable storage is not enabled.');
  }

  const pool = new Pool({
    connectionString: (process.env.BANKING_SANDBOX_DATABASE_URL || '').trim(),
    max: 1,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 5_000,
    application_name: 'galactic-trust-sandbox-account-reconciliation-sweep',
    ssl: status.sslEnabled ? { rejectUnauthorized: true } : false
  });

  try {
    const result = await pool.query(
      `SELECT galactic_resource_id
         FROM banking_provider_resource_links
        WHERE provider = $1
          AND environment = 'provider_sandbox'
          AND galactic_resource_type = 'account'
        ORDER BY created_at, galactic_resource_id
        LIMIT 100`,
      [provider]
    );
    return result.rows.map((row) => String(row.galactic_resource_id));
  } finally {
    await pool.end();
  }
}

function failureCode(error: unknown) {
  return error instanceof BankingError ? error.code : 'ACCOUNT_RECONCILIATION_FAILED';
}

export async function runProviderSandboxAccountReconciliationSweep(operatorId: string) {
  const adapter = getGatewayBankingSandboxAdapter();
  const accountResourceIds = await listMappedSandboxAccounts(adapter.providerName);
  const items: AccountReconciliationSweepItem[] = [];

  // Deliberately sequential. A provider sandbox should not receive an unbounded
  // burst of balance requests from a diligence/reconciliation action.
  for (const accountResourceId of accountResourceIds) {
    try {
      const result = await reconcileProviderSandboxAccount({ operatorId, accountResourceId });
      items.push({
        accountResourceId,
        status: result.matched ? 'matched' : 'discrepancy',
        reconciliationId: result.reconciliationId,
        discrepancyCents: result.discrepancyCents,
        errorCode: null
      });
    } catch (error) {
      items.push({
        accountResourceId,
        status: 'failed',
        reconciliationId: null,
        discrepancyCents: null,
        errorCode: failureCode(error)
      });
    }
  }

  return {
    environment: 'provider_sandbox' as const,
    provider: adapter.providerName,
    sweepLimit: ACCOUNT_RECONCILIATION_SWEEP_LIMIT,
    accountCount: items.length,
    matchedCount: items.filter((item) => item.status === 'matched').length,
    discrepancyCount: items.filter((item) => item.status === 'discrepancy').length,
    failedCount: items.filter((item) => item.status === 'failed').length,
    truncated: accountResourceIds.length >= ACCOUNT_RECONCILIATION_SWEEP_LIMIT,
    items
  };
}
