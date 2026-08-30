import fs from 'node:fs';

const required = [
  ['lib/licenses.ts', "LICENSE_KIND = 'single-machine-use-v1'", 'single-use license kind'],
  ['lib/licenses.ts', 'units: 1', 'exactly one license unit'],
  ['lib/licenses.ts', 'modelTrainingAllowed: false', 'no model-training rights'],
  ['lib/licenses.ts', 'ownershipTransferred: false', 'no NFT ownership transfer'],
  ['lib/licenses.ts', 'A new x402 license payment is required for each additional machine-use unit.', 'repeat use requires payment'],
  ['app/api/licenses/use/route.ts', 'withX402(handler', 'paid endpoint uses x402'],
  ['app/api/licenses/catalog/route.ts', 'listLicensableAssets', 'catalog uses licensable assets'],
  ['app/api/paylink/route.ts', 'baseUsdcPaymentUri', 'paylink exposes direct payment URI'],
  ['paylink.json', '0x02f93c7547309ca50EEAB446DaEBE8ce8E694cBb', 'static paylink uses receiver wallet'],
  ['app/api/agent/manifest/route.ts', 'paidMachineUseLicense', 'manifest exposes paid endpoint'],
  ['app/api/agent/openapi/route.ts', "'/api/licenses/use'", 'OpenAPI exposes paid endpoint'],
  ['lib/banking.ts', "process.env.BANKING_MODE === 'partner' ? 'partner' : 'demo'", 'banking defaults to demo unless partner is explicit'],
  ['lib/banking.ts', "process.env.BANKING_ENABLE_LIVE_WRITES === 'true'", 'live banking writes require an explicit server flag'],
  ['lib/banking.ts', "process.env.BANKING_EMERGENCY_FREEZE !== 'false'", 'banking emergency freeze defaults to active'],
  ['lib/banking.ts', "throw new BankingError(503, 'LIVE_WRITES_DISABLED'", 'banking fails closed when live writes are disabled'],
  ['lib/banking.ts', "throw new BankingError(503, 'MONEY_MOVEMENT_FROZEN'", 'banking blocks money movement while the emergency freeze is active'],
  ['lib/banking.ts', '{ allowDuringEmergencyFreeze: true }', 'protective card freeze can remain available during a money-movement freeze'],
  ['lib/banking-auth.ts', 'createHmac', 'partner banking requires signed authentication'],
  ['lib/banking-auth.ts', 'BANKING_AUTH_GATEWAY_SECRET', 'partner banking auth requires a server secret'],
  ['app/api/banking/transfers/route.ts', 'requireBankingUser', 'transfers require a banking user boundary'],
  ['app/api/banking/transfers/route.ts', 'requireTrustedOrigin', 'transfers reject untrusted browser origins'],
  ['app/api/banking/cards/freeze/route.ts', 'requireBankingUser', 'card freeze requires a banking user boundary'],
  ['app/api/banking/cards/freeze/route.ts', 'requireTrustedOrigin', 'card freeze rejects untrusted browser origins'],
  ['app/banking-actions.tsx', 'Demo transfers never move real money.', 'client labels simulated transfers clearly'],
  ['app/page.tsx', 'ONLINE BANKING EXPERIENCE · DEMO', 'main dashboard must identify the product as an online banking experience and demo'],
  ['app/page.tsx', 'Your online banking dashboard for accounts, transfers, cards, bills, savings, and money insights.', 'main dashboard must explain online banking in plain English'],
  ['app/page.tsx', 'Real banking and crypto remain off until approved providers are configured.', 'main dashboard must preserve the live-money approval boundary'],
  ['app/page.tsx', 'Demo balances and trades are simulated.', 'main dashboard must visibly preserve simulation disclosure'],
  ['lib/crypto.ts', "process.env.CRYPTO_MODE === 'partner' ? 'partner' : 'demo'", 'crypto defaults to demo unless partner is explicit'],
  ['lib/crypto.ts', "process.env.CRYPTO_ENABLE_LIVE_TRADING === 'true'", 'live crypto trading requires an explicit server flag'],
  ['lib/crypto.ts', "throw new BankingError(503, 'CRYPTO_LIVE_TRADING_DISABLED'", 'crypto fails closed when live trading is disabled'],
  ['app/api/crypto/orders/route.ts', 'requireBankingUser', 'crypto orders require a banking user boundary'],
  ['app/api/crypto/orders/route.ts', 'requireTrustedOrigin', 'crypto orders reject untrusted browser origins'],
  ['app/crypto-trading.tsx', 'No guaranteed returns.', 'crypto UI avoids guaranteed return claims'],
  ['app/api/assistant/route.ts', 'RATE_LIMITED', 'assistant endpoint has a rate limit'],
  ['lib/assistant.ts', 'Never share passwords, PINs, CVVs, recovery codes, or one-time codes in chat.', 'assistant warns against sharing authentication secrets'],
  ['next.config.mjs', "frame-ancestors 'none'", 'content security policy blocks framing'],
  ['next.config.mjs', 'Permissions-Policy', 'browser permissions are restricted'],
  ['next.config.mjs', 'X-Content-Type-Options', 'MIME sniffing protection is enabled'],
  ['lib/prototype-ledger.ts', 'liveMoneyEnabled: false', 'prototype ledger permanently reports live money disabled'],
  ['supabase/migrations/001_white_label_prototype.sql', 'Prototype transfer function cannot touch non-simulated accounts.', 'prototype transfers reject non-simulated accounts'],
  ['supabase/migrations/002_operations_reconciliation.sql', 'Prototype reconciliation cannot inspect non-simulated accounts.', 'prototype reconciliation rejects non-simulated accounts'],
  ['lib/prototype-operations.ts', 'realProviderWebhooksEnabled: false', 'prototype operations do not claim production provider webhooks'],
  ['lib/prototype-operations.ts', 'liveMoneyEnabled: false', 'prototype operations keep live money disabled'],
  ['app/api/prototype/reconcile/route.ts', 'requireTrustedOrigin', 'prototype reconciliation rejects untrusted browser origins'],
  ['app/api/prototype/webhooks/sandbox/route.ts', 'verifyPrototypeWebhookSecret', 'sandbox webhook inbox requires server-side authentication'],
  ['app/api/prototype/webhooks/sandbox/route.ts', 'simulationOnly: true', 'sandbox webhook response is explicitly simulation-only'],
  ['app/prototype/operations/operations-console.tsx', 'Real banking rails remain off.', 'operations UI labels live banking rails as disabled'],
  ['supabase/migrations/003_transfer_idempotency.sql', 'Duplicate simulated transfer request safely replayed. No second debit occurred.', 'database replays duplicate prototype transfers without a second debit'],
  ['supabase/migrations/003_transfer_idempotency.sql', 'fintech_transactions_provider_reference_unique', 'persistent prototype transfer references are unique'],
  ['app/api/prototype/transfers/route.ts', "request.headers.get('idempotency-key')", 'prototype transfer API accepts an idempotency key'],
  ['app/prototype/prototype-network-guard.tsx', "headers.set('Idempotency-Key', crypto.randomUUID())", 'prototype client attaches idempotency keys to transfer requests']
];

