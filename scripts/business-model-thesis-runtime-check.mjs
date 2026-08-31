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
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: file
  }).outputText;
}

const thesisModule = { exports: {} };
vm.runInNewContext(transpile('lib/business-model-thesis.ts'), {
  module: thesisModule,
  exports: thesisModule.exports,
  console,
  require(specifier) {
    if (specifier === './banking') return { BankingError };
    throw new Error(`Unexpected business thesis runtime import: ${specifier}`);
  }
}, { filename: 'business-model-thesis.runtime.cjs' });

const { evaluateBusinessModelThesis, businessModelThesisControlStatus } = thesisModule.exports;

const draft = {
  targetCustomerSegment: 'Independent digital creators with irregular monthly income',
  painfulFinancialProblem: 'They struggle to plan bills and cash reserves around volatile payout timing',
  differentiatedMechanism: 'A creator-aware cash-flow planning and account experience tied to verified payout patterns',
  distributionAdvantage: 'Embedded distribution through creator platforms and professional creator communities',
  primaryRevenueBeyondInterchange: 'Paid workflow and financial-operations software for creators and partner platforms',
  evidencePlan: 'Interview target users, measure willingness to pay, run design-partner pilots, and source all cost assumptions from actual provider quotes'
};

const result = evaluateBusinessModelThesis(draft);
assert.equal(result.structurallyCompleteDraft, true);
assert.match(result.thesisStatement, /Independent digital creators/);
assert.match(result.thesisStatement, /Paid workflow and financial-operations software/);
assert.equal(result.validation.customerSegmentValidated, false);
assert.equal(result.validation.painfulProblemValidated, false);
assert.equal(result.validation.mechanismValidated, false);
assert.equal(result.validation.distributionAdvantageValidated, false);
assert.equal(result.validation.revenueModelValidated, false);
assert.equal(result.validation.evidencePlanExecuted, false);
assert.equal(result.validation.marketValidated, false);
assert.equal(result.readiness.approvedForPublicClaim, false);
assert.equal(result.readiness.approvedForInvestorForecast, false);
assert.equal(result.readiness.approvedForSponsorDiligence, false);
assert.equal(result.readiness.approvedForCharterBusinessPlan, false);
assert.match(result.disclosure, /checks only whether the strategy draft/i);
assert.match(result.disclosure, /does not validate customer demand/i);

for (const field of Object.keys(draft)) {
  assert.throws(
    () => evaluateBusinessModelThesis({ ...draft, [field]: 'too short' }),
    (error) => error instanceof BankingError && error.status === 400 && error.code === 'INCOMPLETE_BUSINESS_MODEL_THESIS'
  );
}

assert.throws(
  () => evaluateBusinessModelThesis({ ...draft, evidencePlan: 'x'.repeat(701) }),
  (error) => error instanceof BankingError && error.code === 'INCOMPLETE_BUSINESS_MODEL_THESIS'
);

const normalized = evaluateBusinessModelThesis({
  ...draft,
  targetCustomerSegment: '   Independent   digital   creators with irregular monthly income   '
});
assert.equal(normalized.fields.targetCustomerSegment, 'Independent digital creators with irregular monthly income');

const controls = businessModelThesisControlStatus();
assert.equal(controls.structuredWorkbenchImplemented, true);
assert.equal(controls.requiresSpecificCustomerProblemMechanismDistributionRevenueAndEvidencePlan, true);
assert.equal(controls.shipsWithDefaultTargetCustomer, false);
assert.equal(controls.shipsWithDefaultRevenueModel, false);
assert.equal(controls.marketValidationAutomated, false);
assert.equal(controls.customerSegmentValidated, false);
assert.equal(controls.painfulProblemValidated, false);
assert.equal(controls.distributionAdvantageValidated, false);
assert.equal(controls.primaryRevenueBeyondInterchangeValidated, false);
assert.equal(controls.evidencePlanExecuted, false);
assert.equal(controls.approvedForPublicClaim, false);
assert.equal(controls.approvedForInvestorForecast, false);
assert.equal(controls.approvedForSponsorDiligence, false);
assert.equal(controls.approvedForCharterBusinessPlan, false);

console.log('Business-model thesis structural-completeness, normalization, no-default, and validation-boundary runtime checks passed.');
