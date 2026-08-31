import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync('lib/prototype-evidence-freshness.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'prototype-evidence-freshness.ts'
}).outputText;

const moduleShim = { exports: {} };
vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  console,
  Date,
  Number,
  Math,
  require(specifier) {
    throw new Error(`Unexpected evidence-freshness runtime import: ${specifier}`);
  }
}, { filename: 'prototype-evidence-freshness.runtime.cjs' });

const {
  evaluatePrototypeEvidenceFreshness,
  prototypeEvidenceFreshnessControlStatus
} = moduleShim.exports;

const now = Date.parse('2026-08-30T16:00:00.000Z');

let result = evaluatePrototypeEvidenceFreshness([], now);
assert.equal(result.state, 'none');
assert.equal(result.evidencePresent, false);
assert.equal(result.latestObservedAt, null);
assert.equal(result.ageMs, null);
assert.equal(result.continuousMonitoringVerified, false);
assert.equal(result.productionHealthVerified, false);
assert.equal(result.providerStatementReconciliationVerified, false);
assert.match(result.disclosure, /does not imply a healthy or unhealthy production system/i);

result = evaluatePrototypeEvidenceFreshness([
  '2026-08-30T15:30:00.000Z',
  '2026-08-30T14:00:00.000Z'
], now);
assert.equal(result.state, 'recent-evidence');
assert.equal(result.evidencePresent, true);
assert.equal(result.latestObservedAt, '2026-08-30T15:30:00.000Z');
assert.equal(result.ageMs, 30 * 60 * 1000);
assert.match(result.disclosure, /Recency does not prove continuous monitoring/i);

result = evaluatePrototypeEvidenceFreshness(['2026-08-29T15:59:59.000Z'], now);
assert.equal(result.state, 'stale-evidence');
assert.ok(result.ageMs > 24 * 60 * 60 * 1000);
assert.match(result.disclosure, /evidence-age signal/i);

result = evaluatePrototypeEvidenceFreshness(['not-a-date'], now);
assert.equal(result.state, 'invalid-evidence');
assert.equal(result.evidencePresent, true);
assert.equal(result.latestObservedAt, null);
assert.equal(result.ageMs, null);
assert.match(result.disclosure, /freshness as unknown/i);

result = evaluatePrototypeEvidenceFreshness(['2026-08-30T16:04:59.000Z'], now);
assert.equal(result.state, 'recent-evidence');
assert.equal(result.ageMs, 0, 'small future clock skew inside tolerance should not create negative age');

result = evaluatePrototypeEvidenceFreshness(['2026-08-30T16:05:01.000Z'], now);
assert.equal(result.state, 'future-evidence');
assert.equal(result.ageMs, null);
assert.match(result.disclosure, /clock\/data integrity/i);

const controls = prototypeEvidenceFreshnessControlStatus();
assert.equal(controls.modelImplemented, true);
assert.equal(controls.recentWindowHours, 24);
assert.equal(controls.futureClockToleranceMinutes, 5);
assert.equal(controls.invalidTimestampFailsUnknown, true);
assert.equal(controls.futureTimestampFailsUnknown, true);
assert.equal(controls.recencyIsNotHealth, true);
assert.equal(controls.continuousMonitoringVerified, false);
assert.equal(controls.productionHealthVerified, false);
assert.equal(controls.providerStatementReconciliationVerified, false);

console.log('Prototype evidence freshness runtime behavior checks passed.');
