import { createHash, timingSafeEqual } from 'node:crypto';
import { BankingError } from './banking';
import { getPrototypeSnapshot } from './prototype-ledger';

export type ReconciliationAccount = {
  account_id: string;
  label: string;
  recorded_balance_cents: number;
  expected_balance_cents: number;
  delta_cents: number;
  status: 'balanced' | 'mismatch';
};

export type DoubleEntryReconciliationAccount = {
  account_id: string;
  label: string;
  recorded_balance_cents: number;
  gl_balance_cents: number;
  delta_cents: number;
  status: 'balanced' | 'mismatch';
};

export type DoubleEntryReconciliation = {
  mismatched_accounts: number;
  status: 'balanced' | 'attention';
  accounts: DoubleEntryReconciliationAccount[];
  message: string;
};

export type ReconciliationResult = {
  source: 'memory' | 'supabase';
  tenant_key: string;
  user_external_id: string;
  balanced_accounts: number;
  mismatched_accounts: number;
  status: 'balanced' | 'attention';
  accounts: ReconciliationAccount[];
  double_entry: DoubleEntryReconciliation;
  message: string;
};

type ReconciliationRow = {
  id: string;
  account_id: string;
  recorded_balance_cents: number;
  expected_balance_cents: number;
  delta_cents: number;
  status: 'balanced' | 'mismatch';
  checked_at: string;
};

type ProviderEventRow = {
  id: string;
  provider: string;
  provider_event_id: string;
  event_type: string;
  status: 'received' | 'processed' | 'ignored' | 'failed';
  received_at: string;
  processed_at: string | null;
};

type AuditEventRow = {
  id: string;
  actor_type: 'system' | 'demo_user' | 'operator' | 'provider';
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
};

type TenantRow = { id: string };

export type PrototypeOperatorAuditAction =
  | 'operator.session_started'
  | 'operator.session_ended'
  | 'operator.reconciliation_requested';

function supabaseConfig() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '') || '';
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { baseUrl, secretKey, configured: Boolean(baseUrl && secretKey) };
}

async function supabaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const config = supabaseConfig();
  if (!config.configured) {
    throw new BankingError(503, 'SUPABASE_NOT_CONFIGURED', 'The prototype database has not been configured.');
  }

  const headers = new Headers(init?.headers);
  headers.set('apikey', config.secretKey);
  headers.set('Authorization', `Bearer ${config.secretKey}`);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers,
    cache: 'no-store'
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.error('Prototype operations database request failed', response.status, detail.slice(0, 300));
    throw new BankingError(502, 'PROTOTYPE_OPERATIONS_ERROR', 'Prototype operations are temporarily unavailable.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

async function tenantRow(tenantKey: string) {
  const tenants = await supabaseRequest<TenantRow[]>(
    `/rest/v1/fintech_tenants?select=id&tenant_key=eq.${encodeURIComponent(tenantKey)}&limit=1`
  );
  const tenant = tenants[0];
  if (!tenant) throw new BankingError(404, 'UNKNOWN_TENANT', 'Unknown prototype tenant.');
  return tenant;
}

export function prototypeOperationsStatus() {
  const databaseConfigured = supabaseConfig().configured;
  const webhookConfigured = Boolean(process.env.PROTOTYPE_WEBHOOK_SECRET?.trim());

  return {
    databaseConfigured,
    reconciliationMode: databaseConfigured ? 'persistent' : 'memory',
    webhookInboxConfigured: databaseConfigured && webhookConfigured,
    doubleEntryAvailableInBuild: true,
    sanitizedAuditEvidenceAvailable: databaseConfigured,
    operatorAuditEvidenceAvailable: databaseConfigured,
    realProviderWebhooksEnabled: false,
    liveMoneyEnabled: false,
    disclosure: databaseConfigured
      ? 'Persistent simulation reconciliation and sanitized audit evidence are available. Real provider webhook processing and live money remain disabled.'
      : 'Memory-mode reconciliation is available for demo UX only. Configure Supabase to persist operations evidence.'
  } as const;
}

export async function recordPrototypeOperatorAuditEvent(input: {
  tenantKey: string;
  action: PrototypeOperatorAuditAction;
  entityType: 'operator_session' | 'profile';
  entityId?: string | null;
  resultStatus?: 'balanced' | 'attention';
  reconciliationSource?: 'memory' | 'supabase';
}) {
  if (!supabaseConfig().configured) {
    return { persisted: false, mode: 'memory' as const };
  }

  if (!input.tenantKey.trim()) {
    throw new BankingError(400, 'TENANT_REQUIRED', 'A tenant is required for prototype operator audit evidence.');
  }
  if (input.entityId && input.entityId.length > 180) {
    throw new BankingError(400, 'INVALID_AUDIT_ENTITY_ID', 'Prototype audit entity identifier is too long.');
  }

  const tenant = await tenantRow(input.tenantKey);
  const metadata: Record<string, string | boolean> = {
    simulation_only: true
  };
  if (input.resultStatus) metadata.result_status = input.resultStatus;
  if (input.reconciliationSource) metadata.reconciliation_source = input.reconciliationSource;

  await supabaseRequest<Array<{ id: string }>>('/rest/v1/fintech_audit_events', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      tenant_id: tenant.id,
      actor_type: 'operator',
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId || null,
      metadata
    })
  });

  return { persisted: true, mode: 'supabase' as const };
}

