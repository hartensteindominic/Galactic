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
  ['lib/banking.ts', "throw new BankingError(503, 'LIVE_WRITES_DISABLED'", 'banking fails closed when live writes are disabled'],
  ['lib/banking-auth.ts', 'createHmac', 'partner banking requires signed authentication'],
  ['lib/banking-auth.ts', "BANKING_AUTH_GATEWAY_SECRET", 'partner banking auth requires a server secret'],
  ['app/api/banking/transfers/route.ts', 'requireBankingUser', 'transfers require a banking user boundary'],
  ['app/api/banking/cards/freeze/route.ts', 'requireBankingUser', 'card freeze requires a banking user boundary'],
  ['app/banking-actions.tsx', 'Demo transfers never move real money.', 'client labels simulated transfers clearly']
];

const forbidden = [
  ['lib/licenses.ts', 'PRIVATE_KEY', 'licensing core must not read private keys'],
  ['lib/licenses.ts', 'sendTransaction', 'licensing core must not submit transactions'],
  ['lib/licenses.ts', 'eth_sendRawTransaction', 'licensing core must not submit raw transactions'],
  ['app/api/licenses/use/route.ts', 'PRIVATE_KEY', 'paid route must not read private keys'],
  ['app/api/licenses/use/route.ts', 'sendTransaction', 'paid route must not submit transactions'],
  ['app/banking-actions.tsx', 'BANKING_GATEWAY_API_KEY', 'banking provider API keys must never appear in client code'],
  ['app/banking-actions.tsx', 'BANKING_AUTH_GATEWAY_SECRET', 'banking auth secrets must never appear in client code'],
  ['app/banking-actions.tsx', 'CVV', 'client must not request or render CVV data'],
  ['app/banking-actions.tsx', 'PIN', 'client must not request or render PIN data']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Galactic Trust banking and x402 safety checks passed.');
