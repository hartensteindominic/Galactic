import fs from 'node:fs';

const required = [
  ['lib/prototype-operator-auth.ts', 'const MIN_SECRET_LENGTH = 32', 'operator secret must have a minimum strength threshold'],
  ['lib/prototype-operator-auth.ts', 'Persistent prototype operations are locked until strong server-side operator access is configured.', 'persistent operations must fail closed without strong operator access'],
  ['lib/prototype-operator-auth.ts', 'HttpOnly; SameSite=Strict', 'operator session cookie must be HttpOnly and SameSite Strict'],
  ['lib/prototype-operator-auth.ts', "process.env.NODE_ENV === 'production' ? '; Secure' : ''", 'operator session cookie must be Secure in production'],
  ['app/api/prototype/operator/session/route.ts', 'requireTrustedOrigin(request)', 'operator login must enforce same-origin browser requests'],
  ['app/api/prototype/operator/session/route.ts', 'requireBestEffortLoginRateLimit(request)', 'operator login must include prototype abuse throttling'],
  ['app/api/prototype/operator/session/route.ts', 'readJsonBodyLimited', 'operator login must use bounded JSON parsing'],
  ['app/api/prototype/operations/route.ts', 'requirePrototypeOperator(request)', 'operations evidence must require operator boundary'],
  ['app/api/prototype/reconcile/route.ts', 'requirePrototypeOperator(request)', 'reconciliation must require operator boundary'],
  ['lib/prototype-readiness.ts', 'productionOperatorIdentityReady: false', 'readiness must not claim production operator identity readiness'],
  ['lib/request-security.ts', "'REQUEST_BODY_TOO_LARGE'", 'bounded JSON reader must fail closed on oversized bodies'],
  ['lib/request-security.ts', "'INVALID_JSON'", 'bounded JSON reader must fail closed on malformed JSON'],
  ['lib/white-label.ts', "'WHITE_LABEL_CONFIG_INVALID'", 'invalid tenant configuration must fail closed'],
  ['lib/white-label.ts', 'Duplicate white-label tenant key detected', 'duplicate tenant keys must be rejected'],
  ['lib/white-label.ts', 'is assigned to more than one white-label tenant', 'duplicate domain ownership must be rejected'],
  ['lib/white-label.ts', 'must contain valid JSON', 'malformed tenant JSON must be rejected'],
  ['lib/tenant-boundary.ts', "'TENANT_HOST_MISMATCH'", 'cross-tenant host mismatch must fail closed'],
  ['lib/tenant-boundary.ts', "'TENANT_QUERY_OVERRIDE_FORBIDDEN'", 'production query tenant override must fail closed'],
  ['lib/tenant-boundary.ts', "'UNKNOWN_TENANT'", 'unknown tenant keys must fail closed'],
  ['lib/tenant-boundary.ts', "process.env.VERCEL_ENV === 'preview'", 'tenant switching on Vercel must require explicit preview environment'],
  ['lib/tenant-boundary.ts', 'resolveAuthenticatedServerTenant', 'authenticated server routes must explicitly resolve a known tenant'],
  ['scripts/tenant-boundary-runtime-check.mjs', 'Tenant boundary runtime behavior checks passed.', 'tenant routing rules must have executable behavioral coverage'],
  ['package.json', 'scripts/tenant-boundary-runtime-check.mjs', 'tenant boundary runtime coverage must run in the CI safety suite'],
  ['app/api/prototype/summary/route.ts', 'resolveRequestBrand', 'summary must use host-bound tenant resolution'],
  ['app/api/prototype/transfers/route.ts', 'resolveRequestBrand', 'transfers must use host-bound tenant resolution'],
  ['app/api/prototype/transfers/route.ts', 'readJsonBodyLimited', 'transfers must use bounded JSON parsing'],
  ['app/api/prototype/cashflow/route.ts', 'resolveRequestBrand', 'cashflow API must use host-bound tenant resolution'],
  ['app/api/prototype/operations/route.ts', 'resolveRequestBrand', 'operations API must use host-bound tenant resolution'],
  ['app/api/prototype/reconcile/route.ts', 'resolveRequestBrand', 'reconciliation API must use host-bound tenant resolution'],
  ['app/api/prototype/reconcile/route.ts', 'readJsonBodyLimited', 'reconciliation must use bounded JSON parsing'],
  ['app/api/sandbox/plaid/connect/route.ts', 'resolveRequestBrand', 'sandbox bank linking must use host-bound tenant resolution'],
  ['app/api/sandbox/plaid/connect/route.ts', 'readJsonBodyLimited', 'sandbox bank linking must use bounded JSON parsing'],
  ['app/api/prototype/webhooks/sandbox/route.ts', 'resolveAuthenticatedServerTenant', 'sandbox webhook must use explicit authenticated server tenant resolution'],
  ['app/api/prototype/webhooks/sandbox/route.ts', 'readJsonBodyLimited', 'sandbox webhook must use bounded JSON parsing'],
  ['app/prototype/page.tsx', 'resolveRequestBrand', 'prototype UI branding must use host-bound tenant resolution'],
  ['app/prototype/cashflow/page.tsx', 'resolveRequestBrand', 'cashflow UI branding must use host-bound tenant resolution'],
  ['app/prototype/bill-guard/page.tsx', 'resolveRequestBrand', 'Bill Guard UI branding must use host-bound tenant resolution'],
  ['app/prototype/transparency/page.tsx', 'resolveRequestBrand', 'transparency UI branding must use host-bound tenant resolution'],
  ['app/prototype/operations/page.tsx', 'resolveRequestBrand', 'operations UI branding must use host-bound tenant resolution']
];

const forbidden = [
  ['lib/prototype-readiness.ts', 'productionOperatorIdentityReady: true', 'prototype must never claim production operator identity readiness'],
  ['lib/tenant-boundary.ts', "VERCEL_ENV !== 'production'", 'preview override must not rely on an implicit non-production check'],
  ['app/prototype/operations/operations-shell.tsx', 'PROTOTYPE_OPERATOR_ACCESS_SECRET', 'operator server secret name must not appear in client UI'],
  ['app/prototype/operations/operations-shell.tsx', 'localStorage', 'operator secret/session must not be stored in localStorage'],
  ['app/prototype/operations/operations-shell.tsx', 'sessionStorage', 'operator secret/session must not be stored in sessionStorage'],
  ['app/prototype/operations/operations-shell.tsx', 'document.cookie', 'operator session cookie must remain HttpOnly and inaccessible to client JS']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Prototype operator-access, request-boundary, tenant-isolation and tenant-configuration safety checks passed.');
