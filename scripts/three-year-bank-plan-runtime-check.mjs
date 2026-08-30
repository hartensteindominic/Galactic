import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

class BankingError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function transpile(file) {
  return ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file
  }).outputText;
}

const mod = { exports: {} };
vm.runInNewContext(transpile('lib/three-year-bank-plan.ts'), {
  module: mod,
  exports: mod.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected three-year plan runtime import: ${specifier}`);
  }
}, { filename: 'three-year-bank-plan.runtime.cjs' });

const { threeYearBankPlanStatus, evaluateThreeYearBankPlanCandidate } = mod.exports;
const status = threeYearBankPlanStatus();

assert.equal(status.planningSkeletonAvailable, true);
assert.equal(status.officialSourceCount, 3);
assert.equal(status.minimumPlanningHorizonYears, 3);
assert.equal(status.mustExtendThroughExpectedStableProfitabilityIfLonger, true);
assert.equal(status.containsDefaultRevenueAssumptions, false);
assert.equal(status.containsDefaultGrowthAssumptions, false);
assert.equal(status.containsDefaultDepositAssumptions, false);
assert.equal(status.containsDefaultCapitalRequirement, false);
assert.equal(status.containsDefaultProfitabilityDate, false);
assert.equal(status.requiredSectionCount, 12);
assert.equal(status.populatedSectionCount, 0);
assert.equal(status.validatedSectionCount, 0);
assert.equal(status.approvedSectionCount, 0);
assert.equal(status.boardApproved, false);
assert.equal(status.regulatorReviewed, false);
assert.equal(status.regulatorAccepted, false);
assert.equal(status.readyForCharterApplication, false);
assert.ok(status.sections.every((section) => section.populated === false));
assert.ok(status.sections.every((section) => section.validated === false));
assert.ok(status.sections.every((section) => section.approved === false));

const base = {
  planLabel: 'Future bank planning draft',
  proposedInstitutionRole: 'Proposed de novo institution under evaluation; no charter route approved',
  proposedCharterRoute: 'Unselected; requires qualified adviser and regulator pre-filing review',
  targetMarketAndCustomers: 'Evidence-backed target customer and market analysis would be referenced here.',
  businessAndRevenueModel: 'Revenue and expense mechanics would be evidence-backed and reconciled to detailed projections.',
  productsAndServices: 'Only products approved for the eventual charter/program would be included.',
  distributionAndMarketing: 'Distribution assumptions require measured evidence and approved marketing/disclosures.',
  managementAndGovernance: 'Proposed management, board, officers, responsibilities, succession, and governance evidence required.',
  recordsSystemsAndControls: 'Core systems, ledger, reconciliation, access, change, incident, security, and control evidence required.',
  riskAndComplianceFramework: 'Risk, BSA/AML, sanctions, consumer compliance, complaints, testing, audit, and ownership require applicable human review.',
  financialManagementApproach: 'Accounting, budgeting, reporting, balance-sheet management, loss assumptions, and controls require supporting schedules.',
  projectionMethodology: 'Projection schedules would use explicit sourced assumptions and reconcile across income, balance sheet, capital, and liquidity views.',
  projectionHorizonYears: 3,
  stableProfitabilityExpectedWithinHorizon: true,
  capitalAndLiquidityApproach: 'Proposal-specific capital, liquidity, funding, source-of-funds, and contingency evidence required; no universal number assumed.',
  thirdPartyAndContinuityApproach: 'Critical provider diligence, contracts, monitoring, concentration, continuity, and exit evidence required.',
  monitoringAndRevisionApproach: 'Board/management variance review, thresholds, change governance, and plan-revision controls required.',
  downsideAndSensitivityScenarios: 'Adverse growth, fraud/loss, cost, revenue, funding, provider, control, and profitability scenarios required.',
  evidenceReferences: ['private-model/reference-only', 'private-market-study/reference-only'],
  accountablePlanOwnerRole: 'future qualified human plan owner - unassigned',
  qualifiedReviewerRole: 'qualified bank regulatory/financial reviewer',
  reviewedAt: '2026-08-30'
};

const candidate = evaluateThreeYearBankPlanCandidate(base);
assert.equal(candidate.structurallyCompleteDraft, true);
assert.equal(candidate.projectionHorizonAtLeastThreeYears, true);
assert.equal(candidate.stableProfitabilityHorizonRequirementSatisfied, true);
assert.equal(candidate.marketEvidenceValidated, false);
assert.equal(candidate.managementQualificationsVerified, false);
assert.equal(candidate.financialProjectionAssumptionsValidated, false);
assert.equal(candidate.capitalAdequacyDetermined, false);
assert.equal(candidate.liquidityAdequacyDetermined, false);
assert.equal(candidate.boardApproved, false);
assert.equal(candidate.regulatorReviewed, false);
assert.equal(candidate.regulatorAccepted, false);
assert.equal(candidate.approvedForCharterApplication, false);
assert.equal(candidate.readinessPromotionAllowed, false);

const insufficientHorizon = evaluateThreeYearBankPlanCandidate({ ...base, stableProfitabilityExpectedWithinHorizon: false });
assert.equal(insufficientHorizon.structurallyCompleteDraft, true);
assert.equal(insufficientHorizon.stableProfitabilityHorizonRequirementSatisfied, false);
assert.equal(insufficientHorizon.approvedForCharterApplication, false);

assert.throws(
  () => evaluateThreeYearBankPlanCandidate({ ...base, projectionHorizonYears: 2 }),
  (error) => error instanceof BankingError && error.code === 'INVALID_BANK_PLAN_INPUT'
);
assert.throws(
  () => evaluateThreeYearBankPlanCandidate({ ...base, evidenceReferences: [] }),
  (error) => error instanceof BankingError && error.code === 'INVALID_BANK_PLAN_INPUT'
);

console.log('Three-year bank plan no-default, horizon, evidence, structural-only, and non-approval runtime checks passed.');