export async function runPrototypeReconciliation(tenantKey: string, userId = 'demo-nova'): Promise<ReconciliationResult> {
  if (!supabaseConfig().configured) {
    const snapshot = await getPrototypeSnapshot(tenantKey, userId);
    const accounts = snapshot.accounts.map<ReconciliationAccount>((account) => ({
      account_id: account.id,
      label: account.label,
      recorded_balance_cents: account.balanceCents,
      expected_balance_cents: account.balanceCents,
      delta_cents: 0,
      status: 'balanced'
    }));

    return {
      source: 'memory',
      tenant_key: tenantKey,
      user_external_id: userId,
      balanced_accounts: accounts.length,
      mismatched_accounts: 0,
      status: 'balanced',
      accounts,
      double_entry: {
        mismatched_accounts: 0,
        status: 'balanced',
        accounts: snapshot.accounts.map((account) => ({
          account_id: account.id,
          label: account.label,
          recorded_balance_cents: account.balanceCents,
          gl_balance_cents: account.balanceCents,
          delta_cents: 0,
          status: 'balanced'
        })),
        message: 'Memory-mode double-entry result is a UX simulation only; no persistent journal evidence exists.'
      },
      message: 'Memory-mode simulation reconciled for demo UX. No persistent evidence was written and no real money moved.'
    };
  }

  const [balanceResult, doubleEntryResult] = await Promise.all([
    supabaseRequest<Omit<ReconciliationResult, 'source' | 'double_entry'>>('/rest/v1/rpc/reconcile_fintech_profile', {
      method: 'POST',
      body: JSON.stringify({
        p_tenant_key: tenantKey,
        p_user_external_id: userId
      })
    }),
    supabaseRequest<DoubleEntryReconciliation & { tenant_key: string; user_external_id: string }>(
      '/rest/v1/rpc/reconcile_fintech_gl_profile',
      {
        method: 'POST',
        body: JSON.stringify({
          p_tenant_key: tenantKey,
          p_user_external_id: userId
        })
      }
    )
  ]);

  const status = balanceResult.status === 'balanced' && doubleEntryResult.status === 'balanced'
    ? 'balanced'
    : 'attention';

  return {
    source: 'supabase',
    ...balanceResult,
    status,
    double_entry: {
      mismatched_accounts: doubleEntryResult.mismatched_accounts,
      status: doubleEntryResult.status,
      accounts: doubleEntryResult.accounts,
      message: doubleEntryResult.message
    }
  };
}

