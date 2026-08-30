import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { Pool } from 'pg';
import { BankingError } from './banking';
import { providerSandboxDatabaseStatus } from './banking-sandbox-database';
import { getProviderSandboxOperationsSnapshot } from './provider-sandbox-operations';

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type ProviderSandboxEvidenceManifest = {
  schemaVersion: 'galactic-provider-sandbox-evidence-v1';
  environment: 'provider_sandbox';
  repository: 'hartensteindominic/Galactic';
  releaseSha: string | null;
  certificationRunId: string;
  provider: string;
  generatedAt: string;
  migrations: Array<{
    name: string;
    checksumSha256: string;
    appliedAt: string;
  }>;
  resources: Array<{
    type: 'customer' | 'account' | 'transfer' | 'card';
    galacticResourceId: string;
    providerResourceSha256: string;
    createdAt: string;
  }>;
  providerEvents: Array<{
    eventSha256: string;
    rawProviderEventSha256: string;
    type: string;
    status: string;
    attemptCount: number;
    receivedAt: string;
    processedAt: string | null;
    failureCode: string | null;
  }>;
  journals: Array<{
    journalId: string;
    eventSha256: string;
    occurredAt: string;
    debitCents: number;
    creditCents: number;
    balanced: boolean;
  }>;
  reconciliations: Array<{
    id: string;
    scope: string;
    status: string;
    providerAmountCents: number;
    internalAmountCents: number;
    discrepancyCents: number;
    createdAt: string;
    resolvedAt: string | null;
  }>;
  auditActionCounts: Array<{
    action: string;
    count: number;
  }>;
  operations: {
    received: number;
    processing: number;
    staleProcessing: number;
    retryableFailed: number;
    terminalFailed: number;
    processed: number;
    openDiscrepancies: number;
  };
  assertions: {
    containsSecrets: false;
    containsRawProviderResourceIds: false;
    containsRawWebhookBodies: false;
    containsCustomerPii: false;
    productionLiveMoneyAuthorized: false;
  };
};

export type ProviderSandboxEvidenceEnvelope = {
  bundleId: string;
  evidenceKeyId: string;
  algorithm: 'HMAC-SHA256';
  verificationScope: 'galactic_internal_hmac';
  manifestSha256: string;
  hmacSha256: string;
  manifest: ProviderSandboxEvidenceManifest;
};

function evidenceConfig() {
  const secret = process.env.BANKING_SANDBOX_EVIDENCE_SECRET || '';
  const keyId = (process.env.BANKING_SANDBOX_EVIDENCE_KEY_ID || '').trim();
  return {
    secret,
    keyId,
    secretConfigured: secret.length >= 32,
    keyIdConfigured: /^[A-Za-z0-9._-]{1,64}$/.test(keyId)
  };
}

export function providerSandboxEvidenceStatus() {
  const config = evidenceConfig();
  const configured = config.secretConfigured && config.keyIdConfigured;
  return {
    configured,
    secretConfigured: config.secretConfigured,
    keyIdConfigured: config.keyIdConfigured,
    keyId: config.keyIdConfigured ? config.keyId : null,
    secretExposed: false,
    disclosure: configured
      ? 'Tamper-evident provider-sandbox evidence signing is configured for internal verification.'
      : 'Evidence export remains locked until a separate 32+ character evidence secret and non-secret evidence key ID are configured.'
  };
}

function requireEvidenceConfig() {
  const config = evidenceConfig();
  if (!config.secretConfigured || !config.keyIdConfigured) {
    throw new BankingError(503, 'SANDBOX_EVIDENCE_SIGNING_NOT_CONFIGURED', 'Provider-sandbox evidence signing is not configured.');
  }
  return config;
}

function requireRunId(value: string) {
  const runId = value.trim().toLowerCase();
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(runId)) {
    throw new BankingError(400, 'CERTIFICATION_RUN_ID_INVALID', 'A valid provider-sandbox certification run ID is required.');
  }
  return runId;
}

