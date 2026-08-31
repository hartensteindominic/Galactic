import fs from 'node:fs';

const required = [
  ['lib/prototype-cashflow.ts', 'conservativeSpendableEstimateCents', 'cash-flow engine must expose a conservative spendable estimate'],
  ['lib/prototype-cashflow.ts', 'This is a planning estimate, not a guarantee that spending the displayed amount is safe.', 'cash-flow engine must disclose forecast uncertainty'],
  ['lib/prototype-cashflow.ts', "kind: 'income' | 'bill' | 'planned_savings'", 'forecast must distinguish income, bills, and planned savings'],
  ['app/prototype/cashflow/cashflow-console.tsx', 'Simulation only', 'cash-flow UI must label simulation mode'],
  ['app/prototype/cashflow/cashflow-console.tsx', 'Why this number can change', 'cash-flow UI must explain forecast limitations'],
  ['lib/prototype-bill-guard.ts', 'planningOnly: true', 'Bill Guard must identify itself as a planning layer'],
  ['lib/prototype-bill-guard.ts', 'automaticBillPayEnabled: false', 'Bill Guard must keep autopay disabled'],
  ['lib/prototype-bill-guard.ts', 'fundsReservedOrMoved: false', 'Bill Guard must not claim funds are reserved or moved'],
  ['lib/prototype-bill-guard.ts', 'liveBillProviderConnected: false', 'Bill Guard must keep live bill providers disconnected'],
  ['lib/prototype-bill-guard.ts', 'unknown obligations are not included', 'Bill Guard must disclose unknown-obligation risk'],
  ['lib/prototype-bill-guard.ts', 'does not reserve money, pay bills, enable autopay, guarantee bill coverage, prevent overdrafts, or authorize spending', 'Bill Guard must disclose planning-only limitations'],
  ['app/api/prototype/cashflow/route.ts', 'buildPrototypeBillGuard(forecast)', 'cash-flow API must derive Bill Guard from the same forecast source'],
  ['app/prototype/bill-guard/bill-guard-console.tsx', 'Planning only', 'Bill Guard UI must visibly label planning-only mode'],
  ['app/prototype/bill-guard/bill-guard-console.tsx', 'No funds moved', 'Bill Guard UI must state that funds are not moved'],
  ['app/prototype/bill-guard/bill-guard-console.tsx', 'Known does not mean complete.', 'Bill Guard UI must surface forecast incompleteness'],
  ['app/prototype/bill-guard/bill-guard-console.tsx', 'Autopay', 'Bill Guard UI must expose autopay status'],
  ['app/prototype/page.tsx', 'Bill Guard', 'prototype dock must expose Bill Guard'],
  ['scripts/bill-guard-runtime-check.mjs', 'Bill Guard runtime behavior checks passed.', 'Bill Guard runtime behavior must be exercised'],
  ['package.json', 'scripts/bill-guard-runtime-check.mjs', 'Bill Guard runtime behavior must run in CI safety checks'],
  ['supabase/migrations/005_cashflow_intelligence.sql', 'simulated boolean not null default true', 'cash-flow planning records must default to simulated'],
  ['.env.example', '005_cashflow_intelligence.sql', 'persistent setup template must include cash-flow migration 005'],
  ['lib/prototype-readiness.ts', 'requiredPrototypeMigrationCount: 5', 'readiness must report all five prototype migrations'],
  ['lib/prototype-readiness.ts', 'run migrations 001-005 in order', 'readiness next-step guidance must include migration 005']
];

const forbidden = [
  ['app/prototype/cashflow/cashflow-console.tsx', 'SUPABASE_SECRET_KEY', 'cash-flow client must not contain Supabase secrets'],
  ['app/prototype/cashflow/cashflow-console.tsx', 'SUPABASE_SERVICE_ROLE_KEY', 'cash-flow client must not contain Supabase service credentials'],
  ['app/prototype/cashflow/cashflow-console.tsx', 'PLAID_SECRET', 'cash-flow client must not contain Plaid secrets'],
  ['app/prototype/cashflow/cashflow-console.tsx', 'safe to spend guaranteed', 'cash-flow client must not make a guaranteed safe-spending claim'],
  ['app/prototype/cashflow/cashflow-console.tsx', 'financial advice', 'cash-flow client must not present planning output as financial advice'],
  ['lib/prototype-bill-guard.ts', 'automaticBillPayEnabled: true', 'Bill Guard must not enable autopay in the prototype'],
  ['lib/prototype-bill-guard.ts', 'fundsReservedOrMoved: true', 'Bill Guard must not claim prototype funds are reserved or moved'],
  ['lib/prototype-bill-guard.ts', 'liveBillProviderConnected: true', 'Bill Guard must not claim a live bill provider is connected'],
  ['app/prototype/bill-guard/bill-guard-console.tsx', 'SUPABASE_SECRET_KEY', 'Bill Guard client must not contain Supabase secrets'],
  ['app/prototype/bill-guard/bill-guard-console.tsx', 'PLAID_SECRET', 'Bill Guard client must not contain Plaid secrets'],
  ['app/prototype/bill-guard/bill-guard-console.tsx', 'bills are guaranteed', 'Bill Guard client must not guarantee bill coverage']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Cash-flow intelligence, Bill Guard, and persistent setup safety checks passed.');