export async function getPrototypeOperationsSnapshot(tenantKey: string) {
  const status = prototypeOperationsStatus();
  if (!status.databaseConfigured) {
    return {
      status,
      latestReconciliations: [] as ReconciliationRow[],
      providerEvents: [] as ProviderEventRow[],
      auditEvents: [] as AuditEventRow[]
    };
  }

  const tenant = await tenantRow(tenantKey).catch((error) => {
    if (error instanceof BankingError && error.status === 404) return null;
    throw error;
  });
  if (!tenant) {
    return { status, latestReconciliations: [], providerEvents: [], auditEvents: [] };
  }

  const [latestReconciliations, providerEvents, auditEvents] = await Promise.all([
    supabaseRequest<ReconciliationRow[]>(
      `/rest/v1/fintech_reconciliation_runs?select=id,account_id,recorded_balance_cents,expected_balance_cents,delta_cents,status,checked_at&tenant_id=eq.${tenant.id}&order=checked_at.desc&limit=10`
    ),
    supabaseRequest<ProviderEventRow[]>(
      `/rest/v1/fintech_provider_events?select=id,provider,provider_event_id,event_type,status,received_at,processed_at&tenant_id=eq.${tenant.id}&order=received_at.desc&limit=10`
    ),
    supabaseRequest<AuditEventRow[]>(
      `/rest/v1/fintech_audit_events?select=id,actor_type,action,entity_type,entity_id,created_at&tenant_id=eq.${tenant.id}&order=created_at.desc&limit=15`
    )
  ]);

  return { status, latestReconciliations, providerEvents, auditEvents };
}

export function verifyPrototypeWebhookSecret(presented: string) {
  const configured = process.env.PROTOTYPE_WEBHOOK_SECRET?.trim() || '';
  if (!configured || !presented) return false;
  const left = Buffer.from(configured);
  const right = Buffer.from(presented);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function recordPrototypeProviderEvent(input: {
  tenantKey: string;
  providerEventId: string;
  eventType: string;
  payload: unknown;
}) {
  if (!supabaseConfig().configured) {
    throw new BankingError(503, 'PERSISTENT_LEDGER_REQUIRED', 'Configure the prototype Supabase ledger before using the webhook inbox.');
  }
  if (!input.providerEventId.trim() || input.providerEventId.length > 180) {
    throw new BankingError(400, 'INVALID_EVENT_ID', 'A valid sandbox event ID is required.');
  }
  if (!input.eventType.trim() || input.eventType.length > 120) {
    throw new BankingError(400, 'INVALID_EVENT_TYPE', 'A valid sandbox event type is required.');
  }

  const tenant = await tenantRow(input.tenantKey);

  const serialized = JSON.stringify(input.payload ?? null);
  if (serialized.length > 100000) {
    throw new BankingError(413, 'EVENT_TOO_LARGE', 'Sandbox webhook payload is too large.');
  }
  const payloadDigest = createHash('sha256').update(serialized).digest('hex');

  const rows = await supabaseRequest<Array<{ id: string; provider_event_id: string; status: string }>>(
    '/rest/v1/fintech_provider_events?on_conflict=tenant_id,provider,provider_event_id',
    {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=representation' },
      body: JSON.stringify({
        tenant_id: tenant.id,
        provider: 'prototype_sandbox',
        provider_event_id: input.providerEventId.trim(),
        event_type: input.eventType.trim(),
        status: 'received',
        payload_digest: payloadDigest,
        metadata: { simulation_only: true }
      })
    }
  );

  if (rows.length === 0) {
    return {
      duplicate: true,
      providerEventId: input.providerEventId.trim(),
      message: 'Duplicate sandbox event ignored. No real provider action was taken.'
    };
  }

  return {
    duplicate: false,
    providerEventId: rows[0].provider_event_id,
    message: 'Sandbox event recorded for operations testing. No real provider action was taken.'
  };
}
