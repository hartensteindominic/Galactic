import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function transpile(file) {
  return ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022
    },
    fileName: file
  }).outputText;
}

const charterModule = { exports: {} };
vm.runInNewContext(transpile('lib/charter-readiness.ts'), {
  module: charterModule,
  exports: charterModule.exports,
  console
}, { filename: 'charter-readiness.runtime.cjs' });

const { charterReadinessStatus } = charterModule.exports;
const status = charterReadinessStatus();

assert.equal(status.longTermGoal, 'future-chartered-bank');
assert.equal(status.currentPhase, 'fintech-proof');
assert.equal(status.currentOperatingPosture, 'simulation-only-fintech-prototype');
assert.equal(status.roadmapDocumented, true);
assert.equal(status.currentSoftwareCanSelfApproveCharter, false);

const externalApprovalFields = [
  'charterRouteSelected',
  'deNovoVsAcquisitionRouteSelected',
  'nationalBankCharterSelected',
  'stateBankCharterSelected',
  'federalSavingsAssociationSelected',
  'bankHoldingCompanyStructureSelected',
  'regulatorPreFilingEngagementComplete',
  'organizingGroupFormed',
  'proposedBankBoardQualified',
  'proposedExecutiveManagementQualified',
  'regulatorReadyThreeYearBusinessPlanApproved',
  'regulatorReviewedCapitalPlanApproved',
  'committedOpeningCapitalVerified',
  'bankLevelRiskManagementOperating',
  'bankLevelComplianceProgramOperating',
  'independentInternalAuditOperating',
  'charterApplicationFiled',
  'charterApplicationAccepted',
  'charterPreliminaryConditionalApprovalReceived',
  'depositInsuranceApplicationFiled',
  'depositInsuranceApplicationAccepted',
  'depositInsuranceApproved',
  'federalReserveApplicationRequirementsDetermined',
  'federalReserveApprovalReceived',
  'preOpeningExaminationComplete',
  'allPreOpeningConditionsSatisfied',
  'openingAuthorizationReceived',
  'bankCharterEffective',
  'fdicInsuranceEffective',
  'customerFacingBankClaimAuthorized'
];

for (const field of externalApprovalFields) {
  assert.equal(status[field], false, `${field} must remain false without external evidence`);
}

assert.ok(Array.isArray(status.milestones));
assert.ok(status.milestones.length >= 10);
assert.equal(status.milestones.filter((milestone) => milestone.complete).length, 1);
assert.equal(status.milestones.find((milestone) => milestone.id === 'simulation-control-foundation')?.complete, true);
assert.equal(status.milestones.find((milestone) => milestone.id === 'chartered-operations')?.complete, false);
assert.match(status.disclosure, /not a charter application/i);
assert.match(status.disclosure, /not.*regulatory approval/i);
assert.match(status.disclosure, /not.*deposit-insurance approval/i);
assert.match(status.disclosure, /not.*authorization to operate/i);

console.log('Future bank charter readiness goal and external-approval truth boundaries passed runtime checks.');
