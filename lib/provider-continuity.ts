import { BankingError } from './banking';

export type ProviderContinuityState =
  | 'normal'
  | 'elevated-risk'
  | 'migration-preparation'
  | 'provider-unavailable'
  | 'customer-protection-only'
  | 'exit-in-progress'
  | 'stabilized';

export type ProviderContinuityTrigger =
  | 'contract-termination-notice'
  | 'regulatory-restriction'
  | 'provider-outage'
  | 'middleware-failure'
  | 'data-access-degradation'
  | 'provider-certification-change'
  | 'manual-risk-escalation';

export type ProviderContinuityActor = 'system-detection' | 'authorized-operator' | 'approved-human-governance';

export type ProviderContinuityEvent = {
  trigger: ProviderContinuityTrigger;
  actor: ProviderContinuityActor;
  authoritativeProviderStatusKnown: boolean;
  customerFundsAccessImpactKnown: boolean;
  approvedMigrationPlanExists: boolean;
  destinationProviderApproved: boolean;
  authoritativeBalanceExportAvailable: boolean;
  reconciliationCompleted: boolean;
  customerCommunicationApproved: boolean;
};

export type ProviderContinuityDecision = {
  state: ProviderContinuityState;
  newFinancialInstructionsAllowed: boolean;
  protectiveActionsAllowed: boolean;
  automaticProviderSwitchAllowed: false;
  automaticInstructionReroutingAllowed: false;
  automaticCustomerFundsMigrationAllowed: false;
  existingUnknownInstructionsRemainUnknown: true;
  replacementInstructionsAutomaticallyCreated: false;
  humanGovernanceRequiredForMigration: true;
  approvedDestinationProviderRequiredForMigration: true;
  authoritativeBalanceExportRequiredForMigration: true;
  reconciliationRequiredBeforeMigrationCompletion: true;
  approvedCustomerCommunicationRequired: true;
  productionMigrationExecutionImplemented: false;
  productionProviderContinuityPlanApproved: false;
  disclosure: string;
};

function protectiveDecision(state: ProviderContinuityState, allowNewInstructions: boolean): ProviderContinuityDecision {
  return {
    state,
    newFinancialInstructionsAllowed: allowNewInstructions,
    protectiveActionsAllowed: true,
    automaticProviderSwitchAllowed: false,
    automaticInstructionReroutingAllowed: false,
    automaticCustomerFundsMigrationAllowed: false,
    existingUnknownInstructionsRemainUnknown: true,
    replacementInstructionsAutomaticallyCreated: false,
    humanGovernanceRequiredForMigration: true,
    approvedDestinationProviderRequiredForMigration: true,
    authoritativeBalanceExportRequiredForMigration: true,
    reconciliationRequiredBeforeMigrationCompletion: true,
    approvedCustomerCommunicationRequired: true,
    productionMigrationExecutionImplemented: false,
    productionProviderContinuityPlanApproved: false,
    disclosure: 'Provider-continuity control model only. A provider outage, regulatory restriction, termination notice, or middleware failure never authorizes Galactic to switch providers, reroute submitted instructions, or move customer funds automatically. Production continuity requires the actual contractual/legal responsibilities, authoritative balances and transaction states, approved destination provider/program, reconciliation, customer communications, human governance, and applicable partner/regulatory approvals.'
  };
}

export function evaluateProviderContinuityEvent(event: ProviderContinuityEvent): ProviderContinuityDecision {
  if (!event || typeof event !== 'object') {
    throw new BankingError(400, 'INVALID_PROVIDER_CONTINUITY_EVENT', 'A provider-continuity event is required.');
  }

  if (event.actor === 'system-detection') {
    if (event.trigger === 'provider-outage' || event.trigger === 'middleware-failure' || event.trigger === 'data-access-degradation') {
      return protectiveDecision(event.authoritativeProviderStatusKnown ? 'provider-unavailable' : 'customer-protection-only', false);
    }
    return protectiveDecision('elevated-risk', false);
  }

  if (event.actor === 'authorized-operator') {
    if (event.trigger === 'contract-termination-notice' || event.trigger === 'regulatory-restriction' || event.trigger === 'provider-certification-change') {
      return protectiveDecision('migration-preparation', false);
    }
    if (!event.authoritativeProviderStatusKnown) {
      return protectiveDecision('customer-protection-only', false);
    }
    return protectiveDecision('elevated-risk', false);
  }

  if (event.actor !== 'approved-human-governance') {
    throw new BankingError(400, 'INVALID_PROVIDER_CONTINUITY_ACTOR', 'Unknown provider-continuity actor.');
  }

  const migrationEvidenceComplete =
    event.approvedMigrationPlanExists
    && event.destinationProviderApproved
    && event.authoritativeBalanceExportAvailable
    && event.reconciliationCompleted
    && event.customerCommunicationApproved;

  if (migrationEvidenceComplete) {
    return protectiveDecision('exit-in-progress', false);
  }

  if (
    event.approvedMigrationPlanExists
    || event.destinationProviderApproved
    || event.authoritativeBalanceExportAvailable
    || event.reconciliationCompleted
    || event.customerCommunicationApproved
  ) {
    return protectiveDecision('migration-preparation', false);
  }

  return protectiveDecision('elevated-risk', false);
}

export function providerContinuityControlStatus() {
  return {
    providerExitStateModelImplemented: true,
    automaticProviderSwitchEnabled: false,
    automaticFinancialInstructionReroutingEnabled: false,
    automaticCustomerFundsMigrationEnabled: false,
    unknownInstructionReplacementEnabled: false,
    providerOutageBlocksNewInstructionsInModel: true,
    protectiveActionsRemainAvailableInModel: true,
    humanGovernanceRequiredForMigration: true,
    approvedDestinationProviderRequired: true,
    authoritativeBalanceExportRequired: true,
    reconciliationBeforeMigrationCompletionRequired: true,
    approvedCustomerCommunicationRequired: true,
    productionMigrationExecutionImplemented: false,
    providerContractTerminationTermsReviewed: false,
    providerDataPortabilityVerified: false,
    alternateProviderProgramApproved: false,
    productionProviderContinuityPlanApproved: false,
    providerExitExerciseVerified: false,
    disclosure: 'Provider-continuity software model only. It does not create a second sponsor relationship, approve a destination provider, grant data portability, migrate customer funds, or satisfy contractual/regulatory continuity obligations.'
  } as const;
}
