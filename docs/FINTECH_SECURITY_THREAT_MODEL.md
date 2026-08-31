# Galactic Trust — Fintech Security Threat Model

Status: prototype threat-model baseline  
Scope: white-label tenant boundary, customer sessions, money-movement intents, provider events, operations access, AI support, ledger/reconciliation, and sensitive data  
Live financial activity: disabled

## 1. Security objectives

1. One customer/tenant cannot see or affect another tenant's data or actions.
2. One financial intent creates at most one economic effect.
3. Unknown provider/network outcomes remain unknown until authoritative evidence resolves them.
4. Unauthorized actors cannot create/release/unfreeze money movement.
5. Ledger/audit history cannot be silently rewritten to hide an error or attack.
6. Customer-facing status does not claim success/failure/insurance/terms that are not authoritative.
7. Secrets and Restricted data do not leak into browser code, logs, support chat, or unapproved AI/vendor systems.
8. Protective actions remain available during incidents where safely possible.
9. Operations evidence is protected from public access.
10. Recovery preserves economic correctness, traceability, and customer communication.

## 2. Assets

High-value assets include:

- production banking/provider credentials;
- customer authentication/session material;
- tenant mapping/configuration;
- customer account/transaction records;
- internal ledger and GL journals;
- idempotency keys and financial-intent references;
- provider payment/transfer references;
- webhook signing/verification material;
- KYC/KYB/identity data when introduced;
- fraud/AML/sanctions case data when introduced;
- SAR information when introduced;
- audit evidence;
- operator privileged access;
- emergency freeze/unfreeze controls;
- approved customer-facing fees/rates/disclosures;
- source control/cloud/domain/provider administrative access.

## 3. Trust boundaries

### Customer browser -> Galactic application
Threats: session theft, CSRF/cross-site requests, malicious input, double submission, browser extension/device compromise.

Current prototype controls:
- same-origin mutation checks;
- JSON-only/bounded request bodies;
- client busy-state and in-flight intent dedupe;
- transfer idempotency key;
- no production secrets in browser;
- explicit simulation labels.

Production gaps:
- approved customer identity/session architecture;
- device/account takeover controls;
- distributed abuse/bot protections;
- production monitoring.

### Hostname -> tenant resolver
Threats: query/body tenant override, duplicate domain configuration, unrecognized host routing, domain takeover.

Current controls:
- recognized production host binds to one tenant;
- cross-tenant host mismatch rejected;
- unknown tenant rejected;
- duplicate tenant key/domain config fails closed;
- preview override only local or explicit Vercel preview.

Production gaps:
- domain ownership/verification workflow;
- audited tenant administration;
- DNS/domain registrar hardening and continuity.

### Galactic application -> database/ledger
Threats: unauthorized writes, race conditions, double debit, SQL/API misuse, secret exposure, destructive corrections.

Current controls:
- server-only secret/service credentials;
- direct anon/auth grants revoked for prototype tables;
- simulated-account constraints;
- idempotency uniqueness;
- atomic transfer function;
- append-only GL journals/lines;
- zero-sum journal enforcement;
- independent reconciliation.

Production gaps:
- approved source-of-truth design with provider/sponsor;
- database privileged-access controls;
- backup/PITR evidence;
- production monitoring and anomaly alerts.

### Galactic application -> banking/payment provider
Threats: credential compromise, request replay, provider timeout, duplicate instruction, provider outage, incorrect status, API contract drift.

Required production controls:
- provider-native authentication/signing;
- idempotency based on provider semantics;
- request/response correlation;
- explicit financial-intent state machine;
- timeout != failure;
- authoritative status lookup/webhook/reconciliation;
- credential rotation;
- provider outage/unknown-state drill;
- provider certification.

### Provider -> Galactic webhook/event endpoint
Threats: spoofed events, replay, duplicate/out-of-order delivery, oversized payloads, malicious fields, cross-tenant event injection.

Current prototype:
- sandbox inbox uses a server-side secret;
- bounded payload;
- explicit known tenant;
- deduplication/digest;
- clearly not production verification.

Production requirements:
- exact provider signature verification using raw payload requirements;
- timestamp/replay validation where provider supports/requires it;
- provider account/program/tenant binding;
- duplicate/out-of-order state machine;
- dead-letter/retry;
- immutable event evidence.

### Operator -> operations/control plane
Threats: credential theft, malicious insider, accidental unfreeze, overbroad access, public exposure of audit data.

Current prototype:
- strong minimum shared operator secret;
- signed HttpOnly SameSite=Strict session;
- persistent Operations fails closed without access configuration;
- raw audit metadata not returned to UI.

Production requirements:
- named workforce identities;
- phishing-resistant MFA where appropriate/required;
- RBAC/least privilege;
- high-risk dual control;
- just-in-time elevation;
- break-glass audit/review;
- privileged session monitoring;
- no shared privileged secrets.

### Orbit/customer automation -> customer
Threats: hallucinated terms, incorrect FDIC/rate/fee statements, failure to recognize rights/complaint, SAR disclosure, personalized advice, data collection, automation dead-end.

