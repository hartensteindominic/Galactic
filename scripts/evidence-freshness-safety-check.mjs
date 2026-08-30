import fs from 'node:fs';

const required = [
  ['lib/prototype-evidence-freshness.ts', "'recent-evidence'", 'freshness model must expose recent-evidence state'],
  ['lib/prototype-evidence-freshness.ts', "'stale-evidence'", 'freshness model must expose stale-evidence state'],
  ['lib/prototype-evidence-freshness.ts', "'invalid-evidence'", 'freshness model must fail unknown on invalid timestamps'],
  ['lib/prototype-evidence-freshness.ts', "'future-evidence'", 'freshness model must fail unknown on suspicious future timestamps'],
  ['lib/prototype-evidence-freshness.ts', 'continuousMonitoringVerified: false', 'freshness must not claim continuous monitoring'],
  ['lib/prototype-evidence-freshness.ts', 'productionHealthVerified: false', 'freshness must not claim production health'],
  ['lib/prototype-evidence-freshness.ts', 'providerStatementReconciliationVerified: false', 'freshness must not claim provider-statement reconciliation'],
  ['lib/prototype-evidence-freshness.ts', 'Recency does not prove continuous monitoring', 'recent evidence disclosure must limit health inference'],
  ['app/api/prototype/operations/freshness/route.ts', 'requirePrototypeOperator(request)', 'freshness endpoint must keep operator access boundary'],
  ['app/api/prototype/operations/freshness/route.ts', 'resolveRequestBrand', 'freshness endpoint must remain tenant host-bound'],
  ['app/api/prototype/operations/freshness/route.ts', 'evaluatePrototypeEvidenceFreshness', 'freshness endpoint must use centralized freshness model'],
  ['app/api/prototype/operations/freshness/route.ts', 'Recent evidence does not prove continuous monitoring, production health, provider-statement reconciliation', 'freshness endpoint must disclose evidence-vs-health boundary'],
  ['app/api/prototype/status/route.ts', 'evidenceFreshness: prototypeEvidenceFreshnessControlStatus()', 'general prototype status must expose evidence freshness control posture'],
  ['app/api/prototype/status/route.ts', 'Evidence recency does not prove continuous monitoring or production health', 'general prototype status must limit evidence recency claims'],
  ['scripts/evidence-freshness-runtime-check.mjs', 'Prototype evidence freshness runtime behavior checks passed.', 'freshness behavior must have executable runtime coverage'],
  ['package.json', 'scripts/evidence-freshness-runtime-check.mjs', 'freshness runtime test must run in CI']
];

const forbidden = [
  ['lib/prototype-evidence-freshness.ts', 'continuousMonitoringVerified: true', 'freshness model must not self-certify continuous monitoring'],
  ['lib/prototype-evidence-freshness.ts', 'productionHealthVerified: true', 'freshness model must not self-certify production health'],
  ['lib/prototype-evidence-freshness.ts', 'providerStatementReconciliationVerified: true', 'freshness model must not self-certify provider-statement reconciliation'],
  ['app/api/prototype/operations/freshness/route.ts', "health: 'healthy'", 'freshness endpoint must not convert recency into a healthy production status'],
  ['app/api/prototype/operations/freshness/route.ts', 'productionHealthVerified: true', 'freshness endpoint must not self-certify production health'],
  ['app/api/prototype/status/route.ts', "productionHealthVerified: true", 'general prototype status must not self-certify production health']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Prototype evidence freshness, operator boundary, status API, and evidence-vs-health safety checks passed.');
