# Galactic Trust — Data Classification and Retention Map

Status: prototype baseline; production values require program-specific legal/privacy/security approval  
Purpose: define what data exists, where it may flow, who may access it, and what must never enter general AI/chat systems.

## Classification levels

### Public
Information approved for public release.

Examples:
- marketing copy;
- public product status;
- public help content;
- approved public disclosures.

### Internal
Non-public operational information that does not contain customer financial/identity data.

Examples:
- internal runbooks;
- architecture diagrams;
- vendor inventory without credentials;
- non-sensitive test plans.

### Confidential
Business, security, or customer information that requires authorized access and protection.

Examples:
- audit evidence;
- internal incident details;
- provider identifiers;
- customer support case metadata;
- transaction/account records once live.

### Restricted
Highest sensitivity. Exposure can create material customer, regulatory, security, or legal risk.

Examples:
- passwords/PINs/CVVs/OTPs/recovery codes;
- private keys/API secrets;
- full account/card numbers;
- Social Security/tax identifiers;
- identity documents and biometrics;
- SARs and information revealing the existence of a SAR;
- highly sensitive compliance/investigation notes;
- production signing/credential material.

## Prototype data map

| Data category | Prototype status | Classification | Browser allowed? | General Orbit chat allowed? | Third-party generative AI allowed? | Current retention posture |
|---|---|---|---|---|---|---|
| Synthetic balances/accounts | Simulated | Internal | Yes, tenant-scoped | Do not paste raw records | No customer data exists; avoid unnecessary transfer | Memory/Supabase demo only |
| Synthetic transactions | Simulated | Internal | Yes, tenant-scoped | Avoid raw bulk records | No | Prototype only |
| Synthetic cash-flow items/goals | Simulated | Internal | Yes, tenant-scoped | Avoid raw bulk records | No | Prototype only |
| Sanitized linked-account metadata | Sandbox/synthetic | Internal/Confidential | Sanitized subset only | No account credentials | No | Prototype only |
| Plaid Sandbox access token | Sandbox secret | Restricted | Never | Never | Never | Not returned/persisted by prototype |
| Supabase secret/service key | Server credential | Restricted | Never | Never | Never | Environment/secret manager only |
| Prototype webhook secret | Server credential | Restricted | Never | Never | Never | Environment/secret manager only |
| Prototype operator secret | Server credential | Restricted | Password entry to protected endpoint only; not stored in client state | Never | Never | Environment/secret manager only |
| Operator session token | Authentication | Restricted | HttpOnly cookie only; inaccessible to JS | Never | Never | Max 8-hour prototype session |
| Orbit message | General support text | Internal/possible Confidential depending user input | Yes | This is the message itself | Current prototype does not send it to a third-party LLM | Not intentionally persisted in prototype DB |
| Audit event sanitized fields | Operational evidence | Confidential | Protected Operations UI | No | No | Persistent demo if Supabase configured |
| Audit raw metadata | Operational evidence | Confidential/Restricted depending content | Not returned to browser | Never | No | Server-side DB only |
| Provider sandbox event payload digest | Operational | Internal/Confidential | Sanitized status only | No | No | Persistent demo if configured |

## Future live-data map — default restrictions

The following categories do not exist as live customer data in the current prototype. If introduced, they require a program-approved data flow and retention schedule.

| Future category | Classification | General chatbot | Third-party AI default | Minimum control expectation |
|---|---|---|---|---|
| Customer PII/contact data | Confidential | Avoid except minimal non-sensitive context | Disabled pending approval | Purpose limitation, access control, encryption, retention/deletion |
| Full account/routing/card data | Restricted | Prohibited | Prohibited by default | Tokenization/masking, PCI/provider controls as applicable |
| SSN/TIN/government identifiers | Restricted | Prohibited | Prohibited by default | Protected KYC flow only |
| Identity documents/biometrics | Restricted | Prohibited | Prohibited by default | Approved identity provider, encryption, strict retention |
| Live transactions/balances | Confidential | Only through authenticated authoritative product surfaces; not pasted into general chat | Disabled pending approval | Tenant/user authorization, minimization, logging controls |
| Fraud case data | Confidential/Restricted | Escalation only | Disabled pending approval | Case-based access, need-to-know, audit trail |
| AML monitoring data | Restricted | Escalation only | Disabled pending approval | BSA/AML access controls, confidentiality |
| SAR / SAR-revealing information | Restricted | Absolutely prohibited | Absolutely prohibited unless explicitly authorized by applicable law/policy | SAR confidentiality and controlled access |
| Credit application/decision data | Confidential/Restricted | Escalation only | Disabled pending approved governed use | ECOA/Reg B/FCRA/fair-lending controls as applicable |
| Complaint/dispute records | Confidential | Minimal routing context only | Disabled pending approval | Complaint owner, rights recognition, records schedule |
| Authentication secrets | Restricted | Prohibited | Prohibited | Never log/store in ordinary application data |

## AI data rule

No customer or operational data may be sent to a third-party generative/agentic AI service merely because it improves convenience.

A future exception requires documented approval for:

1. use case and business necessity;
2. exact fields/categories;
3. data minimization/redaction/tokenization;
4. legal/privacy basis and required notices/consents;
5. contractual data-use and model-training restrictions;
6. encryption and access controls;
7. retention/deletion;
8. subprocessors and geography;
9. audit/logging;
10. incident response;
11. continuity/exit plan;
12. sponsor-bank/provider approval where applicable.

## Logging rules

Never intentionally log:

- passwords;
- PINs;
- CVVs;
- OTPs;
- recovery codes;
- private keys;
- API secrets;
- full account/card numbers;
- raw identity documents;
- SAR content or SAR existence;
- unrestricted request bodies from financial/authentication endpoints.

Prefer:

- correlation/error IDs;
- sanitized entity references;
- status/category codes;
- irreversible payload digests where useful for deduplication;
- timestamps and actor identities appropriate to the control.

## Retention principles

Production retention periods are **TBD pending actual product, contracts, recordkeeping obligations, litigation holds, sponsor-bank/provider requirements, privacy rules, and counsel/compliance review.** Do not invent universal durations.

The production schedule should:

- identify the legal/contractual reason for retention;
- specify system of record and owner;
- distinguish customer records, financial ledgers, disputes, compliance records, security logs, and marketing data;
- define deletion/anonymization at end of retention where permitted;
- account for regulatory examination and legal hold requirements;
- define vendor deletion/return obligations;
- define backup/PITR treatment;
- include periodic evidence that deletion controls work.

## Access principles

- Least privilege.
- Need-to-know access for Restricted data.
- Phishing-resistant MFA for production privileged access where appropriate/required.
- No shared privileged production accounts.
- Time-bounded elevation for high-risk tasks.
- Dual control for designated high-risk actions.
- Periodic access review.
- Immediate revocation on role change/termination.
- Auditable break-glass access with post-event review.

## Production release gate

Before live customer data is accepted, approve and evidence:

- data inventory;
- classification;
- data-flow diagrams;
- privacy notice/consent mapping;
- retention schedule;
- deletion process;
- access matrix;
- vendor/subprocessor inventory;
- encryption/key management;
- incident/breach obligations;
- AI-use restrictions;
- sponsor-bank/provider and counsel/compliance review where required.
