# Galactic Trust — Sandbox Certification Evidence

## Purpose
This document defines the engineering evidence Galactic Trust requires **before** connecting an approved sponsor-bank/BaaS sandbox.

The current certification is intentionally synthetic. It proves application-side invariants without:
- calling a banking provider;
- using provider credentials;
- storing real customer PII;
- creating real deposit accounts;
- moving real money;
- implying bank, FDIC, card-network, or regulatory approval.

The interactive evidence surface is available at `/sandbox-readiness` while Galactic Trust is in demo mode with live writes disabled.

## Synthetic certification flow

1. Create an ephemeral synthetic Galactic customer identifier.
2. Mark a provider-fixture KYC result as `approved_sandbox`.
3. Create an ephemeral synthetic checking-account identifier.
4. Create a synthetic inbound ACH posting for $25.00.
5. Construct a canonical `ach.transfer.posted` event.
6. Sign the event with an ephemeral HMAC secret.
7. Verify the signature using a timing-safe comparison.
8. Ingest the event once.
9. Attempt to ingest the same event again and reject it as a duplicate.
10. Create a balanced double-entry journal:
    - debit `partner_settlement_cash`;
    - credit `customer_deposit_liability`.
11. Reconcile provider-posted amount, customer-liability amount, journal debits, journal credits, and canonical event count.
12. Produce a reviewer-visible pass/fail evidence object.

## Hard safety constraints
The certification engine must fail CI if any of the following change without an explicit review:
- synthetic certification no longer requires `BANKING_MODE=demo` semantics;
- live writes can be enabled while synthetic certification runs;
- the certification engine contains `fetch()`;
- the certification engine reads `process.env`;
- banking or crypto provider API keys appear in the certification engine/client;
- the POST route loses JSON, trusted-origin, or banking-user checks;
- duplicate event rejection is removed;
- double-entry journal balance enforcement is removed;
- reconciliation discrepancy logic is removed;
- the UI stops identifying that no real money moves.

CI runs both:
- `npm run test:safety`
- `npm run test:sandbox`

before the production build.

## Shared ledger invariants
`lib/financial-ledger.ts` is the reusable server-side domain boundary.

Every journal must:
- use integer cents;
- contain at least one line;
- contain exactly one positive debit **or** one positive credit per line;
- keep journal/event references consistent;
- have total debits equal total credits;
- fail closed if the journal does not balance.

The current inbound posted ACH journal records:
- `partner_settlement_cash` debit;
- `customer_deposit_liability` credit.

This is an engineering model and must be reviewed against the selected provider/bank's actual settlement and FBO/program-account structure before production.

## Provider-neutral adapter contract
`lib/banking-provider-adapter.ts` defines the integration contract expected from an approved provider adapter.

Required sandbox capabilities:
- sandbox customer creation;
- sandbox KYC lifecycle;
- sandbox deposit-account creation;
- sandbox ACH;
- signed webhooks;
- idempotent money-moving requests;
- reconciliation data.

Card issuing is intentionally not required for the first provider-sandbox certification loop.

## What synthetic certification DOES prove
- Galactic can represent the intended sandbox customer/account/ACH lifecycle.
- webhook signatures can be verified without returning/persisting the signing secret;
- one provider event maps to one canonical internal processing event;
- replayed duplicate events do not create duplicate ledger postings;
- the journal model is double-entry and fail-closed;
- provider and internal amounts can be reconciled with an explicit discrepancy value;
- the certification path is isolated from production credentials and real-money activation.

## What synthetic certification DOES NOT prove
It does **not** prove:
- provider approval;
- sponsor-bank approval;
- KYC/CIP compliance;
- OFAC/sanctions compliance;
- AML transaction-monitoring compliance;
- FDIC pass-through eligibility;
- ACH/NACHA program approval;
- card-network or issuing-bank approval;
- live dispute/error-resolution readiness;
- durable database/event-inbox behavior under concurrency;
- disaster recovery;
- production security certification;
- legal permission to offer banking services.

## Acceptance criteria for a real provider sandbox
Do not start provider-sandbox certification until:
1. a provider sandbox account/program is approved or explicitly made available for evaluation;
2. provider credentials are stored server-side only;
3. sandbox credentials are completely separate from production credentials;
4. the provider's webhook-signature scheme is documented and implemented;
5. a durable event-inbox/dedupe store is selected;
6. a durable append-only journal/ledger store is selected;
7. provider resource IDs are persisted separately from Galactic IDs;
8. KYC states are mapped to canonical Galactic states;
9. ACH pending/posted/returned/failed states are mapped;
10. reconciliation can compare provider balances/events against Galactic ledger totals;
11. no production/live-money flag is needed to run the provider sandbox;
12. all public UI continues to identify the product accurately as a beta/demo until the regulated program is actually approved.

## Provider-sandbox certification target
The next evidence chain is:

> authenticated sandbox user → provider sandbox customer → provider sandbox KYC → provider sandbox account → provider sandbox ACH → authentic provider-signed webhook → durable event inbox → duplicate replay test → balanced ledger journal → provider/internal reconciliation → audit evidence.

A successful provider-sandbox run still does **not** authorize production. It only satisfies the engineering/certification gate before contractual, compliance, disclosure, legal, and production-approval gates.

## Production gate remains separate
Provider credentials alone must never activate production.

Galactic Trust production banking remains dependent on all of the independent existing controls:
- partner program fully configured;
- banking compliance approval explicitly recorded;
- customer banking disclosures explicitly approved;
- live writes explicitly enabled.

Until all applicable regulatory/contractual and operational requirements are actually complete, keep live writes disabled.
