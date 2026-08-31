import fs from 'node:fs';

const required = [
  ['lib/banking.ts', "process.env.BANKING_MODE === 'partner' ? 'partner' : 'demo'", 'banking must default to demo unless partner mode is explicit'],
  ['lib/banking.ts', "process.env.BANKING_ENABLE_LIVE_WRITES === 'true'", 'live banking writes must require an explicit enable flag'],
  ['lib/banking.ts', "process.env.BANKING_EMERGENCY_FREEZE !== 'false'", 'emergency money-movement freeze must fail closed by default'],
  ['lib/banking.ts', "'LIVE_WRITES_DISABLED'", 'live writes must fail closed until explicitly enabled'],
  ['lib/banking.ts', "'MONEY_MOVEMENT_FROZEN'", 'money movement must fail closed while emergency freeze is active'],
  ['lib/banking.ts', '{ allowDuringEmergencyFreeze: true }', 'protective card actions may remain available during emergency freeze'],
  ['lib/banking.ts', "'IDEMPOTENCY_REQUIRED'", 'live transfers must require idempotency'],
  ['scripts/banking-runtime-check.mjs', 'Banking live-write and emergency-freeze runtime behavior checks passed.', 'banking fail-closed controls must have executable runtime coverage'],
  ['package.json', 'scripts/banking-runtime-check.mjs', 'banking runtime coverage must run in the CI safety suite']
];

const forbidden = [
  ['lib/banking.ts', "process.env.BANKING_ENABLE_LIVE_WRITES !== 'false'", 'live writes must never default to enabled'],
  ['lib/banking.ts', "process.env.BANKING_EMERGENCY_FREEZE === 'true'", 'emergency freeze must not require an opt-in true flag'],
  ['lib/prototype-readiness.ts', 'readyForLiveBanking: true', 'prototype readiness must not claim live banking readiness']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Banking live-write, emergency-freeze, protective-action, and runtime-coverage safety checks passed.');
