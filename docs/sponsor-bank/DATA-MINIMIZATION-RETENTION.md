# Galactic Trust — Data Minimization & Retention Framework

## Purpose
This document defines the current engineering posture for minimizing, classifying, retaining, and deleting Galactic Trust data. It is a design/control framework for the public beta and future provider-sandbox work, not a final legally approved privacy/record-retention schedule.

Final production retention requirements must be reconciled with the actual sponsor-bank/provider contracts, applicable banking/AML/consumer/privacy obligations, litigation holds, security requirements, and approved privacy notices.

## General rule
Collect and retain **only what the approved product flow needs**, for only as long as an approved purpose requires.

Do not collect sensitive data merely because it may be useful later.

## Current public demo/synthetic posture
The current public beta/synthetic certification should not require:
- SSN;
- passport/driver-license images;
- full bank account/routing numbers;
- card PAN/CVV/PIN;
- passwords or OTP codes;
- recovery phrases/private keys;
- raw production KYC documents.

Synthetic certification records are ephemeral test objects unless explicitly captured as non-secret engineering evidence.

## Data classification

### Class 0 — Public
Examples:
- public product copy;
- public compliance/beta notices;
- public provider names after an approved public relationship exists;
- documentation intended for public distribution.

Handling:
- may be stored in Git if appropriate;
- no special confidentiality requirement beyond integrity/change control.

### Class 1 — Internal operational
Examples:
- non-secret Git SHAs;
- CI run IDs;
- migration versions/checksums;
- non-sensitive incident IDs;
- sandbox run IDs;
- bounded error codes;
- reconciliation IDs;
- audit IDs.

Handling:
- internal access as needed;
- suitable for non-secret diligence evidence where approved.

### Class 2 — Confidential financial/operational metadata
Examples:
- provider resource identifiers;
- sandbox customer/account/transfer identifiers;
- account-level reconciliation amounts;
- provider webhook event identifiers;
- operational queue details;
- provider support/case identifiers.

Handling:
- restrict access;
- do not expose in public/client surfaces unless explicitly approved;
- diligence sharing only when needed and permitted.

### Class 3 — Restricted secrets/security credentials
Examples:
- provider API keys;
- webhook signing secrets;
- operator HMAC secrets;
- database URLs/passwords;
- Vercel/GitHub deployment tokens;
- private keys/seed phrases;
- session signing secrets.

Handling:
- secret manager/environment only;
- never Git;
- never ordinary logs;
- never screenshots/tickets/chat;
- rotate on suspected exposure.

### Class 4 — Restricted customer identity/authentication data
Examples in a future approved program:
- SSN/TIN;
- date of birth where regulated identity verification requires it;
- government ID documents;
- biometric/selfie verification artifacts;
- full bank account/routing numbers;
- PAN/CVV/PIN;
- authentication factors/recovery codes.

Handling:
- prefer provider-hosted/tokenized collection where feasible;
- avoid Galactic storage if the provider can hold/process it;
- strict least privilege;
- encryption and access logging;
- approved retention/deletion schedule required before production.

## Storage boundaries

### Git repository
Allowed:
- source code;
- migration schemas;
- documentation;
- configuration key **names**;
- non-secret examples/placeholders.

Prohibited:
- real credentials;
- production customer PII;
- raw KYC files;
- private keys;
- database backups/dumps;
- webhook secrets;
- operator secrets.

### Environment/secret manager
Use for:
- API keys;
- DB connection strings;
- HMAC/webhook secrets;
- production/sandbox program secrets.

Secret values should not be echoed into logs or client bundles.

### Banking database
Provider sandbox currently expects durable storage for:
- canonical provider event metadata;
- accounting journals/lines;
- resource mappings;
- reconciliation records;
- audit records;
- processing lease/retry metadata;
- one-time operator request identifiers/hashes.

The current schema should not be treated as approval to store raw KYC documents or sensitive identity attributes.

## Raw webhook policy
The durable provider event record stores the normalized canonical event, not the raw signed request body.

Raw provider webhook bodies should not be retained by default merely for convenience. If a future provider/program requires raw event retention:
- identify the exact requirement;
- redact/minimize where feasible;
- classify the data;
- define access controls;
- define retention/deletion;
- ensure logging systems do not become an uncontrolled duplicate data store.