const forbidden = [
  ['lib/licenses.ts', 'PRIVATE_KEY', 'licensing core must not read private keys'],
  ['lib/licenses.ts', 'sendTransaction', 'licensing core must not submit transactions'],
  ['lib/licenses.ts', 'eth_sendRawTransaction', 'licensing core must not submit raw transactions'],
  ['app/api/licenses/use/route.ts', 'PRIVATE_KEY', 'paid route must not read private keys'],
  ['app/api/licenses/use/route.ts', 'sendTransaction', 'paid route must not submit transactions'],
  ['app/banking-actions.tsx', 'BANKING_GATEWAY_API_KEY', 'banking provider API keys must never appear in client code'],
  ['app/banking-actions.tsx', 'BANKING_AUTH_GATEWAY_SECRET', 'banking auth secrets must never appear in client code'],
  ['app/banking-actions.tsx', 'BANKING_EMERGENCY_FREEZE', 'banking emergency controls must never appear in client code'],
  ['app/banking-actions.tsx', 'name="cvv"', 'client must not collect CVV data'],
  ['app/banking-actions.tsx', 'name="pin"', 'client must not collect PIN data'],
  ['app/page.tsx', 'Member FDIC', 'main demo must not claim FDIC membership without an approved program'],
  ['app/page.tsx', 'FDIC insured', 'main demo must not claim deposit insurance without approved program language'],
  ['app/page.tsx', 'fully compliant', 'main demo must not self-certify legal compliance'],
  ['app/page.tsx', 'guaranteed secure', 'main demo must not make absolute security guarantees'],
  ['app/crypto-trading.tsx', 'CRYPTO_GATEWAY_API_KEY', 'crypto provider API keys must never appear in client code'],
  ['app/crypto-trading.tsx', 'CRYPTO_PROGRAM_ID', 'crypto provider program identifiers must remain server-side'],
  ['app/galactic-chat.tsx', 'BANKING_GATEWAY_API_KEY', 'chat must never contain banking provider credentials'],
  ['app/galactic-chat.tsx', 'CRYPTO_GATEWAY_API_KEY', 'chat must never contain crypto provider credentials'],
  ['app/prototype/prototype-dashboard.tsx', 'SUPABASE_SECRET_KEY', 'Supabase secret must never appear in prototype client code'],
  ['app/prototype/prototype-dashboard.tsx', 'SUPABASE_SERVICE_ROLE_KEY', 'Supabase service role key must never appear in prototype client code'],
  ['app/prototype/prototype-dashboard.tsx', 'PLAID_SECRET', 'Plaid secret must never appear in prototype client code'],
  ['app/prototype/prototype-dashboard.tsx', 'PROTOTYPE_WEBHOOK_SECRET', 'prototype webhook secret must never appear in client code'],
  ['app/prototype/operations/operations-console.tsx', 'SUPABASE_SECRET_KEY', 'Supabase secret must never appear in operations client code'],
  ['app/prototype/operations/operations-console.tsx', 'PLAID_SECRET', 'Plaid secret must never appear in operations client code'],
  ['app/prototype/operations/operations-console.tsx', 'PROTOTYPE_WEBHOOK_SECRET', 'webhook secret must never appear in operations client code'],
  ['app/prototype/prototype-network-guard.tsx', 'SUPABASE_SECRET_KEY', 'network guard must never contain Supabase secrets'],
  ['app/prototype/prototype-network-guard.tsx', 'PLAID_SECRET', 'network guard must never contain Plaid secrets'],
  ['app/prototype/prototype-network-guard.tsx', 'PROTOTYPE_WEBHOOK_SECRET', 'network guard must never contain webhook secrets']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Galactic Trust banking, emergency-freeze, crypto, assistant, privacy, prototype operations, idempotency, positioning and x402 safety checks passed.');
