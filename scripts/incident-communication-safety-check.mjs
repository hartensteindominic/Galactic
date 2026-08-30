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
  ['lib/prototype-readiness.ts', 'incidentCommunicationControls,', 'readiness must expose incident communication controls'],
  ['lib/prototype-readiness.ts', 'productionCustomerStatusChannelConnected: false', 'readiness must keep production customer-status channel disconnected'],
  ['lib/prototype-readiness.ts', 'approvedIncidentMessageWorkflowConnected: false', 'readiness must keep incident message approval unconfigured'],
  ['lib/prototype-readiness.ts', 'productionHumanIncidentSupportPathConnected: false', 'readiness must keep production human incident support disconnected'],
  ['lib/prototype-readiness.ts', 'customerVisibleIncidentStatusTimeVerified: false', 'readiness must keep customer-visible timing unverified'],
  ['lib/prototype-trust.ts', "id: 'incident-communication'", 'Trust Center must expose incident communication control'],
  ['lib/prototype-trust.ts', 'productionCustomerStatusChannelConnected: false', 'Trust Center must keep production status channel disconnected'],
  ['lib/prototype-trust.ts', 'approvedIncidentMessageWorkflowConnected: false', 'Trust Center must keep incident message approval unconfigured'],
  ['lib/prototype-trust.ts', 'customerVisibleIncidentStatusTimingVerified: false', 'Trust Center must keep incident timing unverified'],
  ['app/api/prototype/status/route.ts', 'incidentCommunication: prototypeIncidentCommunicationControlStatus()', 'prototype status API must expose incident communication posture'],
  ['app/api/prototype/status/route.ts', 'incident-communication model is not a production status page or exercised customer-communications program', 'prototype status API must limit incident communication claims'],
  ['scripts/incident-communication-runtime-check.mjs', 'Incident communication and unknown-transaction customer-status runtime checks passed.', 'incident status wording must have executable runtime coverage'],
  ['package.json', 'scripts/incident-communication-runtime-check.mjs', 'incident status runtime coverage must run in CI']
];

const forbidden = [
  ['lib/prototype-incident-status.ts', 'productionCustomerStatusChannelConnected: true', 'prototype must not self-connect a production customer-status channel'],
  ['lib/prototype-incident-status.ts', 'approvedIncidentMessageWorkflowConnected: true', 'prototype must not self-approve incident messaging'],
  ['lib/prototype-incident-status.ts', 'productionHumanSupportPathConnected: true', 'prototype must not self-claim production human incident support'],
  ['lib/prototype-incident-status.ts', 'customerVisibleStatusTimingVerified: true', 'prototype must not self-certify customer-visible incident timing'],
  ['lib/prototype-incident-status.ts', 'automaticReplacementAllowed: true', 'incident model must never automatically replace a financial instruction'],
  ['lib/prototype-readiness.ts', 'productionCustomerStatusChannelConnected: true', 'readiness must not self-connect a production incident-status channel'],
  ['lib/prototype-readiness.ts', 'approvedIncidentMessageWorkflowConnected: true', 'readiness must not self-approve incident messages'],
  ['lib/prototype-readiness.ts', 'customerVisibleIncidentStatusTimeVerified: true', 'readiness must not self-certify customer incident timing'],
  ['lib/prototype-trust.ts', 'productionCustomerStatusChannelConnected: true', 'Trust Center must not claim production incident-status operation'],
  ['lib/prototype-trust.ts', 'customerVisibleIncidentStatusTimingVerified: true', 'Trust Center must not claim measured incident timing']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Incident communication, status-channel, readiness, Trust, API, and unknown-outcome safety checks passed.');
