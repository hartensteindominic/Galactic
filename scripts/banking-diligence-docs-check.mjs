import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');

const files = {
  index: read('docs/sponsor-bank/README.md'),
  incident: read('docs/sponsor-bank/INCIDENT-RESPONSE-RUNBOOK.md'),
  backup: read('docs/sponsor-bank/DATABASE-BACKUP-RECOVERY-RUNBOOK.md'),
  data: read('docs/sponsor-bank/DATA-MINIMIZATION-RETENTION.md'),
  operator: read('docs/sponsor-bank/OPERATOR-AUTH-PROTOCOL.md'),
  environment: read('docs/sponsor-bank/SANDBOX-ENVIRONMENT-CHECKLIST.md'),
  runbook: read('docs/sponsor-bank/SANDBOX-OPERATIONS-RUNBOOK.md'),
  evidence: read('docs/sponsor-bank/SANDBOX-EVIDENCE-TEMPLATE.md'),
  security: read('SECURITY.md')
};

const required = [
  [files.index, 'INCIDENT-RESPONSE-RUNBOOK.md', 'diligence index must include incident response'],
  [files.index, 'DATABASE-BACKUP-RECOVERY-RUNBOOK.md', 'diligence index must include backup/recovery'],
  [files.index, 'DATA-MINIMIZATION-RETENTION.md', 'diligence index must include data governance'],
  [files.index, 'OPERATOR-AUTH-PROTOCOL.md', 'diligence index must include operator auth protocol'],
  [files.index, 'SANDBOX-EVIDENCE-TEMPLATE.md', 'diligence index must include evidence template'],

  [files.incident, 'Do not weaken or remove fail-closed controls', 'incident response must prohibit weakening controls during recovery'],
  [files.incident, 'Never edit posted historical journal lines to force a match.', 'incident response must protect append-only accounting'],
  [files.incident, 'rotate the operator signing secret', 'incident response must include operator credential rotation'],
  [files.incident, 'rotate the webhook secret', 'incident response must include webhook credential rotation'],

  [files.backup, 'point-in-time recovery (PITR)', 'backup runbook must require PITR capability review'],
  [files.backup, 'append-only journal/line data remains blocked', 'restore test must validate append-only ledger protections'],
  [files.backup, 'previously consumed request ID still exists', 'restore test must validate operator replay evidence'],
  [files.backup, 'assume reconciliation is required', 'database restore must trigger provider-vs-internal reconciliation'],

  [files.data, 'Collect and retain **only what the approved product flow needs**', 'data governance must require minimization'],
  [files.data, 'Class 3 — Restricted secrets/security credentials', 'data governance must classify secrets'],
  [files.data, 'Raw provider webhook bodies should not be retained by default', 'data governance must minimize raw webhook retention'],
  [files.data, 'not a final legal schedule', 'engineering retention defaults must not be represented as final legal policy'],

  [files.operator, 'operatorId.requestId.timestamp.HTTP_METHOD.requestPath.sha256(rawBody)', 'operator protocol must document the exact one-time signed payload'],
  [files.operator, 'Atomically consume the one-time request ID', 'operator protocol must document durable request consumption'],
  [files.operator, 'does **not** store', 'operator protocol must document replay-record secret exclusions'],

  [files.environment, 'Do not use a customer/demo identity as a sandbox operator.', 'environment checklist must separate customer/operator identities'],
  [files.environment, 'never edit posted journal lines to force a match', 'environment checklist must protect ledger history'],

  [files.runbook, 'Do not weaken a gate to make the test pass.', 'operations runbook must prohibit bypassing safety gates'],
  [files.runbook, 'maximum 100 mapped accounts per run', 'operations runbook must preserve reconciliation sweep limit'],
  [files.runbook, 'five automatic attempts maximum per event', 'operations runbook must preserve bounded retry policy'],

  [files.evidence, 'Real money moved: MUST BE NO', 'evidence template must assert zero-money sandbox certification'],
  [files.evidence, 'Additional journal created: MUST BE NO', 'evidence template must test duplicate webhook safety'],
  [files.evidence, 'Historical journal edited: MUST BE NO', 'evidence template must preserve append-only accounting'],
  [files.evidence, 'operator signing secret: NO', 'evidence template must explicitly exclude operator secrets'],

  [files.security, 'Never send', 'security policy must warn reporters against submitting secrets'],
  [files.security, 'move real funds', 'security policy must prohibit real-money security testing'],
  [files.security, 'Production boundary', 'security policy must distinguish repository security from regulatory approval']
];

for (const [source, text, label] of required) {
  if (!source.includes(text)) throw new Error(`Diligence documentation regression: ${label}`);
}

const forbidden = [
  [files.security, 'BEGIN PRIVATE KEY', 'security policy must not contain private key material'],
  [files.evidence, 'postgresql://', 'evidence template must not contain a database connection string'],
  [files.evidence, 'sk-', 'evidence template must not contain API-key-like examples'],
  [files.incident, 'disable ledger validation', 'incident runbook must not suggest bypassing accounting controls'],
  [files.backup, 'DROP TABLE banking_', 'backup runbook must not suggest destructive banking-table recovery'],
  [files.data, 'store all webhook bodies', 'data framework must not encourage indiscriminate raw webhook retention']
];

for (const [source, text, label] of forbidden) {
  if (source.includes(text)) throw new Error(`Diligence documentation regression: ${label}`);
}

console.log('Galactic Trust sponsor-bank diligence, incident, recovery, data-governance, evidence, and security documentation checks passed.');
