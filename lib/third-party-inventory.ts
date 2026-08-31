export type DataClassification = 'Public' | 'Internal' | 'Confidential' | 'Restricted';

export type ThirdPartyServiceStage =
  | 'source-ci'
  | 'deployment-target'
  | 'prototype-persistence'
  | 'optional-sandbox';

export type ThirdPartyServiceRecord = {
  key: string;
  serviceName: string;
  category: 'source-control-ci' | 'cloud-hosting' | 'database' | 'account-linking';
  stage: ThirdPartyServiceStage;
  currentUse: string;
  currentDataClassifications: DataClassification[];
  currentDataFlow: string;
  syntheticDataOnly: boolean;
  selectedForProduction: false;
  productionApproved: false;
  liveCustomerDataAllowed: false;
  liveCustomerFinancialDataAllowed: false;
  restrictedCustomerDataAllowed: false;
  moneyMovementEnabled: false;
  securityDueDiligenceComplete: false;
  privacyDueDiligenceComplete: false;
  contractApproved: false;
  sponsorOrProgramApprovalComplete: false;
  continuityExitPlanVerified: false;
  limitation: string;
};

const CURRENT_PROTOTYPE_SERVICES: readonly ThirdPartyServiceRecord[] = [
  {
    key: 'github',
    serviceName: 'GitHub',
    category: 'source-control-ci',
    stage: 'source-ci',
    currentUse: 'Source control and GitHub Actions CI for the prototype repository.',
    currentDataClassifications: ['Public', 'Internal'],
    currentDataFlow: 'Repository code, configuration templates, workflow metadata, and synthetic test fixtures. Customer financial data is not an intended repository or CI input.',
    syntheticDataOnly: true,
    selectedForProduction: false,
    productionApproved: false,
    liveCustomerDataAllowed: false,
    liveCustomerFinancialDataAllowed: false,
    restrictedCustomerDataAllowed: false,
    moneyMovementEnabled: false,
    securityDueDiligenceComplete: false,
    privacyDueDiligenceComplete: false,
    contractApproved: false,
    sponsorOrProgramApprovalComplete: false,
    continuityExitPlanVerified: false,
    limitation: 'Repository and CI use does not constitute approval for production financial data, regulated operations, or production privileged-access design.'
  },
  {
    key: 'vercel',
    serviceName: 'Vercel',
    category: 'cloud-hosting',
    stage: 'deployment-target',
    currentUse: 'Next.js hosting/deployment target referenced by the repository workflows.',
    currentDataClassifications: ['Public', 'Internal'],
    currentDataFlow: 'Application build artifacts and deployment configuration. This inventory does not assert that an exact-head PR preview or production financial-data path has been approved or exercised.',
    syntheticDataOnly: true,
    selectedForProduction: false,
    productionApproved: false,
    liveCustomerDataAllowed: false,
    liveCustomerFinancialDataAllowed: false,
    restrictedCustomerDataAllowed: false,
    moneyMovementEnabled: false,
    securityDueDiligenceComplete: false,
    privacyDueDiligenceComplete: false,
    contractApproved: false,
    sponsorOrProgramApprovalComplete: false,
    continuityExitPlanVerified: false,
    limitation: 'A deployment target is not a production vendor approval, security certification, data-processing approval, or evidence that a regulated program may run there.'
  },
  {
    key: 'supabase',
    serviceName: 'Supabase',
    category: 'database',
    stage: 'prototype-persistence',
    currentUse: 'Optional persistent database for synthetic prototype ledger, cash-flow, reconciliation, provider-event, and sanitized audit evidence.',
    currentDataClassifications: ['Internal', 'Confidential'],
    currentDataFlow: 'Synthetic prototype records and sanitized operational evidence when privately configured. Server credentials are Restricted and must remain outside application records and browser code.',
    syntheticDataOnly: true,
    selectedForProduction: false,
    productionApproved: false,
    liveCustomerDataAllowed: false,
    liveCustomerFinancialDataAllowed: false,
    restrictedCustomerDataAllowed: false,
    moneyMovementEnabled: false,
    securityDueDiligenceComplete: false,
    privacyDueDiligenceComplete: false,
    contractApproved: false,
    sponsorOrProgramApprovalComplete: false,
    continuityExitPlanVerified: false,
    limitation: 'The prototype schema and adapter do not approve Supabase as a system of record for live customer financial data or establish production retention, residency, backup, access, or contractual requirements.'
  },
  {
    key: 'plaid-sandbox',
    serviceName: 'Plaid Sandbox',
    category: 'account-linking',
    stage: 'optional-sandbox',
    currentUse: 'Optional synthetic external account-linking exercise for the prototype.',
    currentDataClassifications: ['Internal', 'Confidential'],
    currentDataFlow: 'Sandbox institution/account metadata only. The prototype does not return or persist the Plaid Sandbox access token.',
    syntheticDataOnly: true,
    selectedForProduction: false,
    productionApproved: false,
    liveCustomerDataAllowed: false,
    liveCustomerFinancialDataAllowed: false,
    restrictedCustomerDataAllowed: false,
    moneyMovementEnabled: false,
    securityDueDiligenceComplete: false,
    privacyDueDiligenceComplete: false,
    contractApproved: false,
    sponsorOrProgramApprovalComplete: false,
    continuityExitPlanVerified: false,
    limitation: 'Sandbox account linking is not production account-link approval, money-movement capability, provider certification, or authorization to process real customer banking credentials.'
  }
] as const;

export const UNSELECTED_REGULATED_VENDOR_CATEGORIES = [
  'sponsor-bank-or-regulated-institution',
  'baas-or-embedded-finance-provider',
  'kyc-kyb-identity',
  'aml-sanctions',
  'fraud-platform',
  'card-or-payment-processor',
  'customer-support-case-management',
  'production-observability-security-monitoring',
  'email-sms-push-notifications',
  'third-party-ai-llm-for-customer-data',
  'independent-security-assurance',
  'qualified-legal-compliance-advisors'
] as const;

export function currentThirdPartyInventory() {
  return CURRENT_PROTOTYPE_SERVICES.map((service) => ({
    ...service,
    currentDataClassifications: [...service.currentDataClassifications]
  }));
}

export function thirdPartyInventoryStatus() {
  const services = currentThirdPartyInventory();
  return {
    machineReadableInventoryAvailable: true,
    currentPrototypeServiceCount: services.length,
    productionApprovedServiceCount: services.filter((service) => service.productionApproved).length,
    liveCustomerFinancialDataApprovedServiceCount: services.filter((service) => service.liveCustomerFinancialDataAllowed).length,
    moneyMovementEnabledServiceCount: services.filter((service) => service.moneyMovementEnabled).length,
    unselectedRegulatedVendorCategoryCount: UNSELECTED_REGULATED_VENDOR_CATEGORIES.length,
    thirdPartyLlmCustomerDataEnabled: false,
    productionThirdPartyRiskProgramOperating: false,
    productionVendorContractsApproved: false,
    productionVendorDataFlowsApproved: false,
    productionVendorExitPlansVerified: false,
    disclosure: 'Prototype vendor inventory only. It records services referenced by the current software and keeps production approvals false. It is not due diligence completion, contract approval, sponsor-bank approval, privacy approval, security certification, or authorization to send live customer financial or Restricted data to a third party.'
  } as const;
}
