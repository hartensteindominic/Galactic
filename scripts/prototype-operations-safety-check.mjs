import fs from 'node:fs';

const required = [
  ['lib/prototype-operations.ts', "responseBodyLogged: false", 'operations database failures must explicitly avoid raw response-body logging'],
  ['lib/prototype-operations.ts', "Buffer.byteLength(serialized, 'utf8')", 'webhook payload limits must use UTF-8 byte length'],
  ['lib/prototype-operations.ts', "'WEBHOOK_REPLAY_CONFLICT'", 'reused webhook IDs with different content must fail closed'],
  ['lib/prototype-operations.ts', "'WEBHOOK_REPLAY_STATE_UNKNOWN'", 'unmatched duplicate webhook state must fail closed'],
  ['lib/prototype-operations.ts', 'payload_digest !== payloadDigest', 'webhook replay verification must compare stored payload digest'],
  ['lib/prototype-operations.ts', 'replay.event_type !== eventType', 'webhook replay verification must compare event type'],
  ['lib/prototype-operations.ts', 'Exact duplicate sandbox event ignored.', 'exact duplicate webhook events must be explicitly identified'],
  ['scripts/prototype-operations-runtime-check.mjs', 'Prototype operations webhook replay and log-sanitization runtime checks passed.', 'operations webhook behavior must have executable runtime coverage'],
  ['package.json', 'scripts/prototype-operations-runtime-check.mjs', 'operations webhook runtime checks must run in the CI safety suite']
];

const forbidden = [
  ['lib/prototype-operations.ts', 'response.text()', 'operations database failures must not read raw response bodies for logging'],
  ['lib/prototype-operations.ts', 'detail.slice(', 'operations database failures must not log truncated raw provider/database details'],
  ['lib/prototype-operations.ts', 'console.error(\'Prototype operations database request failed\', response.status, detail', 'operations database failures must not log raw response details']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Prototype operations replay-integrity and database-log sanitization safety checks passed.');
