import { aiGovernanceStatus } from './ai-governance';
import { bankingStatus } from './banking';
import { billGuardControlStatus } from './prototype-bill-guard';
import { charterReadinessStatus } from './charter-readiness';
import { customerTermsControlStatus } from './customer-terms-control';
import { financialIntentControlStatus } from './financial-intent-state';
import { plaidSandboxStatus } from './plaid-sandbox';
import { prototypeIncidentCommunicationControlStatus } from './prototype-incident-status';
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
  const charterReadiness = charterReadinessStatus();
  const customerTermsControl = customerTermsControlStatus();
  const financialIntentControls = financialIntentControlStatus();
  const incidentCommunicationControls = prototypeIncidentCommunicationControlStatus();
  const ledger = prototypeLedgerStatus();
  const migrationIntegrity = prototypeMigrationIntegrityStatus();
  const bankLink = plaidSandboxStatus();
  const operations = prototypeOperationsStatus();
  const operatorAccess = prototypeOperatorAccessStatus();
  const supportCaseControls = supportCaseControlStatus();
  const supportSensitiveDataControls = supportSensitiveDataControlStatus();
  const tenantBoundary = tenantBoundaryStatus();
  const thirdPartyInventory = thirdPartyInventoryStatus();

  const persistentDemoEnvironmentConfigured = ledger.databaseCredentialsConfigured;
  const persistentDemoConfigured = ledger.persistentSchemaVerified;
  const externalSandboxEnvironmentConfigured = bankLink.credentialsConfigured;
  const externalSandboxConfigured = bankLink.sandboxConnectionExerciseVerified;

  let nextSafeStep = 'Exercise the white-label demo and operations console with synthetic data.';
  if (!persistentDemoEnvironmentConfigured) {
    nextSafeStep = 'Configure a disposable/private Supabase prototype project with server-only credentials. Then run migrations 001-005 in order and compare the target database migration history to the repository manifest.';
  } else if (!persistentDemoConfigured) {
    nextSafeStep = 'Supabase credentials are present, but persistent schema/idempotency/reconciliation are not verified. Run migrations 001-005 in the disposable/private target, verify the expected schema and migration history, then exercise transfer replay and both reconciliation layers before marking persistent controls verified.';
  } else if (!operatorAccess.configured) {
    nextSafeStep = operatorAccess.weakSecretConfigured
      ? `Replace the weak prototype operator access secret with a high-entropy server-only value at least ${operatorAccess.minimumSecretLength} characters long.`
      : 'Configure a strong server-only prototype operator access secret before exposing persistent reconciliation, audit, or provider-event evidence.';
  } else if (!operations.webhookInboxConfigured) {
    nextSafeStep = 'Configure the server-only prototype webhook secret, then test exact duplicate sandbox events, conflicting replay rejection, transfer replay safety, and both reconciliation layers.';
  } else if (!externalSandboxEnvironmentConfigured) {
    nextSafeStep = 'Optionally configure Plaid Sandbox credentials privately. Configuration alone is not an exercise or provider approval.';
  } else if (!externalSandboxConfigured) {
    nextSafeStep = 'Plaid Sandbox credentials are present. Exercise the synthetic token exchange, account/transaction retrieval, tenant-bound persistence path, sanitized failure behavior, and returned-token boundary before recording sandbox exercise evidence.';
  } else if (!charterReadiness.businessModelThesisDefined) {
    nextSafeStep = 'Define and validate the specific customer, painful problem, distribution advantage, durable non-interchange revenue model, and driver-based unit economics before treating the long-term charter goal as a bank business plan.';
  } else {
    nextSafeStep = 'Run repeated simulated transfers, replay duplicate and conflicting sandbox events, reconcile transaction history and double-entry balances, validate persistent Safe-to-Spend and Bill Guard data, verify target database migration history against the repository manifest, and capture evidence for partner/investor diligence.';
  }

  return {
    stage: 'prototype',
    investorDemoReady: true,
    whiteLabelShellReady: true,
    longTermGoal: charterReadiness.longTermGoal,
    charterReadiness,
    futureCharterRoadmapDocumented: charterReadiness.roadmapDocumented,
    businessModelThesisValidatedForCharterPath: false,
    charterRouteSelected: false,
    charterApplicationFiled: false,
    depositInsuranceApproved: false,
    bankCharterEffective: false,
    openingAuthorizationReceived: false,
    customerFacingBankClaimAuthorized: false,
    persistentDemoEnvironmentConfigured,
    persistentDemoConfigured,
    persistentSchemaVerified: ledger.persistentSchemaVerified,
    targetMigrationHistoryVerified: ledger.targetMigrationHistoryVerified,
    persistentRuntimeExerciseVerified: ledger.persistentRuntimeExerciseVerified,
    externalSandboxEnvironmentConfigured,
    externalSandboxConfigured,
    plaidSandboxConnectionExerciseVerified: false,
    plaidSandboxPersistenceExerciseVerified: false,
    productionPlaidProviderApproved: false,
    productionPlaidWebhookVerificationEnabled: false,
    reconciliationAvailable: true,
    persistentReconciliationEnvironmentConfigured: operations.databaseConfigured,
    persistentReconciliationConfigured: false,
    persistentReconciliationExerciseVerified: false,
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
    sandboxWebhookInboxEnvironmentConfigured: operations.webhookInboxEnvironmentConfigured,
    sandboxWebhookInboxConfigured: false,
    sandboxWebhookReplayExerciseVerified: false,
    transferIdempotencyAvailable: true,
    persistentTransferIdempotencyAvailableInMigration: ledger.persistentTransferIdempotencyAvailableInMigration,
    persistentTransferIdempotencyConfigured: ledger.persistentTransferIdempotency,
    persistentTransferIdempotencyExerciseVerified: false,
    persistentLedgerFailsClosedWhenConfigured: true,
    financialIntentControls,
    incidentCommunicationControls,
    customerIncidentStatusModelImplemented: true,
    productionCustomerStatusChannelConnected: false,
    approvedIncidentMessageWorkflowConnected: false,
    productionHumanIncidentSupportPathConnected: false,
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
    readyToFileCharterApplication: false,
    readyToOpenCharteredBank: false,
    nextSafeStep,
    disclosure: 'Readiness is for the white-label simulation, sponsor-program diligence path, and long-term charter planning only. The future-chartered-bank field is a strategic goal, not a bank charter, deposit-insurance approval, regulatory filing, capital approval, opening authorization, or permission to market Galactic Trust as a bank. The business-model thesis, unit economics, charter route, organizers, bank board/management, regulator-ready plan, capital, applications, and pre-opening conditions all remain unverified. Supabase credentials, when present, mean only that a server-side database endpoint is configured; they do not prove migrations ran, schema is correct, persistent transfer idempotency works, reconciliation works, or webhook persistence works. Plaid Sandbox credentials, when present, mean only that the sandbox environment is configured; they do not prove the sandbox token/account/transaction flow, persistence path, provider semantics, webhook verification, or production provider approval has been exercised. The repository fingerprints migrations 001-005 and CI rejects silent edits to those locked files, but target database migration history, external Supabase execution, backup/restore behavior, and migration recovery remain unverified until exercised in a disposable or approved environment. The incident-status model keeps service availability separate from transaction outcome: submitted or unknown instructions may still be processing and are never relabeled failed merely because money movement is temporarily unavailable. No production customer-status channel, approved incident-message workflow, production human incident-support path, or measured customer-visible status timing is connected or verified. Safe-to-Spend and Bill Guard are planning UX only: Bill Guard does not reserve or move funds, pay bills, enable autopay, connect a live bill provider, or guarantee bill coverage; production bill-payment controls remain unverified. The machine-readable third-party inventory records services referenced by the prototype and keeps production approvals/live-customer-data permissions false; it is not vendor due diligence, contract approval, sponsor approval, or authorization to send live customer financial or Restricted data to a vendor. Orbit is an automated deterministic support assistant, not a regulated decision maker; regulated AI decisioning and third-party LLM use of customer financial data remain disabled. The support chat has best-effort client preflight plus server-side rejection for several high-risk secret/identifier patterns, but this is explicitly not production DLP and does not replace secure document/identity workflows or logging/privacy controls. The prototype centralizes changing customer-facing prototype terms under one versioned source and fails closed when live terms are requested without an approved live source; that does not mean production terms are approved. Material support cases have an explicit human-controlled state model, and automation cannot acknowledge as a human, resolve, or close them; no production case-management system or response deadlines are configured. Financial intent controls explicitly preserve submitted/pending-unknown states, treat timeout as non-terminal, block replacement while outcome is unknown, and still require provider-specific state mapping to be verified before production. Governance documents exist, but responsibility assignment, legal/compliance applicability review, sponsor-bank/program approval, production retention, complaint escalation, human support handoff, third-party risk operation, approved live customer-term source-of-truth, and independent threat-model review remain unapproved/unverified. Provider-disappearance handling and customer-visible incident-status timing are documented but remain unverified until exercised in an approved environment. The prototype operator session, tenant host binding, body limits, best-effort login throttle, and support sensitive-data detector improve demo safety but are not production workforce identity, distributed abuse prevention, or DLP. Live banking requires an approved regulated program, exact provider integrations, phishing-resistant operator MFA/SSO, RBAC/dual control, distributed rate/abuse controls, KYC/AML, fraud, security, compliance, support, provider-statement reconciliation, approved disclosures, tested emergency controls, and exercised disaster-recovery and ledger-recovery procedures.'
  } as const;
}
