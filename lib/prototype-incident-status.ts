import { financialIntentStatus, type FinancialIntentState } from './financial-intent-state';

export type PrototypeIncidentAvailability = 'prototype-only' | 'temporarily-unavailable';
export type PrototypeIncidentTransactionStatus =
  | 'not-submitted'
  | 'awaiting-confirmation'
  | 'confirmed-completed'
  | 'confirmed-failed'
  | 'cancelled-before-submission';

export type PrototypeCustomerIncidentStatus = {
  simulationOnly: true;
  availability: PrototypeIncidentAvailability;
  transactionStatus: PrototypeIncidentTransactionStatus;
  finalOutcomeKnown: boolean;
  mayStillProcess: boolean;
  replacementInstructionAllowed: boolean;
  automaticReplacementAllowed: false;
  headline: string;
  message: string;
  supportMessage: string;
  productionCustomerStatusChannelConnected: false;
  customerVisibleStatusTimingVerified: false;
};

function transactionStatus(state: FinancialIntentState): PrototypeIncidentTransactionStatus {
  if (state === 'created') return 'not-submitted';
  if (state === 'submitted' || state === 'pending_unknown') return 'awaiting-confirmation';
  if (state === 'succeeded') return 'confirmed-completed';
  if (state === 'failed') return 'confirmed-failed';
  return 'cancelled-before-submission';
}

export function buildPrototypeCustomerIncidentStatus(input: {
  financialIntentState: FinancialIntentState;
  moneyMovementFrozen: boolean;
}): PrototypeCustomerIncidentStatus {
  const intent = financialIntentStatus(input.financialIntentState);
  const waitingForConfirmation = input.financialIntentState === 'submitted' || input.financialIntentState === 'pending_unknown';
  const availability: PrototypeIncidentAvailability = input.moneyMovementFrozen ? 'temporarily-unavailable' : 'prototype-only';

  let headline = 'Prototype transaction status';
  let message = 'This instruction has not been submitted.';

  if (waitingForConfirmation) {
    headline = 'Final status is still awaiting confirmation';
    message = input.moneyMovementFrozen
      ? 'New money-movement instructions are temporarily unavailable in this scenario. An instruction that was already submitted may still be processing or awaiting authoritative confirmation. Do not create a replacement instruction while its outcome is unknown.'
      : 'This instruction was submitted, but its final outcome is not yet authoritative. It may still be processing or awaiting confirmation. Do not create a replacement instruction while its outcome is unknown.';
  } else if (input.financialIntentState === 'succeeded') {
    headline = 'Completion is confirmed in this simulation';
    message = 'The financial-intent state contains authoritative simulated success evidence. This does not represent a live provider or real customer funds.';
  } else if (input.financialIntentState === 'failed') {
    headline = 'Failure is confirmed in this simulation';
    message = 'The financial-intent state contains authoritative simulated failure evidence. A distinct replacement may be considered only under the approved retry/replacement rules.';
  } else if (input.financialIntentState === 'cancelled') {
    headline = 'Cancelled before submission';
    message = 'This instruction was cancelled before submission, so there is no submitted provider outcome to infer.';
  } else if (input.moneyMovementFrozen) {
    headline = 'New money movement is temporarily unavailable';
    message = 'The emergency control is blocking new money-movement instructions in this scenario. No transaction outcome should be inferred from the service-availability state.';
  }

  return {
    simulationOnly: true,
    availability,
    transactionStatus: transactionStatus(input.financialIntentState),
    finalOutcomeKnown: intent.outcomeAuthoritative,
    mayStillProcess: waitingForConfirmation,
    replacementInstructionAllowed: intent.replacementIntentAllowed,
    automaticReplacementAllowed: false,
    headline,
    message,
    supportMessage: 'Prototype status only. Account-specific production incidents require an approved human support and incident-communication workflow; none is connected here.',
    productionCustomerStatusChannelConnected: false,
    customerVisibleStatusTimingVerified: false
  };
}

export function prototypeIncidentCommunicationControlStatus() {
  return {
    explicitTemporaryUnavailableVsTransactionOutcome: true,
    unknownOutcomeDoesNotBecomeFailure: true,
    alreadySubmittedMayStillProcessDisclosed: true,
    replacementBlockedWhileOutcomeUnknown: true,
    automaticReplacementAllowed: false,
    productionCustomerStatusChannelConnected: false,
    approvedIncidentMessageWorkflowConnected: false,
    productionHumanSupportPathConnected: false,
    customerVisibleStatusTimingVerified: false,
    disclosure: 'The prototype can generate conservative incident-status wording that keeps service availability separate from transaction outcome. This is not a production status page, staffed incident-communications program, provider-status integration, or evidence that customer-visible incident timing has been exercised.'
  } as const;
}
