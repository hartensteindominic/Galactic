# Emergency Money-Movement Control

## Purpose

This runbook defines how Galactic's banking integration must fail closed when fraud, reconciliation drift, provider instability, credential compromise, duplicate-payment risk, or another material incident could make money movement unsafe.

This document is an engineering and operations control plan. It does not claim that Galactic is currently operating a live banking program.

## Current implementation

The partner banking shell now has two independent gates for writes:

1. `BANKING_ENABLE_LIVE_WRITES=true` must be explicitly configured.
2. `BANKING_EMERGENCY_FREEZE=false` must also be explicitly configured.

The emergency freeze is active by default because the code treats every value other than the literal string `false` as frozen.

A transfer request in partner mode is rejected with `MONEY_MOVEMENT_FROZEN` while the emergency freeze is active.

Protective card-freeze actions are allowed to remain available during a money-movement freeze so an operator or customer can still reduce exposure on a compromised card.

## Important limitation

The current control is a fail-closed application configuration gate. It has **not** been verified as a sub-30-second production kill switch.

Changing an environment variable can require deployment/configuration propagation and therefore must not be treated as the final production emergency-control plane.

Before live launch, Galactic must implement and exercise a production control that can stop provider-side money movement quickly without relying on a normal application deployment. Depending on the approved banking stack, this may be a provider pause endpoint, a dedicated operations control service, a program-level money-movement state, or another partner-approved mechanism.

## Target production behavior

When the emergency freeze is activated:

- New outgoing money-movement instructions fail closed.
- The API returns a clear temporary-unavailable response and never reports success for a blocked instruction.
- Existing immutable ledger history is not deleted or rewritten.
- Reconciliation and read-only investigation remain available where safe.
- Protective actions such as freezing cards remain available when supported by the regulated provider.
- Provider callbacks/webhooks continue to be accepted and recorded when doing so is necessary to understand already-in-flight activity.
- Operators can see who activated the freeze, why, when, and the incident/ticket reference.
- Unfreezing requires a documented decision and evidence that the triggering risk has been contained.

## Trigger examples

Activate the freeze when any of the following could materially affect customer funds or ledger correctness:

- Duplicate debit or credit behavior.
- Idempotency failure.
- Material GL/account/provider reconciliation mismatch.
- Provider reports that money-movement APIs are degraded or unsafe.
- Suspected compromise of banking credentials or signing material.
- Fraud spike outside approved thresholds.
- Webhook verification failure that makes state transitions unreliable.
- Database corruption or loss of authoritative ledger state.
- Incident commander cannot establish the current state of in-flight transfers.

## Freeze runbook

1. Declare the incident and assign an incident commander.
2. Activate the fastest approved program-level money-movement freeze.
3. Confirm a known test instruction is rejected. Do not use real customer funds for the test unless the approved incident procedure specifically requires it.
4. Confirm protective controls that should remain available still work.
5. Record activation time and observed effective time.
6. Capture provider status, reconciliation state, error IDs, recent deploy/config changes, and affected tenants.
7. Preserve logs and evidence; do not mutate historical journal entries.
8. Reconcile account state, GL state, and provider state before unfreezing.
9. Document root cause, customer impact, remediation, and required follow-up controls.

## Unfreeze runbook

Unfreeze only after all required owners agree that:

- Root cause is understood or sufficiently contained.
- Reconciliation is within approved tolerances.
- Duplicate or replay risk is controlled.
- Provider health is acceptable.
- Required security credentials have been rotated if compromise was suspected.
- Any customer remediation plan is defined.
- A rollback/re-freeze path is immediately available.

For a live program, high-risk unfreeze should require dual control rather than a single operator acting alone.

## Required exercise before live launch

Run a measured incident drill that records:

- Time from incident decision to freeze activation.
- Time until a transfer attempt is demonstrably blocked.
- Whether protective card controls remain available.
- Whether in-flight provider events continue to reconcile correctly.
- Whether operators can identify all impacted tenants/accounts.
- Time to produce a reconciled incident snapshot.

The readiness endpoint must continue to report `emergencyFreezeResponseTimeVerified: false` until this drill is actually completed in an approved environment.

## Evidence to retain

- Drill date and participants.
- Exact software version/commit.
- Provider/environment used.
- Freeze activation audit event.
- Test request/result evidence.
- Reconciliation results before and after the incident.
- Incident report and corrective actions.

## Production release gate

Do not claim a bank-grade or sponsor-bank-ready kill switch based only on the current environment flag. Live launch requires a partner-approved, measured emergency control with documented ownership, dual-control expectations, monitoring, alerting, and exercised recovery.