## Application logging
Default logs should contain:
- bounded error code;
- request/trace/event IDs where appropriate;
- environment;
- timing/status information.

Logs should avoid:
- provider API keys;
- DB URLs;
- raw Authorization headers;
- HMAC signatures;
- raw webhook bodies;
- SSNs;
- full account/routing/card values;
- PIN/CVV/OTP/password/recovery secrets;
- raw KYC documents.

## Audit records
Audit records should capture who/what/when/which resource/action, but avoid duplicating unnecessary sensitive values.

Examples:
- operator ID is acceptable for privileged-action accountability;
- record resolution-note length in general audit metadata when the full resolution note already exists in the reconciliation record;
- use IDs instead of embedding provider/customer payloads.

Audit history is append-only in the current banking database design.

## Accounting records
Ledger journals/lines are append-only. Accounting correction is represented with new compensating entries, not mutation/deletion of historical records.

Retention requirements for actual production accounting/payment records must be defined with the sponsor bank/provider and legal/compliance teams before production.

## Operator replay records
One-time operator request replay records intentionally store:
- request ID;
- environment;
- operator ID;
- request path;
- body SHA-256 hash;
- signed timestamp;
- receipt/expiry timestamps.

They intentionally do **not** store:
- operator signing secret;
- HMAC signature;
- raw request body.

Current engineering retention is 24 hours. Production policy must validate this against the final privileged-access/security design.

## Provider sandbox evidence package
Evidence should use identifiers and status facts, not secret values or raw PII.

Allowed examples:
- Git SHA;
- migration checksum;
- provider sandbox name;
- run/event/journal/reconciliation/audit IDs;
- bounded discrepancy cents;
- PASS/FAIL statuses.

Exclude:
- provider credentials;
- DB URL/password;
- operator/webhook secret;
- HMAC signature;
- raw KYC documents;
- full account/routing/card values.

## Retention schedule — engineering placeholder
The following is **not a final legal schedule**. It defines engineering categories that must receive approved durations before production:

| Data category | Current engineering posture | Production requirement |
| --- | --- | --- |
| Public demo synthetic objects | ephemeral/minimized | N/A unless retained as test evidence |
| Provider sandbox events/ledger | retain for sandbox test/audit continuity | set approved financial/operational retention |
| Sandbox reconciliation/audit | retain for diligence/test history | set approved compliance/record schedule |
| Operator replay IDs | 24 hours currently | security team/program approval |
| Application logs | minimize; avoid restricted data | approved log retention/access policy |
| Real KYC/identity data | not part of current Galactic storage design | provider/program/legal privacy schedule |
| Production payment/accounting records | not active | sponsor-bank/provider/legal retention schedule |

## Deletion
Deletion must respect:
- accounting/audit append-only requirements;
- provider/bank record obligations;
- AML/KYC record requirements where applicable;
- disputes/complaints/investigations;
- legal holds;
- privacy deletion rights/exceptions;
- security incident evidence preservation.

Do not add a generic “delete all customer data instantly” control without mapping these obligations first.

## Access control expectations before production
Define:
- role inventory;
- least-privilege access;
- MFA requirements;
- privileged approval paths;
- joiner/mover/leaver process;
- access review cadence;
- database/admin audit logging;
- break-glass access with post-use review.

The current sandbox operator HMAC/allowlist is an engineering certification control, not the final production workforce-identity model.

## Vendor/subprocessor review
Before sending Class 2–4 data to a vendor/provider, record:
- purpose;
- data categories;
- hosting/geography;
- encryption controls;
- access model;
- retention/deletion;
- incident notification;
- subprocessors;
- contract/DPA/security terms;
- regulatory/program approval where required.

## Launch gate
Production launch is blocked until:
- final data inventory exists;
- actual sponsor-bank/provider responsibilities are mapped;
- privacy notice matches real collection/use/sharing;
- retention schedule is approved;
- restricted-data access controls are implemented;
- incident/breach escalation process is approved;
- vendors/subprocessors are reviewed;
- customer support/dispute workflows handle data safely.

This framework is an engineering and diligence document, not a final privacy notice or legal opinion.
