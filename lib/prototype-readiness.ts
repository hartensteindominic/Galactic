import { aiGovernanceStatus } from './ai-governance';
import { bankingStatus } from './banking';
import { billGuardControlStatus } from './prototype-bill-guard';
import { customerTermsControlStatus } from './customer-terms-control';
import { financialIntentControlStatus } from './financial-intent-state';
import { plaidSandboxStatus } from './plaid-sandbox';
import { prototypeLedgerStatus } from './prototype-ledger';
import { prototypeMigrationIntegrityStatus } from './prototype-migration-integrity';
import { prototypeOperationsStatus } from './prototype-operations';
import { prototypeOperatorAccessStatus } from './prototype-operator-auth';
import { supportCaseControlStatus } from './support-case-state';
import { supportSensitiveDataControlStatus } from './support-sensitive-data';
import { tenantBoundaryStatus } from './tenant-boundary';
import { thirdPartyInventoryStatus } from './third-party-inventory';

export function prototypeReadiness() {
  const aiGovernance = aiGovernanceStatus();
  const banking = bankingStatus();
  const billGuardControls = billGuardControlStatus();
  const customerTermsControl = customerTermsControlStatus();
  const financialIntentControls = financialIntentControlStatus();
  const ledger = prototypeLedgerStatus();
  const migrationIntegrity = prototypeMigrationIntegrityStatus();
  const bankLink = plaidSandboxStatus();
  const operations = prototypeOperationsStatus();
  const operatorAccess = prototypeOperatorAccessStatus();
  const supportCaseControls = supportCaseControlStatus();
  const supportSensitiveDataControls = supportSensitiveDataControlStatus();
  const tenantBoundary = tenantBoundaryStatus();
  const thirdPartyInventory = thirdPartyInventoryStatus();

  const persistentDemoConfigured = ledger.configured;
  const externalSandboxConfigured = bankLink.configured;

  let nextSafeStep = 'Exercise the white-label demo and operations console with synthetic data.';
  if (!persistentDemoConfigured) {
    nextSafeStep = 'Configure a Supabase prototype project privately and run migrations 001-005 in order so simulated ledger, reconciliation, idempotency, double-entry, cash-flow items, and savings goals persist. Compare the target database migration history to the repository manifest after execution.';
  } else if (!operatorAccess.configured) {
    nextSafeStep = operatorAccess.weakSecretConfigured
      ? `Replace the weak prototype operator access secret with a high-entropy server-only value at least ${operatorAccess.minimumSecretLength} characters long.`
      : 'Configure a strong server-only prototype operator access secret before exposing persistent reconciliation, audit, or provider-event evidence.';
  } else if (!operations.webhookInboxConfigured) {
    nextSafeStep = 'Configure the server-only prototype webhook secret, then test exact duplicate sandbox events, conflicting replay rejection, transfer replay safety, and both reconciliation layers.';
  } else if (!externalSandboxConfigured) {
    nextSafeStep = 'Optionally configure Plaid Sandbox privately and validate synthetic account-link behavior.';
  } else {
    nextSafeStep = 'Run repeated simulated transfers, replay duplicate and conflicting sandbox events, reconcile transaction history and double-entry balances, validate persistent Safe-to-Spend and Bill Guard data, verify target database migration history against the repository manifest, and capture evidence for partner/investor diligence.';
  }

  return {
    stage: 'prototype',
    investorDemoReady: true,
    whiteLabelShellReady: true,
    persistentDemoConfigured,
    externalSandboxConfigured,
    reconciliationAvailable: true,
    persistentReconciliationConfigured: operations.databaseConfigured,
    doubleEntryAccountingAvailable: operations.doubleEntryAvailableInBuild,
    cashflowPersistenceMigrationAvailable: true,
    billGuardPlanningAvailable: true,
    billGuardControls,
    productionBillPaymentControlsVerified: false,
    requiredPrototypeMigrationCount: 5,
    migrationIntegrityLockedMigrationCount: migrationIntegrity.lockedMigrationCount,
    migrationIntegrity,
    repositoryMigrationManifestAvailable: migrationIntegrity.repositoryManifestAvailable,
    repositoryMigrationFingerprintsEnforced: migrationIntegrity.appendOnlyFingerprintEnforcedInCi,
    targetDatabaseMigrationHistoryVerified: false,
    prototypeMigrationsExternalExecutionVerified: false,
    sandboxWebhookInboxConfigured: operations.webhookInboxConfigured,
    transferIdempotencyAvailable: true,
    persistentTransferIdempotencyConfigured: ledger.persistentTransferIdempotency,
    financialIntentControls,
    customerTermsControl,
    supportCaseControls,
    supportSensitiveDataControls,
    prototypeOperatorAccessRequired: operatorAccess.required,
    prototypeOperatorAccessConfigured: operatorAccess.configured,
    prototypeOperatorWeakSecretConfigured: operatorAccess.weakSecretConfigured,
    prototypeOperatorAccessFailsClosedForPersistentEvidence: operatorAccess.failClosedIfPersistentWithoutSecret,
    productionOperatorIdentityReady: false,
    productionHostTenantBindingEnabled: tenantBoundary.productionHostBinding,
    crossTenantHostOverrideRejected: tenantBoundary.crossTenantHostOverrideRejected,
    unknownTenantRejected: tenantBoundary.unknownTenantRejected,
    authenticatedServerRoutesRequireExplicitTenant: tenantBoundary.authenticatedServerRoutesRequireExplicitTenant,
    boundedPrototypeMutationBodies: true,
    prototypeOperatorLoginBestEffortThrottle: true,
    productionDistributedRateLimitReady: false,
    productionSupportDlpReady: false,
    aiGovernance,
    machineReadableThirdPartyInventoryAvailable: true,
    thirdPartyInventory,
    governanceDocumentationAvailable: true,
    complianceResponsibilityMatrixAssigned: false,
    productionLegalComplianceApplicabilityReviewComplete: false,
    productionSponsorBankProgramApprovalComplete: false,
    productionDataRetentionScheduleApproved: false,
    productionComplaintEscalationProgramApproved: false,
    productionHumanSupportHandoffExercised: false,
    productionThirdPartyRiskProgramOperating: false,
    productionCustomerTermsSourceOfTruthApproved: false,
    productionThreatModelIndependentReviewComplete: false,
    productionProviderWebhooksEnabled: false,
    liveBankingEnabled: false,
    partnerShellConfigured: banking.partnerConfigured,
    partnerLiveWritesConfigured: banking.liveWritesConfigured,
    partnerLiveWritesEnabled: banking.liveWritesEnabled,
    emergencyMoneyMovementFreezeActive: banking.emergencyFreezeActive,
    emergencyFreezeFailsClosedByDefault: true,
    protectiveWritesAvailableDuringFreeze: banking.protectiveWritesAvailable,
    emergencyFreezeResponseTimeVerified: false,
    customerVisibleIncidentStatusTimeVerified: false,
    providerDisappearanceDuringTransferDrillVerified: false,
    disasterRecoveryExerciseVerified: false,
    migrationRecoveryExerciseVerified: false,
    readyForLiveBanking: false,
    nextSafeStep,
    disclosure: 'Readiness is for the white-label simulation and partner-diligence path only. The repository now fingerprints migrations 001-005 and CI rejects silent edits to those locked files, but target database migration history, external Supabase execution, backup/restore behavior, and migration recovery remain unverified until exercised in a disposable or approved environment. Safe-to-Spend and Bill Guard are planning UX only: Bill Guard does not reserve or move funds, pay bills, enable autopay, connect a live bill provider, or guarantee bill coverage; production bill-payment controls remain unverified. The machine-readable third-party inventory records services referenced by the prototype and keeps production approvals/live-customer-data permissions false; it is not vendor due diligence, contract approval, sponsor approval, or authorization to send live customer financial or Restricted data to a vendor. Orbit is an automated deterministic support assistant, not a regulated decision maker; regulated AI decisioning and third-party LLM use of customer financial data remain disabled. The support chat now has best-effort client preflight plus server-side rejection for several high-risk secret/identifier patterns, but this is explicitly not production DLP and does not replace secure document/identity workflows or logging/privacy controls. The prototype centralizes changing customer-facing prototype terms under one versioned source and fails closed when live terms are requested without an approved live source; that does not mean production terms are approved. Material support cases have an explicit human-controlled state model, and automation cannot acknowledge as a human, resolve, or close them; no production case-management system or response deadlines are configured. Financial intent controls explicitly preserve submitted/pending-unknown states, treat timeout as non-terminal, block replacement while outcome is unknown, and still require provider-specific state mapping to be verified before production. Governance documents exist, but responsibility assignment, legal/compliance applicability review, sponsor-bank/program approval, production retention, complaint escalation, human support handoff, third-party risk operation, approved live customer-term source-of-truth, and independent threat-model review remain unapproved/unverified. Provider-disappearance handling and customer-visible incident-status timing are documented but remain unverified until exercised in an approved environment. The prototype operator session, tenant host binding, body limits, best-effort login throttle, and support sensitive-data detector improve demo safety but are not production workforce identity, distributed abuse prevention, or DLP. Live banking requires an approved regulated program, exact provider integrations, phishing-resistant operator MFA/SSO, RBAC/dual control, distributed rate/abuse controls, KYC/AML, fraud, security, compliance, support, provider-statement reconciliation, approved disclosures, tested emergency controls, and exercised disaster-recovery and ledger-recovery procedures.'
  } as const;
}
