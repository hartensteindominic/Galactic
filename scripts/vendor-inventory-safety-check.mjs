import fs from 'node:fs';

const required = [
  ['lib/third-party-inventory.ts', "key: 'github'", 'source/CI dependency must be inventoried'],
  ['lib/third-party-inventory.ts', "key: 'vercel'", 'deployment target must be inventoried'],
  ['lib/third-party-inventory.ts', "key: 'supabase'", 'prototype persistence dependency must be inventoried'],
  ['lib/third-party-inventory.ts', "key: 'plaid-sandbox'", 'optional account-linking sandbox must be inventoried'],
  ['lib/third-party-inventory.ts', 'selectedForProduction: false', 'current prototype services must not be presented as selected for production'],
  ['lib/third-party-inventory.ts', 'productionApproved: false', 'current prototype services must not be presented as production approved'],
  ['lib/third-party-inventory.ts', 'liveCustomerFinancialDataAllowed: false', 'current prototype services must not be approved for live customer financial data'],
  ['lib/third-party-inventory.ts', 'restrictedCustomerDataAllowed: false', 'current prototype services must not be approved for Restricted customer data'],
  ['lib/third-party-inventory.ts', 'moneyMovementEnabled: false', 'current prototype services must not enable money movement'],
  ['lib/third-party-inventory.ts', "'sponsor-bank-or-regulated-institution'", 'sponsor-bank category must remain explicitly unselected'],
  ['lib/third-party-inventory.ts', "'kyc-kyb-identity'", 'identity provider category must remain explicitly unselected'],
  ['lib/third-party-inventory.ts', "'aml-sanctions'", 'AML/sanctions provider category must remain explicitly unselected'],
  ['lib/third-party-inventory.ts', "'fraud-platform'", 'fraud provider category must remain explicitly unselected'],
  ['lib/third-party-inventory.ts', "'card-or-payment-processor'", 'payment processor category must remain explicitly unselected'],
  ['lib/third-party-inventory.ts', "'third-party-ai-llm-for-customer-data'", 'third-party AI customer-data category must remain explicitly unselected'],
  ['lib/third-party-inventory.ts', 'thirdPartyLlmCustomerDataEnabled: false', 'third-party LLM customer-data processing must remain disabled'],
  ['lib/third-party-inventory.ts', 'productionThirdPartyRiskProgramOperating: false', 'production third-party risk program must remain unverified'],
  ['lib/third-party-inventory.ts', 'productionVendorContractsApproved: false', 'production vendor contracts must remain unapproved'],
  ['lib/third-party-inventory.ts', 'productionVendorDataFlowsApproved: false', 'production vendor data flows must remain unapproved'],
  ['app/api/prototype/vendor-inventory/route.ts', 'resolveRequestBrand', 'vendor inventory API must respect the tenant host boundary'],
  ['app/api/prototype/vendor-inventory/route.ts', 'bankingErrorResponse', 'vendor inventory API must use standardized sanitized error handling'],
  ['lib/prototype-readiness.ts', 'machineReadableThirdPartyInventoryAvailable: true', 'readiness must expose machine-readable vendor inventory availability'],
  ['lib/prototype-readiness.ts', 'thirdPartyInventory,', 'readiness must expose the vendor inventory status object'],
  ['lib/prototype-readiness.ts', 'productionThirdPartyRiskProgramOperating: false', 'readiness must not claim a production vendor-risk program is operating'],
  ['lib/prototype-trust.ts', "id: 'third-party-inventory'", 'Trust Center must include the third-party inventory control'],
  ['lib/prototype-trust.ts', 'Inventory is not due diligence, contract approval', 'Trust Center must explain what vendor inventory does not prove'],
  ['lib/prototype-trust.ts', 'productionThirdPartyRiskProgramOperating: false', 'Trust Center must not claim a production vendor-risk program is operating'],
  ['lib/prototype-trust.ts', 'productionVendorContractsApproved: false', 'Trust Center must not claim production vendor contracts are approved'],
  ['lib/prototype-trust.ts', 'productionVendorDataFlowsApproved: false', 'Trust Center must not claim production vendor data flows are approved'],
  ['scripts/vendor-inventory-runtime-check.mjs', 'Third-party inventory runtime behavior checks passed.', 'vendor inventory must have executable behavioral coverage'],
  ['docs/THIRD_PARTY_AND_AI_VENDOR_RISK_REGISTER_TEMPLATE.md', 'AI cannot be approved as a generic vendor category.', 'vendor governance must keep AI approval use-case specific'],
  ['docs/THIRD_PARTY_AND_AI_VENDOR_RISK_REGISTER_TEMPLATE.md', 'Vendor-disappearance drill', 'vendor governance must include disappearance testing']
];

const forbidden = [
  ['lib/third-party-inventory.ts', 'selectedForProduction: true', 'prototype inventory must not select a service for production in code'],
  ['lib/third-party-inventory.ts', 'productionApproved: true', 'prototype inventory must not self-approve a service for production'],
  ['lib/third-party-inventory.ts', 'liveCustomerFinancialDataAllowed: true', 'prototype inventory must not approve live financial data sharing'],
  ['lib/third-party-inventory.ts', 'restrictedCustomerDataAllowed: true', 'prototype inventory must not approve Restricted customer data sharing'],
  ['lib/third-party-inventory.ts', 'moneyMovementEnabled: true', 'prototype inventory must not enable vendor money movement'],
  ['lib/third-party-inventory.ts', 'thirdPartyLlmCustomerDataEnabled: true', 'prototype inventory must not enable third-party LLM customer-data processing'],
  ['lib/prototype-readiness.ts', 'productionThirdPartyRiskProgramOperating: true', 'readiness must not self-certify a production vendor-risk program'],
  ['lib/prototype-trust.ts', 'productionThirdPartyRiskProgramOperating: true', 'Trust Center must not self-certify a production vendor-risk program'],
  ['lib/prototype-trust.ts', 'productionVendorContractsApproved: true', 'Trust Center must not self-certify vendor contract approval'],
  ['lib/prototype-trust.ts', 'productionVendorDataFlowsApproved: true', 'Trust Center must not self-certify vendor data-flow approval']
];

for (const [file, text, label] of required) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(text)) throw new Error(`Missing ${label} in ${file}`);
}

for (const [file, text, label] of forbidden) {
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(text)) throw new Error(label);
}

console.log('Third-party inventory, vendor approval, data-flow, and risk-program safety checks passed.');
