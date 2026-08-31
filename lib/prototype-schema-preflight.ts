import { BankingError } from './banking';

export type PrototypeSchemaResourceKind = 'table' | 'rpc';

export type PrototypeSchemaResource = {
  migrationId: '001' | '002' | '003' | '004' | '005';
  kind: PrototypeSchemaResourceKind;
  name: string;
  openApiPath: string;
};

const EXPECTED_SCHEMA_RESOURCES: readonly PrototypeSchemaResource[] = [
  { migrationId: '001', kind: 'table', name: 'fintech_tenants', openApiPath: '/fintech_tenants' },
  { migrationId: '001', kind: 'table', name: 'fintech_profiles', openApiPath: '/fintech_profiles' },
  { migrationId: '001', kind: 'table', name: 'fintech_accounts', openApiPath: '/fintech_accounts' },
  { migrationId: '001', kind: 'table', name: 'fintech_transactions', openApiPath: '/fintech_transactions' },
  { migrationId: '001', kind: 'table', name: 'fintech_linked_accounts', openApiPath: '/fintech_linked_accounts' },
  { migrationId: '002', kind: 'table', name: 'fintech_provider_events', openApiPath: '/fintech_provider_events' },
  { migrationId: '002', kind: 'table', name: 'fintech_reconciliation_runs', openApiPath: '/fintech_reconciliation_runs' },
  { migrationId: '002', kind: 'table', name: 'fintech_audit_events', openApiPath: '/fintech_audit_events' },
  { migrationId: '002', kind: 'rpc', name: 'reconcile_fintech_profile', openApiPath: '/rpc/reconcile_fintech_profile' },
  { migrationId: '003', kind: 'rpc', name: 'simulate_fintech_transfer', openApiPath: '/rpc/simulate_fintech_transfer' },
  { migrationId: '004', kind: 'table', name: 'fintech_gl_accounts', openApiPath: '/fintech_gl_accounts' },
  { migrationId: '004', kind: 'table', name: 'fintech_gl_journals', openApiPath: '/fintech_gl_journals' },
  { migrationId: '004', kind: 'table', name: 'fintech_gl_lines', openApiPath: '/fintech_gl_lines' },
  { migrationId: '004', kind: 'rpc', name: 'reconcile_fintech_gl_profile', openApiPath: '/rpc/reconcile_fintech_gl_profile' },
  { migrationId: '005', kind: 'table', name: 'fintech_cashflow_items', openApiPath: '/fintech_cashflow_items' },
  { migrationId: '005', kind: 'table', name: 'fintech_savings_goals', openApiPath: '/fintech_savings_goals' }
] as const;

function supabaseConfig() {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '') || '';
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { baseUrl, secretKey, configured: Boolean(baseUrl && secretKey) };
}

export function prototypeSchemaPreflightControlStatus() {
  return {
    implemented: true,
    readOnly: true,
    operatorAccessRequiredAtRoute: true,
    tenantContextRequiredAtRoute: true,
    expectedResourceCount: EXPECTED_SCHEMA_RESOURCES.length,
    usesPostgrestOpenApiObservation: true,
    invokesFinancialRpcs: false,
    mutatesDatabase: false,
    targetMigrationHistoryVerified: false,
    migrationsExecutedVerified: false,
    persistentRuntimeExerciseVerified: false,
    productionApprovalVerified: false,
    disclosure: 'Schema preflight can observe whether expected prototype table/RPC paths are exposed by the configured Supabase PostgREST schema. It does not invoke financial RPCs, mutate data, prove migration history/order, prove data correctness, prove restore readiness, or provide production approval.'
  } as const;
}

export function expectedPrototypeSchemaResources() {
  return EXPECTED_SCHEMA_RESOURCES.map((resource) => ({ ...resource }));
}

export async function runPrototypeSchemaPreflight() {
  const config = supabaseConfig();
  if (!config.configured) {
    throw new BankingError(503, 'SUPABASE_NOT_CONFIGURED', 'The prototype database has not been configured.');
  }

  const response = await fetch(`${config.baseUrl}/rest/v1/`, {
    method: 'GET',
    headers: {
      apikey: config.secretKey,
      Authorization: `Bearer ${config.secretKey}`,
      Accept: 'application/openapi+json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    console.error('Prototype schema preflight request failed', {
      status: response.status,
      responseBodyLogged: false
    });
    throw new BankingError(502, 'SCHEMA_PREFLIGHT_UNAVAILABLE', 'Prototype schema preflight is temporarily unavailable.');
  }

  let openApi: unknown;
  try {
    openApi = await response.json();
  } catch {
    throw new BankingError(502, 'SCHEMA_PREFLIGHT_INVALID_RESPONSE', 'Prototype schema preflight returned an invalid schema description.');
  }

  const paths = openApi && typeof openApi === 'object' && 'paths' in openApi
    ? (openApi as { paths?: unknown }).paths
    : null;

  if (!paths || typeof paths !== 'object' || Array.isArray(paths)) {
    throw new BankingError(502, 'SCHEMA_PREFLIGHT_INVALID_RESPONSE', 'Prototype schema preflight returned an invalid schema description.');
  }

  const observedPaths = new Set(Object.keys(paths as Record<string, unknown>));
  const resources = EXPECTED_SCHEMA_RESOURCES.map((resource) => ({
    ...resource,
    observed: observedPaths.has(resource.openApiPath)
  }));
  const observedCount = resources.filter((resource) => resource.observed).length;
  const missing = resources.filter((resource) => !resource.observed);

  return {
    source: 'supabase-postgrest-openapi' as const,
    readOnlyObservation: true,
    preflightExecuted: true,
    expectedResourceCount: resources.length,
    observedResourceCount: observedCount,
    missingResourceCount: missing.length,
    allExpectedResourcesObserved: missing.length === 0,
    resources,
    missingResources: missing.map((resource) => ({
      migrationId: resource.migrationId,
      kind: resource.kind,
      name: resource.name,
      openApiPath: resource.openApiPath
    })),
    targetMigrationHistoryVerified: false,
    migrationsExecutedVerified: false,
    dataCorrectnessVerified: false,
    reconciliationExerciseVerified: false,
    transferIdempotencyExerciseVerified: false,
    restoreExerciseVerified: false,
    productionApprovalVerified: false,
    disclosure: 'Observed PostgREST table/RPC paths are capability evidence only. Even when every expected path is observed, this preflight does not prove migration history/order, data correctness, idempotency, reconciliation, restore behavior, provider semantics, legal/compliance approval, sponsor approval, or readiness for live funds.'
  } as const;
}
