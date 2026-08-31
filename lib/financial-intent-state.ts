import { BankingError } from './banking';

export type FinancialIntentState =
  | 'created'
  | 'submitted'
  | 'pending_unknown'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export type FinancialIntentEvent =
  | 'submit'
  | 'provider_acknowledged'
  | 'response_ambiguous'
  | 'provider_confirmed_success'
  | 'provider_confirmed_failure'
  | 'cancel_before_submission';

const terminalStates = new Set<FinancialIntentState>(['succeeded', 'failed', 'cancelled']);

const transitions: Record<FinancialIntentState, Partial<Record<FinancialIntentEvent, FinancialIntentState>>> = {
  created: {
    submit: 'submitted',
    cancel_before_submission: 'cancelled'
  },
  submitted: {
    provider_acknowledged: 'submitted',
    response_ambiguous: 'pending_unknown',
    provider_confirmed_success: 'succeeded',
    provider_confirmed_failure: 'failed'
  },
  pending_unknown: {
    response_ambiguous: 'pending_unknown',
    provider_acknowledged: 'pending_unknown',
    provider_confirmed_success: 'succeeded',
    provider_confirmed_failure: 'failed'
  },
  succeeded: {},
  failed: {},
  cancelled: {}
};

export function financialIntentStatus(state: FinancialIntentState) {
  return {
    state,
    terminal: terminalStates.has(state),
    outcomeAuthoritative: terminalStates.has(state),
    customerStatus: state === 'pending_unknown'
      ? 'We sent this instruction, but its final status is not yet confirmed.'
      : state === 'submitted'
        ? 'Submitted. Final status is still pending.'
        : state === 'succeeded'
          ? 'Completed.'
          : state === 'failed'
            ? 'Failed.'
            : state === 'cancelled'
              ? 'Cancelled before submission.'
              : 'Not submitted yet.',
    replacementIntentAllowed: state === 'failed' || state === 'cancelled',
    automaticReplacementAllowed: false
  } as const;
}

export function transitionFinancialIntent(
  state: FinancialIntentState,
  event: FinancialIntentEvent
): FinancialIntentState {
  const next = transitions[state][event];
  if (!next) {
    throw new BankingError(
      409,
      'INVALID_FINANCIAL_INTENT_TRANSITION',
      `Financial intent cannot transition from ${state} using ${event}.`
    );
  }
  return next;
}

export function requireAuthoritativeTerminalState(state: FinancialIntentState) {
  if (!terminalStates.has(state)) {
    throw new BankingError(
      409,
      'FINANCIAL_INTENT_OUTCOME_UNKNOWN',
      'This financial intent does not yet have an authoritative terminal outcome.'
    );
  }
  return state;
}

export function requireSafeReplacementEligibility(state: FinancialIntentState) {
  if (state === 'pending_unknown' || state === 'submitted') {
    throw new BankingError(
      409,
      'REPLACEMENT_BLOCKED_WHILE_OUTCOME_UNKNOWN',
      'Do not create a replacement instruction while the original financial intent is submitted or has an unknown outcome.'
    );
  }
  if (state === 'succeeded') {
    throw new BankingError(
      409,
      'REPLACEMENT_BLOCKED_AFTER_SUCCESS',
      'Do not create a replacement instruction for a financial intent that already succeeded.'
    );
  }
  return state === 'failed' || state === 'cancelled';
}

export function financialIntentControlStatus() {
  return {
    explicitUnknownState: true,
    timeoutIsNotFailure: true,
    automaticReplacementAllowed: false,
    replacementBlockedWhileUnknown: true,
    authoritativeTerminalEvidenceRequired: true,
    productionProviderStateMappingVerified: false
  } as const;
}
