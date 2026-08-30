import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync('lib/prototype-bill-guard.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'prototype-bill-guard.ts'
}).outputText;

const moduleShim = { exports: {} };
const sandbox = {
  module: moduleShim,
  exports: moduleShim.exports,
  console,
  Date
};
vm.runInNewContext(transpiled, sandbox, { filename: 'prototype-bill-guard.runtime.cjs' });

const { buildPrototypeBillGuard, billGuardControlStatus } = moduleShim.exports;
assert.equal(typeof buildPrototypeBillGuard, 'function');
assert.equal(typeof billGuardControlStatus, 'function');

const coveredForecast = {
  source: 'memory',
  tenantKey: 'galactic-trust',
  userId: 'demo-nova',
  asOf: '2026-08-30T12:00:00.000Z',
  currentBalanceCents: 200000,
  reserveCents: 50000,
  conservativeSpendableEstimateCents: 100000,
  horizons: [
    { days: 7, expectedIncomeCents: 100000, expectedBillsCents: 50000, plannedSavingsCents: 10000, projectedBalanceCents: 240000, spendableAfterReserveCents: 190000, status: 'comfortable' },
    { days: 14, expectedIncomeCents: 100000, expectedBillsCents: 70000, plannedSavingsCents: 10000, projectedBalanceCents: 220000, spendableAfterReserveCents: 170000, status: 'comfortable' },
    { days: 30, expectedIncomeCents: 100000, expectedBillsCents: 100000, plannedSavingsCents: 20000, projectedBalanceCents: 180000, spendableAfterReserveCents: 130000, status: 'comfortable' }
  ],
  upcoming: [
    { id: 'bill-1', kind: 'bill', name: 'Rent', amountCents: 50000, scheduledFor: '2026-09-02', confidence: 'scheduled', recurring: true },
    { id: 'bill-2', kind: 'bill', name: 'Phone', amountCents: 20000, scheduledFor: '2026-09-10', confidence: 'scheduled', recurring: true },
    { id: 'bill-3', kind: 'bill', name: 'Utilities', amountCents: 30000, scheduledFor: '2026-09-20', confidence: 'estimated', recurring: true },
    { id: 'income-1', kind: 'income', name: 'Payroll', amountCents: 100000, scheduledFor: '2026-09-05', confidence: 'scheduled', recurring: true }
  ],
  savingsGoals: [],
  assumptions: [],
  disclosure: 'simulation'
};

const covered = buildPrototypeBillGuard(coveredForecast);
assert.equal(covered.planningOnly, true);
assert.equal(covered.automaticBillPayEnabled, false);
assert.equal(covered.fundsReservedOrMoved, false);
assert.equal(covered.liveBillProviderConnected, false);
assert.equal(covered.knownBillsNext30DaysCents, 100000);
assert.equal(covered.scheduledBillsNext30DaysCents, 70000);
assert.equal(covered.estimatedBillsNext30DaysCents, 30000);
assert.equal(covered.estimatedBillCount, 1);
assert.equal(covered.nextBill.name, 'Rent');
assert.equal(covered.allKnownBillsCoveredAcrossHorizons, true);
assert.equal(covered.lowestCoveragePercent, 100);
assert.equal(covered.horizons.find((horizon) => horizon.days === 30).status, 'covered');

const pressureForecast = {
  ...coveredForecast,
  currentBalanceCents: 40000,
  reserveCents: 30000,
  conservativeSpendableEstimateCents: 0,
  horizons: [
    { days: 7, expectedIncomeCents: 0, expectedBillsCents: 20000, plannedSavingsCents: 0, projectedBalanceCents: 20000, spendableAfterReserveCents: 0, status: 'tight' },
    { days: 14, expectedIncomeCents: 0, expectedBillsCents: 20000, plannedSavingsCents: 0, projectedBalanceCents: 20000, spendableAfterReserveCents: 0, status: 'tight' },
    { days: 30, expectedIncomeCents: 0, expectedBillsCents: 20000, plannedSavingsCents: 0, projectedBalanceCents: 20000, spendableAfterReserveCents: 0, status: 'tight' }
  ],
  upcoming: [
    { id: 'bill-pressure', kind: 'bill', name: 'Insurance', amountCents: 20000, scheduledFor: '2026-09-02', confidence: 'scheduled', recurring: true }
  ]
};

const pressure = buildPrototypeBillGuard(pressureForecast);
const sevenDayPressure = pressure.horizons.find((horizon) => horizon.days === 7);
assert.equal(sevenDayPressure.availableForBillsCents, 10000);
assert.equal(sevenDayPressure.uncoveredBillsCents, 10000);
assert.equal(sevenDayPressure.coveragePercent, 50);
assert.equal(sevenDayPressure.cashAfterBillsSavingsAndReserveCents, -10000);
assert.equal(sevenDayPressure.status, 'tight');
assert.equal(pressure.allKnownBillsCoveredAcrossHorizons, false);
assert.equal(pressure.lowestCoveragePercent, 50);

const controls = billGuardControlStatus();
assert.equal(controls.planningLayerImplemented, true);
assert.equal(controls.usesCashflowForecastSource, true);
assert.equal(controls.automaticBillPayEnabled, false);
assert.equal(controls.fundsReservedOrMoved, false);
assert.equal(controls.liveBillProviderConnected, false);
assert.equal(controls.productionBillPaymentControlsVerified, false);

console.log('Bill Guard runtime behavior checks passed.');
