# Galactic Trust — Sponsor-Bank / BaaS Diligence Packet

## 1. Executive summary
Galactic Trust is a consumer-facing financial-technology interface currently operating as a compliance-safe demo/beta. It is **not a chartered bank** and does not currently hold customer deposits, issue live cards, transmit customer money, make loans, or custody/trade crypto for customers.

The product goal is to deliver a simple mobile-first financial dashboard while regulated banking services are provided by an approved sponsor bank and/or banking-as-a-service infrastructure provider under a reviewed program agreement.

### Proposed initial regulated feature scope
Phase 1 only:
- consumer onboarding and identity verification;
- deposit account access through a sponsor bank program;
- ACH funding and transfers;
- debit card issuing/controls through the approved program;
- transaction history, balances and notifications;
- customer support, disputes and error-resolution workflows;
- automated ledger reconciliation and operational audit trails.

Not in initial live scope:
- lending or credit underwriting;
- crypto custody/trading by Galactic Trust;
- investment advice or securities;
- guaranteed yield or return claims;
- autonomous movement of customer money by AI.

## 2. Product boundary
Galactic Trust owns:
- user experience and application UI;
- application authentication/session boundary;
- orchestration of approved provider APIs;
- customer-facing status, alerts and support routing;
- internal application ledger references and reconciliation evidence;
- security controls, audit logs and incident coordination;
- disclosure presentation exactly as approved by the bank/provider/counsel.

The regulated partner is expected to own or approve, depending on program structure:
- deposit-account issuance and custody of customer funds;
- bank account/routing number issuance;
- ACH/wire/RTP/FedNow access offered by the program;
- card issuance/BIN sponsorship and network requirements;
- required KYC/CIP/KYB/OFAC/AML program responsibilities;
- regulated statements/notices and applicable bank disclosures;
- suspicious-activity escalation responsibilities;
- program limits, prohibited use cases and approval policies;
- final live-production certification.

No responsibility should be assumed from this document. The final responsibility matrix must be contractually agreed with the selected bank/provider and reviewed by qualified counsel.

## 3. Current engineering posture
The application currently defaults banking and crypto to demo mode.

Live banking requires independent server-side gates:
1. partner configuration is complete;
2. compliance approval flag is explicitly enabled;
3. customer-disclosure approval flag is explicitly enabled;
4. live-write flag is explicitly enabled.

Live crypto has an equivalent independent provider/compliance/disclosure/live-trading gate.

Additional current controls:
- partner credentials stay server-side;
- customer banking requests require a signed short-lived authentication boundary in partner mode;
- transfer writes require idempotency keys;
- untrusted browser origins are rejected on money-changing routes;
- card PAN/CVV/PIN are not exposed in the current client;
- safety regression tests prevent accidental removal of key fail-closed controls;
- CI requires typecheck, safety checks and a production build before main-branch production deployment.

## 4. Proposed customer journey
### A. Public beta
1. User opens Galactic Trust.
2. All balances, transactions, cards and crypto are explicitly shown as demo/sample data.
3. No real financial account is created.
4. No customer money is accepted.

### B. Future provider sandbox
1. User creates/authenticates a Galactic Trust test session.
2. Application sends the customer through provider-approved sandbox identity/KYC flow.
3. Provider returns a sandbox customer/account identifier.
4. Galactic Trust stores only the minimum identifiers needed to display and reconcile the sandbox state.
5. Simulated ACH/card events arrive through signed webhooks.
6. Galactic Trust records events, applies idempotency/replay protection, reconciles provider state, and updates customer-visible status.

### C. Future live program
Same general sequence as sandbox, but only after:
- direct provider/bank approval;
- completed contracts/diligence;
- counsel-approved terms/privacy/disclosures;
- compliance responsibilities assigned;
- certification/UAT completed;
- production credentials issued;
- all Galactic live-readiness flags approved independently.

## 5. Customer-funds model
Galactic Trust should **not** pool customer deposits in an ordinary Galactic Trust operating account.

For a deposit-account program, customer funds should be held under the selected sponsor-bank/program structure. Any FBO or omnibus model must be implemented exactly according to the bank/provider's approved architecture, including ownership records, reconciliation and applicable pass-through insurance requirements.

