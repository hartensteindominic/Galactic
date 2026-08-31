import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync('lib/third-party-inventory.ts', 'utf8');
const transpiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  },
  fileName: 'third-party-inventory.ts'
}).outputText;

const moduleShim = { exports: {} };
vm.runInNewContext(transpiled, {
  module: moduleShim,
  exports: moduleShim.exports,
  console,
  Set
}, { filename: 'third-party-inventory.runtime.cjs' });

const {
  currentThirdPartyInventory,
  thirdPartyInventoryStatus,
  UNSELECTED_REGULATED_VENDOR_CATEGORIES
} = moduleShim.exports;

const inventory = currentThirdPartyInventory();
assert.equal(Array.isArray(inventory), true);
assert.equal(inventory.length, 4);

const keys = inventory.map((service) => service.key);
assert.equal(new Set(keys).size, keys.length);
assert.deepEqual([...keys].sort(), ['github', 'plaid-sandbox', 'supabase', 'vercel']);

for (const service of inventory) {
  assert.equal(service.selectedForProduction, false, `${service.key} must not be presented as selected for production`);
  assert.equal(service.productionApproved, false, `${service.key} must not be presented as production approved`);
  assert.equal(service.liveCustomerDataAllowed, false, `${service.key} must not be allowed live customer data`);
  assert.equal(service.liveCustomerFinancialDataAllowed, false, `${service.key} must not be allowed live financial data`);
  assert.equal(service.restrictedCustomerDataAllowed, false, `${service.key} must not be allowed Restricted customer data`);
  assert.equal(service.moneyMovementEnabled, false, `${service.key} must not enable money movement`);
  assert.equal(service.securityDueDiligenceComplete, false);
  assert.equal(service.privacyDueDiligenceComplete, false);
  assert.equal(service.contractApproved, false);
  assert.equal(service.sponsorOrProgramApprovalComplete, false);
  assert.equal(service.continuityExitPlanVerified, false);
  assert.ok(service.limitation.length > 40);
}

const supabase = inventory.find((service) => service.key === 'supabase');
assert.ok(supabase);
assert.equal(supabase.syntheticDataOnly, true);
assert.ok(supabase.currentDataClassifications.includes('Confidential'));
assert.match(supabase.currentDataFlow, /Server credentials are Restricted/);

const plaid = inventory.find((service) => service.key === 'plaid-sandbox');
assert.ok(plaid);
assert.match(plaid.currentDataFlow, /does not return or persist the Plaid Sandbox access token/);

const requiredUnselected = [
  'sponsor-bank-or-regulated-institution',
  'baas-or-embedded-finance-provider',
  'kyc-kyb-identity',
  'aml-sanctions',
  'fraud-platform',
  'card-or-payment-processor',
  'customer-support-case-management',
  'third-party-ai-llm-for-customer-data',
  'independent-security-assurance',
  'qualified-legal-compliance-advisors'
];
for (const category of requiredUnselected) {
  assert.ok(UNSELECTED_REGULATED_VENDOR_CATEGORIES.includes(category), `Missing unselected category ${category}`);
}

const status = thirdPartyInventoryStatus();
assert.equal(status.machineReadableInventoryAvailable, true);
assert.equal(status.currentPrototypeServiceCount, 4);
assert.equal(status.productionApprovedServiceCount, 0);
assert.equal(status.liveCustomerFinancialDataApprovedServiceCount, 0);
assert.equal(status.moneyMovementEnabledServiceCount, 0);
assert.equal(status.thirdPartyLlmCustomerDataEnabled, false);
assert.equal(status.productionThirdPartyRiskProgramOperating, false);
assert.equal(status.productionVendorContractsApproved, false);
assert.equal(status.productionVendorDataFlowsApproved, false);
assert.equal(status.productionVendorExitPlansVerified, false);

const serialized = JSON.stringify({ inventory, status });
for (const forbiddenField of ['apiKey', 'accessToken', 'privateKey', 'secretValue', 'password']) {
  assert.equal(serialized.includes(`\"${forbiddenField}\"`), false, `Inventory must not expose ${forbiddenField}`);
}

console.log('Third-party inventory runtime behavior checks passed.');
