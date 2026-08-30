import fs from 'node:fs';

const adapter = fs.readFileSync('lib/gateway-banking-sandbox-adapter.ts', 'utf8');
const contract = fs.readFileSync('docs/sponsor-bank/PRIVATE-GATEWAY-OPENAPI.yaml', 'utf8');

const shared = [
  ['/v1/sandbox/customers', 'customer creation path'],
  ['/v1/sandbox/accounts', 'account creation path'],
  ['/v1/sandbox/ach-transfers', 'ACH creation path'],
  ['Idempotency-Key', 'provider write idempotency header'],
  ['currentBalanceCents', 'provider current-balance field'],
  ['availableBalanceCents', 'provider available-balance field'],
  ['customer.kyc.updated', 'KYC webhook event'],
  ['account.opened', 'account-opened webhook event'],
  ['ach.transfer.pending', 'pending ACH webhook event'],
  ['ach.transfer.posted', 'posted ACH webhook event'],
  ['ach.transfer.returned', 'returned ACH webhook event'],
  ['ach.transfer.failed', 'failed ACH webhook event']
];

for (const [text, label] of shared) {
  if (!adapter.includes(text)) throw new Error(`Private gateway contract drift: adapter is missing ${label}`);
  if (!contract.includes(text)) throw new Error(`Private gateway contract drift: OpenAPI is missing ${label}`);
}

const contractOnly = [
  ['X-Galactic-Program-Id', 'program identifier header'],
  ['x-galactic-webhook-timestamp', 'webhook timestamp header'],
  ['x-galactic-webhook-signature', 'webhook signature header'],
  ['x-galactic-webhook-event-id', 'optional webhook event-ID header'],
  ['HMAC-SHA256', 'webhook HMAC algorithm'],
  ['five-minute replay window', 'webhook replay-window documentation'],
  ['sandbox-gateway.example.invalid', 'non-routable placeholder server']
];

for (const [text, label] of contractOnly) {
  if (!contract.includes(text)) throw new Error(`Private gateway contract drift: OpenAPI is missing ${label}`);
}

const adapterOnly = [
  ["headers.set('X-Galactic-Program-Id'", 'program ID header implementation'],
  ["headers: { 'Idempotency-Key'", 'idempotency header implementation'],
  ["update(`${envelope.timestamp}.${envelope.rawBody}`)", 'exact timestamp/raw-body HMAC input'],
  ['timingSafeEqual', 'timing-safe webhook signature comparison'],
  ['5 * 60_000', 'five-minute webhook replay enforcement'],
  ['/balance', 'account-balance retrieval implementation']
];

for (const [text, label] of adapterOnly) {
  if (!adapter.includes(text)) throw new Error(`Private gateway contract drift: adapter is missing ${label}`);
}

const forbiddenContract = [
  ['BANKING_SANDBOX_API_KEY', 'OpenAPI must not contain Galactic environment variable names for secrets'],
  ['BANKING_SANDBOX_WEBHOOK_SECRET', 'OpenAPI must not expose webhook secret configuration names'],
  ['BANKING_SANDBOX_OPERATOR_SECRET', 'OpenAPI must not expose operator secret configuration names'],
  ['BANKING_SANDBOX_DATABASE_URL', 'OpenAPI must not expose database configuration'],
  ['https://api.', 'OpenAPI must not accidentally identify a production provider API host']
];

for (const [text, label] of forbiddenContract) {
  if (contract.includes(text)) throw new Error(`Private gateway contract drift: ${label}`);
}

console.log('Galactic Trust private provider-sandbox gateway OpenAPI and adapter contract are aligned.');
