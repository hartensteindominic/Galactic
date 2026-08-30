import fs from 'node:fs';

const required = [
  ['lib/prototype-cashflow.ts', 'conservativeSpendableEstimateCents', 'cash-flow engine must expose a conservative spendable estimate'],
  ['lib/prototype-cashflow.ts', 'This is a planning estimate, not a guarantee that spending the displayed amount is safe.', 'cash-flow engine must disclose forecast uncertainty'],
  ['lib/prototype-cashflow.ts', "kind: 'income' | 'bill' | 'planned_savings'", 'forecast must distinguish income, bills, and planned savings'],
  ['app/prototype/cashflow/cashflow-console.tsx', 'Simulation only', 'cash-flow UI must label simulation mode'],
  ['app/prototype/cashflow/cashflow-console.tsx', 'Why this number can change', 'cash-flow UI must explain forecast limitations'],
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
  ['app/prototype/cashflow/cashflow-console.tsx', 'financial advice', 'cash-flow client must not present planning output as financial advice']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Cash-flow intelligence and persistent setup safety checks passed.');