function releaseSha() {
  const candidates = [
    process.env.GALACTIC_RELEASE_SHA,
    process.env.VERCEL_GIT_COMMIT_SHA,
    process.env.GITHUB_SHA
  ];
  for (const candidate of candidates) {
    const normalized = (candidate || '').trim().toLowerCase();
    if (/^[a-f0-9]{40}$/.test(normalized)) return normalized;
  }
  return null;
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function safeHexEqual(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  const a = Buffer.from(left, 'hex');
  const b = Buffer.from(right, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

function canonicalize(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    const sorted: Record<string, JsonValue> = {};
    for (const key of Object.keys(value).sort()) sorted[key] = canonicalize(value[key]);
    return sorted;
  }
  return value;
}

export function canonicalEvidenceJson(manifest: ProviderSandboxEvidenceManifest) {
  return JSON.stringify(canonicalize(manifest as unknown as JsonValue));
}

function numberValue(value: unknown, label: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new BankingError(500, 'EVIDENCE_DATA_INVALID', `${label} is invalid in provider-sandbox evidence.`);
  }
  return parsed;
}

function timestamp(value: unknown, label: string) {
  const parsed = new Date(String(value));
  if (!Number.isFinite(parsed.getTime())) {
    throw new BankingError(500, 'EVIDENCE_DATA_INVALID', `${label} timestamp is invalid in provider-sandbox evidence.`);
  }
  return parsed.toISOString();
}

function jsonObject(value: unknown) {
  if (typeof value === 'string') return JSON.parse(value) as Record<string, unknown>;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BankingError(500, 'EVIDENCE_DATA_INVALID', 'Reconciliation snapshot is invalid.');
  }
  return value as Record<string, unknown>;
}

async function withEvidencePool<T>(work: (pool: Pool) => Promise<T>) {
  const database = providerSandboxDatabaseStatus();
  if (!database.enabled) {
    throw new BankingError(503, 'SANDBOX_DATABASE_DISABLED', 'Provider-sandbox durable storage is not enabled.');
  }

  const pool = new Pool({
    connectionString: (process.env.BANKING_SANDBOX_DATABASE_URL || '').trim(),
    max: 1,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 5_000,
    application_name: 'galactic-trust-sandbox-evidence',
    ssl: database.sslEnabled ? { rejectUnauthorized: true } : false
  });

  try {
    return await work(pool);
  } finally {
    await pool.end();
  }
}