Current controls:
- deterministic rules;
- explicit automated-support label;
- no third-party LLM customer-data use;
- regulated decision categories disabled;
- machine-readable human escalation;
- sensitive-data refusal;
- Transparency Center disclosures.

Production requirements before generative expansion:
- approved knowledge source;
- vendor/data approval;
- prompt/data leakage testing;
- human handoff availability;
- monitored wrong-answer/escalation failure metrics;
- kill/disable switch with human support fallback.

## 4. Money-movement threats

### Duplicate submit
Attack/failure: repeated tap, app retry, network retry, malicious replay.

Control target:
- stable idempotency key per economic intent;
- database/provider deduplication;
- changed payload with same key rejected;
- reconciliation proves one effect.

### Ambiguous commit
Failure: server/provider accepts instruction but response is lost.

Control target:
- state = pending/unknown;
- reuse original key/reference;
- never submit replacement blindly;
- reconcile to authoritative evidence.

### Provider disappears mid-transfer
Failure: provider API goes offline after submission before terminal status.

Control target:
- preserve submitted intent/reference;
- customer sees accurate pending/unavailable state;
- Operations attention state;
- status lookup/webhook/statement reconciliation when restored;
- no automatic duplicate replacement.

### Credential compromise
Threat: attacker gains provider/API credential.

Control target:
- emergency money-movement freeze independent of normal deploy path;
- credential revoke/rotate;
- provider-side pause if supported;
- enumerate in-flight instructions;
- reconcile before unfreeze;
- dual-control unfreeze.

### Ledger manipulation
Threat: attacker/bug changes balances/history directly.

Control target:
- append-only journal;
- forward/reversing correction;
- least privilege;
- audit trail;
- transaction-history vs balance and GL vs balance reconciliation;
- provider statement/balance reconciliation in live program.

## 5. Tenant-isolation threats

Test:

- tenant A hostname + tenant B query/body;
- unknown tenant key;
- duplicate configured domains;
- duplicate tenant keys differing only by case;
- unrecognized production hostname;
- preview/production environment confusion;
- authenticated server event targeting another tenant;
- direct database query missing tenant scope;
- operator switching tenant without authorization.

A single cross-tenant read/write is Severity 1 until proven otherwise.

## 6. Customer-status integrity threats

Do not let UI copy become an attack surface for false financial state.

Customer-facing status must not infer:

- transfer failure from timeout;
- transfer success from request acceptance alone;
- reversal before authoritative confirmation;
- FDIC/deposit-insurance coverage from branding;
- fee/rate/APY from stale memory;
- complaint/dispute case creation if no case exists;
- fraud reimbursement before authorized decision.

Approved dynamic terms need versioned source-of-truth data.

## 7. Sensitive-data threats

Prohibit Restricted data in:

- general support chat;
- client logs;
- analytics events;
- error messages;
- source code;
- GitHub issues/PR descriptions;
- CI output;
- third-party AI prompts without explicit approved design.

Test redaction/failure modes for:

- request bodies;
- headers/cookies;
- provider webhook payloads;
- audit metadata;
- database errors;
- screenshots/support attachments.

## 8. Availability and resilience threats

Scenarios:

- application outage;
- database outage;
- provider outage;
- DNS/domain compromise/outage;
- identity provider outage;
- webhook delay/backlog;
- compromised deployment;
- bad migration;
- region failure;
- support/case-system outage;
- AI/vendor outage.

Controls must define what becomes read-only, unavailable, queued, or manually handled. Never convert an infrastructure outage into an assumed financial outcome.

## 9. Threat-driven drills

Required before live launch where applicable:

- duplicate transfer replay;
- response lost after commit;
- provider disappears after intent acceptance;
- spoofed/duplicate/out-of-order webhook;
- cross-tenant request;
- compromised provider credential + kill switch;
- customer-visible incident communication timing;
- database restore/PITR + provider-event catch-up;
- bad migration recovery;
- account takeover simulation;
- operator credential compromise;
- unauthorized unfreeze attempt;
- AI hallucinated fee/FDIC/rate statement;
- AI SAR disclosure attempt;
- sensitive-data prompt injection/exfiltration attempt;
- human-support handoff failure.

## 10. Severity guide

### Severity 1
Potential/actual unauthorized money movement, cross-tenant exposure, Restricted data breach, ledger integrity loss, SAR exposure, production credential compromise, inability to establish financial state.

### Severity 2
Material outage/degradation, reconciliation mismatch without known loss, failed required support escalation, inaccurate regulated customer communication with potential harm.

### Severity 3
Localized defect with low immediate customer/regulatory impact but requiring remediation.

Final production severity definitions and notification obligations must be approved with the actual program.

## 11. Evidence and ownership

Every high-risk threat must map to:

- named owner;
- preventive control;
- detective control;
- response control;
- test/drill;
- retained evidence;
- residual risk decision;
- production release gate.

A control documented but never exercised is not treated as verified.
