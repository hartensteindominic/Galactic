# Galactic Trust — Sponsor-Bank Ready Architecture

## Purpose
This document describes the target architecture for Galactic Trust's regulated banking integration while preserving the current fail-closed demo mode.

Galactic Trust is the customer-facing fintech application. The selected sponsor bank / BaaS provider remains the authoritative regulated system for customer accounts, money movement, card issuance, and other services assigned to it under the final program agreement.

## Current application boundary

```text
Customer browser
     |
     v
Galactic Trust Next.js UI
     |
     +--> /api/banking/status --------> fail-closed readiness state
     |
     +--> /api/banking/summary -------> demo summary OR partner gateway
     |
     +--> /api/banking/transfers -----> auth + trusted-origin + idempotency
     |
     +--> /api/banking/cards/freeze --> auth + trusted-origin
     |
     +--> /api/crypto/* --------------> separate crypto boundary
     |
     v
Server-only Galactic provider adapter
     |
     +--> independent compliance/disclosure/live gates
     +--> server-only provider credentials
     +--> program ID / approved partner configuration
     |
     v
Selected regulated provider / sponsor-bank APIs
```

## Existing fail-closed controls
The current banking adapter defaults to demo mode unless `BANKING_MODE=partner` is explicitly configured.

Partner mode is not sufficient to enable writes. Live banking requires:
- complete provider configuration;
- explicit compliance approval;
- explicit customer-disclosure approval;
- explicit live-write approval.

Crypto uses an equivalent independent gate and should remain operationally separate from deposit banking.

## Authentication boundary
In demo mode, the application uses a fixed demo customer identity.

In future partner mode:
- Galactic Trust must receive a verified application session from the production identity provider;
- the banking API boundary uses a short-lived signed user assertion;
- the signing secret is server-only;
- invalid, missing, or expired assertions fail closed;
- provider credentials must never be sent to the browser.

Before live launch, this application assertion should be bound to the production authentication/session stack and tested for replay, logout, user switching, expiration, and privilege changes.

## Money-moving request pattern
Every live write should follow this sequence:

```text
1. User explicitly initiates action
2. UI confirms amount / destination / important fees or timing
3. Server verifies authenticated Galactic customer
4. Server verifies trusted request origin
5. Server verifies live-readiness gates
6. Server validates amount, account, limits and provider-specific inputs
7. Server attaches a unique idempotency key
8. Provider receives the request
9. Galactic records provider request/reference ID
10. UI initially displays provider-returned pending state
11. Signed webhook / later provider read confirms authoritative state
12. Reconciliation verifies Galactic reference state against provider state
```

The AI assistant must never bypass steps 1–7 or independently authorize customer money movement.

## Target webhook architecture
The current sponsor-bank package defines webhooks as a required next implementation before any live program.

Target flow:

```text
Provider
  |
  | signed event
  v
/api/provider/webhooks/<provider>
  |
  +--> verify signature using server secret/public verification method
  +--> validate timestamp / replay window
  +--> require unique provider event ID
  +--> persist raw normalized event reference
  +--> return provider-required acknowledgement quickly
  |
  v
Event processor
  |
  +--> map provider account/customer/transaction IDs
  +--> apply idempotently
  +--> update application-facing status
  +--> open reconciliation exception if state is inconsistent
  +--> append audit record
```

No webhook should be trusted only because it comes from a known IP unless the provider explicitly requires that as an additional control. Signature/event verification remains required where supported.

## Ledger model
The regulated provider/bank ledger is authoritative for real customer balances and settlement state.

Galactic Trust may maintain an application mirror/event ledger for:
- user-facing pending/posted presentation;
- operational reporting;
- support investigations;
- idempotency and duplicate suppression;
- reconciliation evidence;
- audit trails.

The application mirror must never silently create money or override an unexplained provider mismatch.

## Reconciliation model
Before live launch, implement at least:
- webhook/event completeness checks;
- provider transaction/reference matching;
- account balance comparison;
- duplicate detection;
- missing-event detection;
- unresolved-exception queue;
- daily close report;
- human escalation path;
- immutable evidence of who resolved each exception and why.

For high-risk mismatches, fail closed on new money movement until the incident is understood when required by the approved operating procedure.

## Customer funds separation
Galactic Trust company operating funds must not be mixed with customer funds.

Customer funds must be held only in the selected provider/sponsor-bank structure approved for the program. If the final program uses FBO/omnibus structures, recordkeeping and reconciliation must follow the bank/provider's exact requirements.

## KYC / sanctions / fraud boundary
The future live architecture must consume approved provider/risk decisions for:
- CIP/KYC identity verification;
- watchlist/OFAC screening;
- sanctions/geography restrictions;
- fraud/device risk;
- transaction monitoring;
- manual review;
- account restriction/closure.

Galactic Trust can provide application context but must not let Orbit or ordinary UI code override a regulated decline/restriction decision.

## Card data boundary
Galactic Trust should minimize PCI scope by using the provider's approved secure components/tokenization wherever possible.

The current demo intentionally does not expose PAN, CVV, PIN, or real card credentials. Future live-card screens should avoid routing sensitive card data through Galactic Trust servers unless the final card architecture explicitly requires it and the corresponding PCI controls are in place.

## Provider adapter contract
The provider-specific implementation should sit behind a stable Galactic interface rather than leaking vendor semantics into the UI.

Target logical operations:
- `getReadiness()`
- `createOrGetCustomer()`
- `getAccounts()`
- `getTransactions()`
- `createTransfer()`
- `setCardFrozen()`
- `getCards()`
- `verifyWebhook()`
- `normalizeWebhook()`
- `getAuthoritativeBalance()`
- `getAuthoritativeTransaction()`

This allows Galactic Trust to evaluate or migrate providers without rebuilding the entire product.

## Environment separation
Maintain distinct environments:

### Demo
- no provider credentials required;
- simulated balances and actions only;
- public beta can operate here.

### Provider sandbox
- sandbox credentials only;
- pretend/simulated provider money;
- webhook and reconciliation certification;
- no production customer claims.

### Production
- production credentials issued only after provider/bank approval;
- counsel-approved disclosures loaded;
- compliance and disclosure gates approved independently;
- live-write flag enabled only during a documented go-live change.

A production credential alone must never automatically switch the app into live-money mode.

## Required evidence before production
1. Sponsor bank / provider agreement executed.
2. Responsibility matrix approved.
3. Counsel-approved customer agreements and disclosures.
4. KYC/CIP/OFAC/AML/fraud flow certified.
5. Sandbox end-to-end test passed.
6. Signed webhook replay/idempotency tests passed.
7. Reconciliation and exception handling tested.
8. Dispute/error-resolution process tested.
9. Incident response and support escalation tested.
10. Production secrets configured outside source control.
11. Production readiness page shows every required gate approved.
12. Explicit go-live approval recorded.

Until all applicable evidence exists, Galactic Trust remains demo/sandbox only.
