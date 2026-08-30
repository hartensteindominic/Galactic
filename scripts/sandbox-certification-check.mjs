import fs from 'node:fs';

const certification = fs.readFileSync('lib/sandbox-certification.ts', 'utf8');
const route = fs.readFileSync('app/api/banking/sandbox-certification/route.ts', 'utf8');
const page = fs.readFileSync('app/sandbox-readiness/page.tsx', 'utf8');
const client = fs.readFileSync('app/sandbox-readiness/sandbox-certification-client.tsx', 'utf8');
const adapter = fs.readFileSync('lib/banking-provider-adapter.ts', 'utf8');

const required = [
  [certification, "banking.mode === 'demo' && !banking.liveWritesEnabled", 'certification must require demo mode with live writes disabled'],
  [certification, 'externalNetworkCallsAllowed: false', 'certification must declare external provider network calls prohibited'],
  [certification, 'providerCredentialsAllowed: false', 'certification must declare provider credentials prohibited'],
  [certification, 'realMoneyAllowed: false', 'certification must declare real money prohibited'],
  [certification, 'createHmac', 'certification must sign and verify its synthetic webhook'],
  [certification, 'timingSafeEqual', 'webhook signature comparison must be timing-safe'],
  [certification, 'processedEventIds.has(event.id)', 'certification must deduplicate provider events'],
  [certification, 'partner_settlement_cash', 'certification must create settlement-side ledger evidence'],
  [certification, 'customer_deposit_liability', 'certification must create customer-liability ledger evidence'],
  [certification, 'totalDebitsCents === totalCreditsCents', 'certification must prove balanced double-entry ledger totals'],
  [certification, 'reconciliationMatched', 'certification must expose reconciliation evidence'],
  [certification, 'realMoneyMoved: false', 'certification must prove no real money moved'],
  [certification, 'providerCredentialsUsed: false', 'certification must prove no provider credentials were used'],
  [certification, 'externalNetworkCalled: false', 'certification must prove no external banking network was called'],
  [route, 'requireJsonRequest', 'certification POST must require JSON'],
  [route, 'requireTrustedOrigin', 'certification POST must reject untrusted browser origins'],
  [route, 'requireBankingUser', 'certification POST must enforce the banking user boundary'],
  [adapter, 'BankingProviderAdapter', 'provider-neutral adapter boundary must exist'],
  [adapter, 'signedWebhooks', 'provider adapter capabilities must include signed webhooks'],
  [adapter, 'idempotency', 'provider adapter capabilities must include idempotency'],
  [adapter, 'reconciliationData', 'provider adapter capabilities must include reconciliation data'],
  [page, 'Prove the banking loop before connecting a bank.', 'review page must explain the pre-provider certification purpose'],
  [page, 'Hard isolation from production', 'review page must state production isolation'],
  [client, 'No real money moved', 'review UI must display zero-money evidence'],
  [client, 'Duplicate webhook rejected', 'review UI must display dedupe evidence'],
  [client, 'Reconciliation matched', 'review UI must display reconciliation evidence']
];

const forbidden = [
  [certification, 'fetch(', 'synthetic certification engine must never make an external network call'],
  [certification, 'process.env', 'synthetic certification engine must never read provider/environment secrets'],
  [certification, 'BANKING_GATEWAY_API_KEY', 'synthetic certification must never read banking provider credentials'],
  [certification, 'CRYPTO_GATEWAY_API_KEY', 'synthetic certification must never read crypto provider credentials'],
  [certification, 'PRIVATE_KEY', 'synthetic certification must never read private keys'],
  [client, 'BANKING_GATEWAY_API_KEY', 'client certification UI must never expose banking credentials'],
  [client, 'BANKING_AUTH_GATEWAY_SECRET', 'client certification UI must never expose banking auth secrets']
];

for (const [source, text, label] of required) {
  if (!source.includes(text)) throw new Error(`Sandbox certification safety regression: ${label}`);
}

for (const [source, text, label] of forbidden) {
  if (source.includes(text)) throw new Error(`Sandbox certification safety regression: ${label}`);
}

console.log('Galactic Trust zero-money sandbox certification safety checks passed.');
