import fs from 'node:fs';

const required = [
  ['lib/prototype-operator-auth.ts', 'const MIN_SECRET_LENGTH = 32', 'operator secret must have a minimum strength threshold'],
  ['lib/prototype-operator-auth.ts', 'Persistent prototype operations are locked until strong server-side operator access is configured.', 'persistent operations must fail closed without strong operator access'],
  ['lib/prototype-operator-auth.ts', 'HttpOnly; SameSite=Strict', 'operator session cookie must be HttpOnly and SameSite Strict'],
  ['lib/prototype-operator-auth.ts', "process.env.NODE_ENV === 'production' ? '; Secure' : ''", 'operator session cookie must be Secure in production'],
  ['app/api/prototype/operator/session/route.ts', 'requireTrustedOrigin(request)', 'operator login must enforce same-origin browser requests'],
  ['app/api/prototype/operator/session/route.ts', 'requireBestEffortLoginRateLimit(request)', 'operator login must include prototype abuse throttling'],
  ['app/api/prototype/operations/route.ts', 'requirePrototypeOperator(request)', 'operations evidence must require operator boundary'],
  ['app/api/prototype/reconcile/route.ts', 'requirePrototypeOperator(request)', 'reconciliation must require operator boundary'],
  ['lib/prototype-readiness.ts', 'productionOperatorIdentityReady: false', 'readiness must not claim production operator identity readiness'],
  ['lib/tenant-boundary.ts', "'TENANT_HOST_MISMATCH'", 'cross-tenant host mismatch must fail closed'],
  ['lib/tenant-boundary.ts', "'TENANT_QUERY_OVERRIDE_FORBIDDEN'", 'production query tenant override must fail closed'],
  ['lib/tenant-boundary.ts', "process.env.VERCEL_ENV !== 'production'", 'Vercel tenant switching must be limited to non-production previews'],
  ['app/api/prototype/summary/route.ts', 'resolveRequestBrand', 'summary must use host-bound tenant resolution'],
  ['app/api/prototype/transfers/route.ts', 'resolveRequestBrand', 'transfers must use host-bound tenant resolution'],
  ['app/api/prototype/cashflow/route.ts', 'resolveRequestBrand', 'cashflow API must use host-bound tenant resolution'],
  ['app/api/prototype/operations/route.ts', 'resolveRequestBrand', 'operations API must use host-bound tenant resolution'],
  ['app/api/prototype/reconcile/route.ts', 'resolveRequestBrand', 'reconciliation API must use host-bound tenant resolution'],
  ['app/api/sandbox/plaid/connect/route.ts', 'resolveRequestBrand', 'sandbox bank linking must use host-bound tenant resolution'],
  ['app/prototype/page.tsx', 'resolveRequestBrand', 'prototype UI branding must use host-bound tenant resolution'],
  ['app/prototype/cashflow/page.tsx', 'resolveRequestBrand', 'cashflow UI branding must use host-bound tenant resolution'],
  ['app/prototype/transparency/page.tsx', 'resolveRequestBrand', 'transparency UI branding must use host-bound tenant resolution'],
  ['app/prototype/operations/page.tsx', 'resolveRequestBrand', 'operations UI branding must use host-bound tenant resolution']
];

const forbidden = [
  ['lib/prototype-readiness.ts', 'productionOperatorIdentityReady: true', 'prototype must never claim production operator identity readiness'],
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

console.log('Prototype operator-access and tenant-isolation safety checks passed.');
