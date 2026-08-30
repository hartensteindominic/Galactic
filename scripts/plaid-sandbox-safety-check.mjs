import fs from 'node:fs';

const required = [
  ['lib/plaid-sandbox.ts', 'credentialsConfigured,', 'Plaid status must distinguish credentials configuration'],
  ['lib/plaid-sandbox.ts', 'sandboxConnectionExerciseVerified: false', 'Plaid status must keep sandbox connection exercise unverified'],
  ['lib/plaid-sandbox.ts', 'sandboxPersistenceExerciseVerified: false', 'Plaid status must keep sandbox persistence exercise unverified'],
  ['lib/plaid-sandbox.ts', 'productionProviderApproved: false', 'Plaid status must not claim production provider approval'],
  ['lib/plaid-sandbox.ts', 'productionWebhookVerificationEnabled: false', 'Plaid status must not claim production webhook verification'],
  ['lib/plaid-sandbox.ts', 'liveBankLinkingEnabled: false', 'Plaid sandbox must not enable live bank linking'],
  ['lib/plaid-sandbox.ts', 'responseBodyLogged: false', 'Plaid failure logging must explicitly avoid provider response body'],
  ['lib/plaid-sandbox.ts', 'Plaid Sandbox could not complete the synthetic account-link request.', 'Plaid failures must use a fixed sanitized client message'],
  ['lib/plaid-sandbox.ts', 'The access token is used server-side for this request and is not returned to the browser or persisted by this prototype.', 'Plaid success disclosure must keep access token server-side'],
  ['lib/prototype-readiness.ts', 'externalSandboxEnvironmentConfigured = bankLink.credentialsConfigured', 'readiness must distinguish Plaid environment configuration'],
  ['lib/prototype-readiness.ts', 'externalSandboxConfigured = bankLink.sandboxConnectionExerciseVerified', 'readiness must derive exercised sandbox state only from exercise evidence'],
  ['lib/prototype-readiness.ts', 'plaidSandboxConnectionExerciseVerified: false', 'readiness must keep Plaid connection exercise unverified'],
  ['lib/prototype-readiness.ts', 'plaidSandboxPersistenceExerciseVerified: false', 'readiness must keep Plaid persistence exercise unverified'],
  ['lib/prototype-readiness.ts', 'productionPlaidProviderApproved: false', 'readiness must keep production Plaid approval false'],
  ['lib/prototype-readiness.ts', 'productionPlaidWebhookVerificationEnabled: false', 'readiness must keep production Plaid webhook verification false'],
  ['scripts/plaid-sandbox-runtime-check.mjs', 'Plaid Sandbox privacy, generic-error, token-boundary, and readiness runtime checks passed.', 'Plaid sandbox must have executable privacy/readiness coverage'],
  ['package.json', 'scripts/plaid-sandbox-runtime-check.mjs', 'Plaid runtime test must run in CI']
];

const forbidden = [
  ['lib/plaid-sandbox.ts', 'payload?.error_message', 'provider-supplied Plaid error text must not become client-facing BankingError text'],
  ['lib/plaid-sandbox.ts', 'response.json().catch', 'Plaid failure path must not parse provider response body for error messaging'],
  ['lib/plaid-sandbox.ts', 'sandboxConnectionExerciseVerified: true', 'Plaid status must not self-certify sandbox exercise'],
  ['lib/plaid-sandbox.ts', 'sandboxPersistenceExerciseVerified: true', 'Plaid status must not self-certify persistence exercise'],
  ['lib/plaid-sandbox.ts', 'productionProviderApproved: true', 'Plaid status must not self-certify production approval'],
  ['lib/plaid-sandbox.ts', 'productionWebhookVerificationEnabled: true', 'Plaid status must not self-enable production webhook verification'],
  ['lib/plaid-sandbox.ts', 'liveBankLinkingEnabled: true', 'Plaid sandbox must not claim live bank linking'],
  ['lib/prototype-readiness.ts', 'externalSandboxConfigured = bankLink.configured', 'readiness must not treat Plaid credentials alone as exercised sandbox behavior'],
  ['lib/prototype-readiness.ts', 'plaidSandboxConnectionExerciseVerified: true', 'readiness must not self-certify Plaid connection exercise'],
  ['lib/prototype-readiness.ts', 'plaidSandboxPersistenceExerciseVerified: true', 'readiness must not self-certify Plaid persistence exercise'],
  ['lib/prototype-readiness.ts', 'productionPlaidProviderApproved: true', 'readiness must not self-certify Plaid production approval'],
  ['lib/prototype-readiness.ts', 'productionPlaidWebhookVerificationEnabled: true', 'readiness must not self-enable Plaid production webhooks']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Plaid Sandbox privacy, provider-error sanitization, configuration-vs-exercise, and readiness-boundary safety checks passed.');
