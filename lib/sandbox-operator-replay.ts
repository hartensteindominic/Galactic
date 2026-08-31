import { Pool } from 'pg';
import { BankingError } from './banking';
import { providerSandboxDatabaseStatus } from './banking-sandbox-database';

const REQUEST_RETENTION_MS = 24 * 60 * 60_000;

export async function consumeSandboxOperatorRequest(input: {
  requestId: string;
  operatorId: string;
  requestPath: string;
  requestHashSha256: string;
  signatureTimestampMs: number;
}) {
  const status = providerSandboxDatabaseStatus();
  if (!status.enabled) {
    throw new BankingError(503, 'SANDBOX_DATABASE_DISABLED', 'Provider-sandbox durable storage is required for operator replay protection.');
  }

  const receivedAt = new Date();
  const expiresAt = new Date(receivedAt.getTime() + REQUEST_RETENTION_MS);
  const pool = new Pool({
    connectionString: (process.env.BANKING_SANDBOX_DATABASE_URL || '').trim(),
    max: 1,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 5_000,
    application_name: 'galactic-trust-sandbox-operator-replay',
    ssl: status.sslEnabled ? { rejectUnauthorized: true } : false
  });

  try {
    const result = await pool.query(
      `INSERT INTO banking_operator_requests (
         request_id, environment, operator_id, request_path, request_hash_sha256,
         signature_timestamp_ms, received_at, expires_at
       ) VALUES ($1,'provider_sandbox',$2,$3,$4,$5,$6,$7)
       ON CONFLICT (request_id) DO NOTHING
       RETURNING request_id`,
      [
        input.requestId,
        input.operatorId,
        input.requestPath,
        input.requestHashSha256,
        input.signatureTimestampMs,
        receivedAt.toISOString(),
        expiresAt.toISOString()
      ]
    );

    if (!result.rowCount) {
      throw new BankingError(409, 'SANDBOX_OPERATOR_REQUEST_REPLAYED', 'Provider-sandbox operator request ID has already been used.');
    }

    return {
      consumed: true,
      requestId: input.requestId,
      retainedUntil: expiresAt.toISOString()
    };
  } finally {
    await pool.end();
  }
}
