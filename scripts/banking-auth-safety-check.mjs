import fs from 'node:fs';

const required = [
  ['lib/banking-auth.ts', "process.env.BANKING_MODE === 'partner' ? 'partner' : 'demo'", 'banking auth must default to demo unless partner mode is explicit'],
  ['lib/banking-auth.ts', 'BANKING_AUTH_GATEWAY_SECRET', 'partner banking auth must require a server-side gateway secret'],
  ['lib/banking-auth.ts', "'AUTH_NOT_CONFIGURED'", 'partner auth without server configuration must fail closed'],
  ['lib/banking-auth.ts', "'AUTH_REQUIRED'", 'missing signed session headers must fail closed'],
  ['lib/banking-auth.ts', "'EXPIRED_AUTH'", 'stale/future signed auth must fail closed'],
  ['lib/banking-auth.ts', "createHmac('sha256'", 'banking auth must use an HMAC signature'],
  ['lib/banking-auth.ts', 'timingSafeEqual', 'banking auth signature comparison must remain timing-safe'],
  ['lib/banking-auth.ts', '5 * 60 * 1000', 'banking auth freshness window must remain explicit'],
  ['scripts/banking-auth-runtime-check.mjs', 'Signed banking authentication runtime behavior checks passed.', 'signed banking auth must have executable runtime coverage'],
  ['package.json', 'scripts/banking-auth-runtime-check.mjs', 'signed banking auth runtime coverage must run in the CI safety suite'],
  ['app/api/banking/transfers/route.ts', 'requireBankingUser', 'live transfer route must enforce the banking user boundary'],
  ['app/api/banking/cards/freeze/route.ts', 'requireBankingUser', 'card-freeze route must enforce the banking user boundary']
];

const forbidden = [
  ['app/banking-actions.tsx', 'BANKING_AUTH_GATEWAY_SECRET', 'banking auth secret must never appear in client code'],
  ['app/api/banking/transfers/route.ts', 'BANKING_AUTH_GATEWAY_SECRET', 'banking routes must use the shared auth verifier rather than reading its secret directly'],
  ['app/api/banking/cards/freeze/route.ts', 'BANKING_AUTH_GATEWAY_SECRET', 'banking routes must use the shared auth verifier rather than reading its secret directly']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Signed banking authentication configuration, freshness, HMAC, and route-boundary safety checks passed.');