async function buildManifest(certificationRunId: string): Promise<ProviderSandboxEvidenceManifest> {
  const runId = requireRunId(certificationRunId);
  const prefix = `cert-${runId}-%`;

  const base = await withEvidencePool(async (pool) => {
    const [migrationResult, resourceResult] = await Promise.all([
      pool.query(
        `SELECT migration_name, checksum_sha256, applied_at
           FROM galactic_schema_migrations
          ORDER BY migration_name`
      ),
      pool.query(
        `SELECT galactic_resource_type, galactic_resource_id, provider,
                provider_resource_id, created_at
           FROM banking_provider_resource_links
          WHERE environment = 'provider_sandbox'
            AND galactic_resource_id LIKE $1
          ORDER BY galactic_resource_type, galactic_resource_id`,
        [prefix]
      )
    ]);

    if (!resourceResult.rowCount) {
      throw new BankingError(404, 'CERTIFICATION_RUN_NOT_FOUND', 'No durable provider-sandbox resources were found for this certification run.');
    }

    const providers = new Set(resourceResult.rows.map((row) => String(row.provider)));
    if (providers.size !== 1) {
      throw new BankingError(409, 'CERTIFICATION_PROVIDER_CONFLICT', 'Certification run contains resources from more than one provider.');
    }
    const provider = [...providers][0];

    const transferMapping = resourceResult.rows.find((row) => row.galactic_resource_type === 'transfer');
    const accountMapping = resourceResult.rows.find((row) => row.galactic_resource_type === 'account');
    if (!transferMapping || !accountMapping) {
      throw new BankingError(409, 'CERTIFICATION_RUN_INCOMPLETE', 'Certification run is missing its durable account or transfer mapping.');
    }

    const providerTransferId = String(transferMapping.provider_resource_id);
    const accountResourceId = String(accountMapping.galactic_resource_id);

    const [eventResult, journalResult, reconciliationResult, auditResult] = await Promise.all([
      pool.query(
        `SELECT event_id, raw_provider_event_id,
                canonical_event ->> 'type' AS event_type,
                status, attempt_count, received_at, processed_at, failure_code
           FROM banking_provider_events
          WHERE environment = 'provider_sandbox'
            AND provider = $1
            AND canonical_event ->> 'resourceId' = $2
          ORDER BY received_at, event_id`,
        [provider, providerTransferId]
      ),
      pool.query(
        `SELECT journals.journal_id, journals.event_id, journals.occurred_at,
                COALESCE(SUM(lines.debit_cents), 0) AS debit_cents,
                COALESCE(SUM(lines.credit_cents), 0) AS credit_cents
           FROM banking_ledger_journals AS journals
           JOIN banking_ledger_lines AS lines ON lines.journal_id = journals.journal_id
           JOIN banking_provider_events AS events ON events.event_id = journals.event_id
          WHERE journals.environment = 'provider_sandbox'
            AND events.provider = $1
            AND events.canonical_event ->> 'resourceId' = $2
          GROUP BY journals.journal_id, journals.event_id, journals.occurred_at
          ORDER BY journals.occurred_at, journals.journal_id`,
        [provider, providerTransferId]
      ),
      pool.query(
        `SELECT id, scope, status, snapshot, created_at, resolved_at
           FROM banking_reconciliations
          WHERE environment = 'provider_sandbox'
            AND provider = $1
            AND resource_id IN ($2, $3)
          ORDER BY created_at, id`,
        [provider, providerTransferId, accountResourceId]
      ),
      pool.query(
        `SELECT action, COUNT(*) AS action_count
           FROM banking_audit_events
          WHERE environment = 'provider_sandbox'
            AND (
              metadata ->> 'runId' = $1
              OR resource_id LIKE $2
              OR resource_id = $3
              OR resource_id = $4
            )
          GROUP BY action
          ORDER BY action`,
        [runId, prefix, providerTransferId, accountResourceId]
      )
    ]);

    return {
      provider,
      migrations: migrationResult.rows.map((row) => ({
        name: String(row.migration_name),
        checksumSha256: String(row.checksum_sha256),
        appliedAt: timestamp(row.applied_at, 'Migration appliedAt')
      })),
      resources: resourceResult.rows.map((row) => ({
        type: String(row.galactic_resource_type) as 'customer' | 'account' | 'transfer' | 'card',
        galacticResourceId: String(row.galactic_resource_id),
        providerResourceSha256: sha256(`${provider}:${String(row.provider_resource_id)}`),
        createdAt: timestamp(row.created_at, 'Resource createdAt')
      })),
      providerEvents: eventResult.rows.map((row) => ({
        eventSha256: sha256(`${provider}:${String(row.event_id)}`),
        rawProviderEventSha256: sha256(`${provider}:${String(row.raw_provider_event_id)}`),
        type: String(row.event_type),
        status: String(row.status),
        attemptCount: numberValue(row.attempt_count, 'Event attemptCount'),
        receivedAt: timestamp(row.received_at, 'Event receivedAt'),
        processedAt: row.processed_at ? timestamp(row.processed_at, 'Event processedAt') : null,
        failureCode: row.failure_code ? String(row.failure_code) : null
      })),
      journals: journalResult.rows.map((row) => {
        const debitCents = numberValue(row.debit_cents, 'Journal debit total');
        const creditCents = numberValue(row.credit_cents, 'Journal credit total');
        return {
          journalId: String(row.journal_id),
          eventSha256: sha256(`${provider}:${String(row.event_id)}`),
          occurredAt: timestamp(row.occurred_at, 'Journal occurredAt'),
          debitCents,
          creditCents,
          balanced: debitCents === creditCents
        };
      }),
      reconciliations: reconciliationResult.rows.map((row) => {
        const snapshot = jsonObject(row.snapshot);
        return {
          id: String(row.id),
          scope: String(row.scope),
          status: String(row.status),
          providerAmountCents: numberValue(snapshot.providerAmountCents, 'Reconciliation provider amount'),
          internalAmountCents: numberValue(snapshot.internalAmountCents, 'Reconciliation internal amount'),
          discrepancyCents: numberValue(snapshot.discrepancyCents, 'Reconciliation discrepancy'),
          createdAt: timestamp(row.created_at, 'Reconciliation createdAt'),
          resolvedAt: row.resolved_at ? timestamp(row.resolved_at, 'Reconciliation resolvedAt') : null
        };
      }),
      auditActionCounts: auditResult.rows.map((row) => ({
        action: String(row.action),
        count: numberValue(row.action_count, 'Audit action count')
      }))
    };
  });

  const operations = await getProviderSandboxOperationsSnapshot();
  return {
    schemaVersion: 'galactic-provider-sandbox-evidence-v1',
    environment: 'provider_sandbox',
    repository: 'hartensteindominic/Galactic',
    releaseSha: releaseSha(),
    certificationRunId: runId,
    provider: base.provider,
    generatedAt: new Date().toISOString(),
    migrations: base.migrations,
    resources: base.resources,
    providerEvents: base.providerEvents,
    journals: base.journals,
    reconciliations: base.reconciliations,
    auditActionCounts: base.auditActionCounts,
    operations: {
      received: operations.events.received,
      processing: operations.events.processing,
      staleProcessing: operations.events.staleProcessing,
      retryableFailed: operations.events.retryableFailed,
      terminalFailed: operations.events.terminalFailed,
      processed: operations.events.processed,
      openDiscrepancies: operations.reconciliations.openDiscrepancies
    },
    assertions: {
      containsSecrets: false,
      containsRawProviderResourceIds: false,
      containsRawWebhookBodies: false,
      containsCustomerPii: false,
      productionLiveMoneyAuthorized: false
    }
  };
}

