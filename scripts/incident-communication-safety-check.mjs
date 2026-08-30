import fs from 'node:fs';

const required = [
  ['lib/prototype-incident-status.ts', "'awaiting-confirmation'", 'incident status must expose non-terminal awaiting-confirmation state'],
  ['lib/prototype-incident-status.ts', "'temporarily-unavailable'", 'incident status must distinguish service availability from transaction outcome'],
  ['lib/prototype-incident-status.ts', 'An instruction that was already submitted may still be processing or awaiting authoritative confirmation.', 'incident copy must disclose that already-submitted instructions may still process'],
  ['lib/prototype-incident-status.ts', 'Do not create a replacement instruction while its outcome is unknown.', 'incident copy must block replacement while outcome is unknown'],
  ['lib/prototype-incident-status.ts', 'productionCustomerStatusChannelConnected: false', 'incident status must not claim a production customer-status channel'],
  ['lib/prototype-incident-status.ts', 'approvedIncidentMessageWorkflowConnected: false', 'incident status must not claim an approved incident-message workflow'],
  ['lib/prototype-incident-status.ts', 'productionHumanSupportPathConnected: false', 'incident status must not claim a production human support path'],
  ['lib/prototype-incident-status.ts', 'customerVisibleStatusTimingVerified: false', 'incident status must keep customer-visible timing unverified'],
  ['scripts/incident-communication-runtime-check.mjs', 'Incident communication and unknown-transaction customer-status runtime checks passed.', 'incident status wording must have executable runtime coverage'],
  ['package.json', 'scripts/incident-communication-runtime-check.mjs', 'incident status runtime coverage must run in CI']
];

const forbidden = [
  ['lib/prototype-incident-status.ts', 'productionCustomerStatusChannelConnected: true', 'prototype must not self-connect a production customer-status channel'],
  ['lib/prototype-incident-status.ts', 'approvedIncidentMessageWorkflowConnected: true', 'prototype must not self-approve incident messaging'],
  ['lib/prototype-incident-status.ts', 'productionHumanSupportPathConnected: true', 'prototype must not self-claim production human incident support'],
  ['lib/prototype-incident-status.ts', 'customerVisibleStatusTimingVerified: true', 'prototype must not self-certify customer-visible incident timing'],
  ['lib/prototype-incident-status.ts', 'automaticReplacementAllowed: true', 'incident model must never automatically replace a financial instruction']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Incident communication, status-channel, and unknown-outcome safety checks passed.');
