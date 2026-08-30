import { Pool, type PoolClient, type QueryResultRow } from 'pg';
import { BankingError, bankingStatus } from './banking';
import {
  PostgresBankingStore,
  type PostgresPoolLike,
  type PostgresQueryResult,
  type PostgresTransactionClient
} from './postgres-banking-store';

type GlobalWithSandboxPool = typeof globalThis & {
  __galacticSandboxBankingPool?: Pool;
};

function poolMax() {
  const parsed = Number(process.env.BANKING_SANDBOX_DATABASE_POOL_MAX || '4');
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 10) return 4;
  return parsed;
}

function connectionString() {
  return (process.env.BANKING_SANDBOX_DATABASE_URL || '').trim();
}

function connectionStringLooksLikePostgres(value: string) {
  return value.startsWith('postgresql://') || value.startsWith('postgres://');
}

export function providerSandboxDatabaseStatus() {
  const url = connectionString();
  const configured = Boolean(url) && connectionStringLooksLikePostgres(url);
  const enabledRequested = process.env.BANKING_SANDBOX_DATABASE_ENABLED === 'true';
  const sslEnabled = process.env.BANKING_SANDBOX_DATABASE_SSL !== 'false';
  const banking = bankingStatus();
  const blockedReasons: string[] = [];

  if (!configured) blockedReasons.push('sandbox_database_not_configured');
  if (!enabledRequested) blockedReasons.push('sandbox_database_not_enabled');
  if (banking.liveWritesEnabled) blockedReasons.push('production_live_writes_enabled');

  const enabled = configured && enabledRequested && !banking.liveWritesEnabled;

  return {
    configured,
    enabledRequested,
    enabled,
    sslEnabled,
    poolMax: poolMax(),
    productionLiveWritesEnabled: banking.liveWritesEnabled,
    blockedReasons,
    connectionStringExposed: false,
    disclosure: enabled
      ? 'Durable provider-sandbox database access is enabled. Production live banking remains disabled.'
      : 'Durable provider-sandbox database access remains fail-closed until a Postgres URL and the dedicated database enable gate are configured.'
  };
}

function adaptQueryResult<T extends Record<string, unknown>>(result: {
  rows: QueryResultRow[];
  rowCount: number | null;
}): PostgresQueryResult<T> {
  return {
    rows: result.rows as T[],
    rowCount: result.rowCount
  };
}

function adaptClient(client: PoolClient): PostgresTransactionClient {
  return {
    async query<T extends Record<string, unknown>>(text: string, values?: readonly unknown[]) {
      const result = await client.query(text, values ? [...values] : undefined);
      return adaptQueryResult<T>(result);
    },
    release() {
      client.release();
    }
  };
}

function adaptPool(pool: Pool): PostgresPoolLike {
  return {
    async query<T extends Record<string, unknown>>(text: string, values?: readonly unknown[]) {
      const result = await pool.query(text, values ? [...values] : undefined);
      return adaptQueryResult<T>(result);
    },
    async connect() {
      return adaptClient(await pool.connect());
    }
  };
}

function getPool() {
  const status = providerSandboxDatabaseStatus();
  if (!status.enabled) {
    throw new BankingError(
      503,
      'SANDBOX_DATABASE_DISABLED',
      'Provider-sandbox durable storage is disabled until its isolated database configuration is explicitly enabled.'
    );
  }

  const globalState = globalThis as GlobalWithSandboxPool;
  if (!globalState.__galacticSandboxBankingPool) {
    globalState.__galacticSandboxBankingPool = new Pool({
      connectionString: connectionString(),
      max: status.poolMax,
      idleTimeoutMillis: 20_000,
      connectionTimeoutMillis: 5_000,
      application_name: 'galactic-trust-provider-sandbox',
      ssl: status.sslEnabled ? { rejectUnauthorized: true } : false
    });

    globalState.__galacticSandboxBankingPool.on('error', (error) => {
      console.error('Provider-sandbox Postgres pool error', {
        name: error.name,
        message: error.message
      });
    });
  }

  return globalState.__galacticSandboxBankingPool;
}

export function getProviderSandboxBankingStore() {
  return new PostgresBankingStore(adaptPool(getPool()));
}