export async function generateProviderSandboxEvidence(input: {
  operatorId: string;
  certificationRunId: string;
}): Promise<ProviderSandboxEvidenceEnvelope> {
  const config = requireEvidenceConfig();
  const manifest = await buildManifest(input.certificationRunId);
  const canonical = canonicalEvidenceJson(manifest);
  const manifestSha256 = sha256(canonical);
  const hmacSha256 = createHmac('sha256', config.secret).update(canonical).digest('hex');
  const bundleId = `evidence-${randomUUID()}`;

  await withEvidencePool(async (pool) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO banking_certification_evidence (
           bundle_id, certification_run_id, environment, provider, evidence_key_id,
           generated_at, manifest, manifest_sha256, hmac_sha256
         ) VALUES ($1,$2,'provider_sandbox',$3,$4,$5,$6::jsonb,$7,$8)`,
        [
          bundleId,
          manifest.certificationRunId,
          manifest.provider,
          config.keyId,
          manifest.generatedAt,
          JSON.stringify(manifest),
          manifestSha256,
          hmacSha256
        ]
      );
      await client.query(
        `INSERT INTO banking_audit_events (
           id, actor_type, actor_id, action, resource_type, resource_id,
           environment, occurred_at, metadata
         ) VALUES ($1,'admin',$2,'certification_evidence_generated','certification_evidence',$3,
                   'provider_sandbox',$4,$5::jsonb)`,
        [
          randomUUID(),
          input.operatorId,
          bundleId,
          manifest.generatedAt,
          JSON.stringify({
            certificationRunId: manifest.certificationRunId,
            manifestSha256,
            evidenceKeyId: config.keyId
          })
        ]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  return {
    bundleId,
    evidenceKeyId: config.keyId,
    algorithm: 'HMAC-SHA256',
    verificationScope: 'galactic_internal_hmac',
    manifestSha256,
    hmacSha256,
    manifest
  };
}

export function verifyProviderSandboxEvidenceEnvelope(envelope: ProviderSandboxEvidenceEnvelope) {
  const config = requireEvidenceConfig();
  if (envelope.evidenceKeyId !== config.keyId) {
    return { valid: false, reason: 'evidence_key_id_mismatch' as const };
  }

  const canonical = canonicalEvidenceJson(envelope.manifest);
  const expectedDigest = sha256(canonical);
  const expectedHmac = createHmac('sha256', config.secret).update(canonical).digest('hex');
  const digestValid = safeHexEqual(expectedDigest, envelope.manifestSha256);
  const hmacValid = safeHexEqual(expectedHmac, envelope.hmacSha256);

  return {
    valid: digestValid && hmacValid,
    digestValid,
    hmacValid,
    reason: digestValid && hmacValid ? null : 'evidence_integrity_mismatch' as const
  };
}