Galactic Trust operating funds and customer funds must remain operationally and legally separated.

## 6. Ledger and reconciliation model
The provider/bank system of record remains authoritative for regulated account balances and settlement state.

Galactic Trust should maintain an application-level event/ledger mirror for:
- user-facing pending/posted state;
- idempotency and duplicate suppression;
- operational reporting;
- reconciliation evidence;
- support/dispute investigations;
- immutable audit references.

Minimum reconciliation expectations:
- ingest all signed provider events;
- store unique provider event IDs;
- reject or safely ignore replayed events;
- periodically compare provider balances/transactions against Galactic references;
- record mismatches with severity and ownership;
- prevent silent auto-correction of unexplained balance differences;
- daily close report for live programs;
- manual escalation path for unresolved differences.

## 7. KYC/CIP, sanctions and fraud model
Before live onboarding, the selected bank/provider must define the approved identity and risk stack.

Required capabilities or assigned responsibilities should include:
- identity verification / CIP;
- OFAC/watchlist screening;
- sanctions and prohibited-jurisdiction checks;
- fraud/device/risk screening;
- transaction monitoring;
- ACH return and unauthorized-activity monitoring;
- manual-review workflow;
- account restriction/freeze/closure workflow;
- suspicious-activity escalation to the responsible regulated party;
- record-retention requirements.

Galactic Trust's application must consume provider decisions rather than override regulated risk decisions from an AI assistant.

## 8. Disputes, errors and complaints
The live program must document:
- customer support ownership and hours;
- unauthorized-transfer reporting;
- debit-card dispute intake;
- ACH return/error handling;
- Regulation E and other applicable error-resolution procedures as assigned by counsel/program documents;
- complaint logging, severity and escalation;
- bank/provider visibility into complaints;
- required customer notices and timing.

The current demo does not represent these workflows as live regulated services.

## 9. Security expectations
Before live money:
- MFA or equivalent strong customer authentication;
- secure session management and short-lived privileged requests;
- least-privilege provider credentials;
- secret management outside source control;
- signed provider webhooks with replay defense;
- rate limiting and abuse controls;
- immutable/append-only security and money-movement audit records;
- incident-response runbook;
- vulnerability/dependency monitoring;
- backup and recovery procedures;
- documented access-review process;
- vendor and subprocessors inventory;
- privacy/data-retention schedule.

## 10. Crypto separation
Crypto should remain a separate product boundary from deposit banking.

Until an approved crypto provider and legal structure are in place:
- all crypto UI remains simulated;
- Galactic Trust does not custody customer private keys;
- Galactic Trust does not execute real customer crypto orders;
- banking balances must not be represented as interchangeable with crypto holdings;
- no crypto yield or guaranteed-return claim is made.

## 11. AI assistant boundary
Orbit may explain product features, statuses and general support information.

Orbit must not:
- ask for passwords, PINs, CVVs, one-time codes, recovery phrases or private keys;
- independently approve or initiate regulated money movement;
- override KYC, sanctions, fraud or account-restriction decisions;
- provide guarantees of investment returns, approval, deposit insurance, or legal status.

## 12. Questions for each candidate provider
1. Which sponsor bank(s) would be proposed for our initial consumer program?
2. Are New York residents supported for the proposed program?
3. What customer segments/use cases are prohibited?
4. Who owns CIP/KYC, OFAC, AML monitoring and suspicious-activity escalation?
5. What are minimum monthly fees, implementation fees, reserves and transaction minimums?
6. Which account types and deposit-insurance disclosures are available?
7. Which ACH, wire, RTP/FedNow and card capabilities are supported?
8. Who manages disputes, returns, fraud losses and customer support?
9. What webhook signing, retries, event replay and reconciliation tooling is available?
10. What sandbox/certification test plan is required before production?
11. What SOC/PCI/security documentation is available for diligence?
12. What is the realistic approval-to-production timeline for our current scope?

## 13. Requested next milestone
The immediate goal is **provider sandbox certification**, not production money movement.

Target sandbox proof:

> test customer -> provider-approved sandbox KYC -> sandbox account -> simulated ACH -> signed webhook -> idempotent event ingestion -> reconciliation -> customer-visible status -> complete audit record.

Only after that proof and all business/legal approvals should a production enablement plan be considered.
