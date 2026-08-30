import { bankingStatus } from './banking';
import { plaidSandboxStatus } from './plaid-sandbox';
import { prototypeLedgerStatus } from './prototype-ledger';
import { prototypeOperationsStatus } from './prototype-operations';
import { prototypeOperatorAccessStatus } from './prototype-operator-auth';

export function prototypeReadiness() {
  const banking = bankingStatus();
  const ledger = prototypeLedgerStatus();
  const bankLink = plaidSandboxStatus();
  const operations = prototypeOperationsStatus();
  const operatorAccess = prototypeOperatorAccessStatus();

  const persistentDemoConfigured = ledger.configured;
  const externalSandboxConfigured = bankLink.configured;

  let nextSafeStep = 'Exercise the white-label demo and operations console with synthetic data.';
  if (!persistentDemoConfigured) {
    nextSafeStep = 'Configure a Supabase prototype project privately and run migrations 001-004 so simulated ledger, reconciliation, idempotency, and double-entry evidence persist.';
  } else if (!operatorAccess.configured) {
    nextSafeStep = operatorAccess.weakSecretConfigured
      ? `Replace the weak prototype operator access secret with a high-entropy server-only value at least ${operatorAccess.minimumSecretLength} characters long.`
      : 'Configure a strong server-only prototype operator access secret before exposing persistent reconciliation, audit, or provider-event evidence.';
  } else if (!operations.webhookInboxConfigured) {
    nextSafeStep = 'Configure the server-only prototype webhook secret, then test duplicate sandbox event handling, transfer replay safety, and both reconciliation layers.';
  } else if (!externalSandboxConfigured) {
    nextSafeStep = 'Optionally configure Plaid Sandbox privately and validate synthetic account-link behavior.';
  } else {
    nextSafeStep = 'Run repeated simulated transfers, replay a duplicate request, reconcile transaction history and double-entry balances, and capture evidence for partner/investor diligence.';
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
    sandboxWebhookInboxConfigured: operations.webhookInboxConfigured,
    transferIdempotencyAvailable: true,
    persistentTransferIdempotencyConfigured: ledger.persistentTransferIdempotency,
    prototypeOperatorAccessRequired: operatorAccess.required,
    prototypeOperatorAccessConfigured: operatorAccess.configured,
    prototypeOperatorWeakSecretConfigured: operatorAccess.weakSecretConfigured,
    prototypeOperatorAccessFailsClosedForPersistentEvidence: operatorAccess.failClosedIfPersistentWithoutSecret,
    productionOperatorIdentityReady: false,
    productionProviderWebhooksEnabled: false,
    liveBankingEnabled: false,
    partnerShellConfigured: banking.partnerConfigured,
    partnerLiveWritesConfigured: banking.liveWritesConfigured,
    partnerLiveWritesEnabled: banking.liveWritesEnabled,
    emergencyMoneyMovementFreezeActive: banking.emergencyFreezeActive,
    emergencyFreezeFailsClosedByDefault: true,
    protectiveWritesAvailableDuringFreeze: banking.protectiveWritesAvailable,
    emergencyFreezeResponseTimeVerified: false,
    disasterRecoveryExerciseVerified: false,
    migrationRecoveryExerciseVerified: false,
    readyForLiveBanking: false,
    nextSafeStep,
    disclosure: 'Readiness is for the white-label simulation and partner-diligence path only. The prototype operator session protects persistent demo evidence but is not production workforce identity. Live banking requires an approved regulated program, exact provider integrations, phishing-resistant operator MFA/SSO, RBAC/dual control, KYC/AML, fraud, security, compliance, support, provider-statement reconciliation, approved disclosures, tested emergency controls, and exercised disaster-recovery and ledger-recovery procedures.'
  } as const;
}
