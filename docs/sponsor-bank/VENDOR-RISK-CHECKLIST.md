# Galactic Trust — Vendor & Subprocessor Risk Checklist

## Purpose
Use this checklist before Galactic Trust sends regulated financial functionality, customer data, restricted credentials, or critical operational dependencies to a third party.

This is a diligence framework, not approval of any specific sponsor bank, BaaS platform, crypto provider, identity vendor, database vendor, hosting provider, fraud provider, analytics platform, or subprocessor.

## Vendor categories
Evaluate vendors by role, including where applicable:
- sponsor bank / insured depository institution;
- banking-as-a-service / program-management platform;
- ACH/payment processor;
- card issuer/processor/network interface;
- KYC/KYB/identity verification provider;
- sanctions/OFAC screening provider;
- AML/transaction-monitoring provider;
- fraud/device-risk provider;
- crypto trading/custody provider;
- cloud hosting/deployment provider;
- database/backup provider;
- email/SMS/notification provider;
- customer support provider;
- analytics/observability provider;
- security/testing vendor.

## 1. Business and legal identity
Record:
- exact legal entity name;
- headquarters and relevant operating jurisdictions;
- contracting entity;
- ownership/parent where relevant;
- years in operation;
- financial/operational viability considerations;
- primary service owner;
- escalation contact.

Do not infer regulatory status from branding or marketing language.

## 2. Regulatory/program role
For financial providers, verify from current authoritative materials and contracts:
- whether the vendor is a bank, nonbank platform, agent, processor, money transmitter, custodian, broker, or other role;
- sponsor-bank identity and responsibilities where applicable;
- state/geographic restrictions;
- New York availability/limitations;
- account/deposit ownership model;
- funds-flow role;
- customer agreement party;
- card issuer/processor roles;
- ACH ODFI/RDFI responsibilities where relevant;
- crypto regulatory/licensing responsibilities where relevant.

Do not describe Galactic Trust as licensed/insured merely because a vendor is regulated.

## 3. Product capability
Confirm exact sandbox and production support for the features actually proposed:
- customer creation;
- KYC/CIP/KYB;
- account creation;
- ACH credits/debits;
- wires/RTP/FedNow if relevant later;
- cards if relevant later;
- transaction states/returns/reversals;
- account freezes/restrictions;
- disputes/error resolution;
- fraud controls;
- transaction limits;
- statements/tax documents;
- webhook/event history;
- reconciliation exports/balance APIs;
- idempotency;
- sandbox fixtures;
- support/escalation.

A missing reconciliation or event-history capability is a material architecture risk.

## 4. Security diligence
Request/review as appropriate:
- security program overview;
- SOC 2 Type II or equivalent independent assurance, if available;
- penetration-test program;
- vulnerability-management process;
- encryption in transit/at rest;
- key/secret management;
- privileged-access controls/MFA;
- employee access review;
- secure software-development lifecycle;
- incident-response process;
- breach/incident notification commitments;
- business continuity/disaster recovery;
- backup/restore testing;
- logging/audit capabilities;
- data segregation/multitenancy controls.

Treat certifications as evidence, not a substitute for evaluating the actual service and integration.

## 5. Data inventory
Before integration, document:
- data categories sent to vendor;
- data returned by vendor;
- whether SSN/TIN/government ID is involved;
- whether full account/routing/card data is involved;
- whether biometric/selfie data is involved;
- webhook payload contents;
- logs/analytics generated;
- data hosting regions;
- subprocessors that receive the data.

Prefer provider-hosted/tokenized collection of highly sensitive identity/payment data where the approved program supports it.

## 6. Retention and deletion
Confirm:
- default retention;
- configurable retention;
- deletion procedure;
- backup retention;
- post-termination deletion/return;
- legal/regulatory record exceptions;
- test/sandbox data retention;
- subprocessor deletion behavior.

Galactic Trust's privacy notice and retention schedule must match the actual vendor behavior.

## 7. Subprocessors
Record:
- subprocessor list;
- notification/change mechanism;
- important hosting/identity/payment subprocessors;
- geographic locations;
- contractual flow-downs for security/privacy;
- objection/termination rights where relevant.

A vendor must not become an untracked path for restricted data.

## 8. Reliability and continuity
Review:
- published uptime/SLA;
- status page;
- incident history where available;
- maintenance model;
- rate limits;
- API timeout/retry guidance;
- webhook retry behavior;
- regional redundancy;
- backup/PITR capabilities;
- recovery commitments;
- customer support escalation.

Design Galactic retries/idempotency around documented behavior rather than assumptions.

## 9. Webhook/event controls
For provider event sources, confirm:
- signature algorithm;
- timestamp/replay mechanism;
- key rotation;
- event IDs and uniqueness guarantees;
- ordering guarantees/non-guarantees;
- retry schedule;
- event-history/replay API;
- payload versioning;
- test fixtures;
- return/reversal event semantics.

Galactic Trust should normalize provider-specific events behind the private gateway rather than exposing them directly to the ledger/UI.

## 10. Reconciliation
Confirm what authoritative evidence the vendor provides:
- account balances;
- transaction/transfer ledger;
- settlement reports;
- return/reversal data;
- daily extracts;
- event history;
- timestamps/timezones;
- identifiers that join API objects to reports.

A provider-sandbox certification should prove provider-vs-Galactic reconciliation before production review.

## 11. Commercial/financial risk
Document:
- setup/implementation fees;
- minimum monthly spend;
- per-account/transaction/card fees;
- reserve/prefund requirements;
- fraud/loss allocation;
- chargeback/dispute fees;
- termination fees;
- pricing-change rights;
- settlement/funding requirements;
- insurance requirements.

Do not design customer pricing until actual program economics are known.

## 12. Contract controls
Review with appropriate counsel/personnel:
- service description;
- regulatory responsibilities;
- security obligations;
- data-processing terms;
- confidentiality;
- audit/assessment rights;
- incident notification;
- SLA/support;
- indemnity/liability;
- IP/data ownership;
- subcontracting;
- termination/transition assistance;
- record retention;
- regulatory access/cooperation;
- business continuity.

## 13. Exit/portability
Before depending on a critical vendor, understand:
- data export format;
- event/history export;
- customer/account migration constraints;
- token/credential portability;
- transition assistance;
- post-termination data access;
- customer communication obligations;
- regulator/sponsor-bank approval needs.

Avoid an architecture that makes basic ledger/audit evidence impossible to export.

## 14. Sandbox acceptance evidence
Before promoting a vendor from evaluation to technical candidate, capture non-secret evidence for:
- API authentication;
- idempotent customer/account/ACH creation;
- KYC sandbox fixtures;
- signed webhook verification;
- webhook duplicate replay;
- ACH posting;
- ACH return;
- provider-vs-ledger account reconciliation;
- operational recovery;
- provider support/escalation exercise where practical.

Use `SANDBOX-EVIDENCE-TEMPLATE.md` and do not include secret values.

## 15. Approval outcome
Record one status:
- `research_only`
- `sandbox_candidate`
- `sandbox_approved_for_testing`
- `contract_review`
- `production_candidate`
- `rejected`

Record the reason, reviewer/owner, date, and open conditions.

No vendor may be treated as a production banking partner solely because its sandbox integration works.
