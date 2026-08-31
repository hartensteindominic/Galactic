# Galactic Trust — Third-Party and AI Vendor Risk Register Template

Status: pre-production template  
Purpose: maintain a complete inventory of third parties, including AI services, and prevent unowned critical dependencies.

## 1. Core principle

A vendor relationship does not remove Galactic's obligation to understand, monitor, and control the risks created by the activity. The actual sponsor-bank/provider program will determine contractual responsibilities and oversight expectations.

## 2. Inventory fields

Create one record for every material vendor/service, including free services, APIs, cloud providers, consultants with system/data access, processors, identity vendors, AI vendors, and subcontracted operational services.

Required fields:

- vendor legal name;
- service/product name;
- business owner;
- technical owner;
- compliance/privacy/security owner where applicable;
- service description;
- criticality: low / moderate / high / critical;
- customer-facing: yes/no;
- touches money movement: yes/no;
- touches customer data: yes/no;
- data classifications handled;
- production credentials held/accessed;
- regulatory/control functions supported;
- subcontractors/subprocessors;
- hosting/data locations;
- business continuity dependency;
- alternative/fallback provider;
- contract start/end/renewal dates;
- termination/exit requirements;
- last due-diligence review;
- next review date;
- open findings/risk acceptances;
- incident history;
- current status: proposed / due diligence / approved / restricted / suspended / exiting / terminated.

## 3. Initial future-vendor categories

The current prototype does not represent these as selected/approved production vendors. This is the diligence inventory to populate when selection begins.

| Category | Typical function | Key diligence areas |
|---|---|---|
| Sponsor bank / regulated institution | Deposit/payment/card program | Program scope, responsibilities, compliance, operations, reconciliation, emergency controls, customer disclosures |
| BaaS / embedded-finance provider | APIs/orchestration | Reliability, ledger/provider semantics, idempotency, webhook security, certification, auditability, exit |
| KYC/KYB / identity | Identity/business verification | Accuracy, fraud controls, data security, retention, biometrics/IDs, manual review, explainability/appeals |
| AML/sanctions | Screening/monitoring | List updates, matching quality, case workflow, confidentiality, validation/testing, escalation |
| Fraud platform | Fraud detection/case management | Signals, false positives, rule/model governance, account restrictions, manual review, evidence |
| Card/payment processor | Authorization/clearing/settlement | Network certification, outages, disputes, reconciliation, security, settlement |
| Cloud hosting | Application/database | Security, availability, backup/restore, region, encryption, privileged access |
| Database / ledger infrastructure | Data persistence | Consistency, backup/PITR, access, audit, restoration, integrity |
| Observability/security monitoring | Logs/alerts | Sensitive-data filtering, access, retention, alerting, incident response |
| Customer support/case management | Tickets/communications | Customer data, retention, access, SLA, complaint/dispute workflows |
| Email/SMS/push | Notifications | Authentication, delivery, data minimization, fraud/social-engineering risk |
| AI / LLM | Support, analytics, engineering | Data use/training, retention, subprocessors, prompt/data leakage, model changes, availability, human controls |
| Pen-test / assurance firm | Independent testing | Competence, independence, confidentiality, methodology, remediation validation |
| Legal/compliance advisors | Qualified review | Expertise, scope, conflicts, confidentiality, continuity |

## 4. Criticality criteria

A vendor is likely **high/critical** if failure, compromise, or misconduct could materially affect:

- customer funds or money movement;
- ledger/reconciliation correctness;
- identity/KYC/KYB;
- BSA/AML/sanctions;
- fraud/dispute handling;
- customer access to accounts;
- security/privacy of nonpublic customer information;
- regulatory reporting;
- required customer support;
- business continuity;
- legal/program approval.

Criticality drives diligence depth, monitoring, contingency planning, testing, and approval authority.

## 5. Due-diligence checklist

Tailor depth to risk. For high/critical services evaluate, as applicable:

### Company / financial
- legal entity and ownership;
- financial condition/runway where relevant;
- insurance;
- key-person dependence;
- material litigation/regulatory issues;
- customer concentration and sustainability.

### Security
- security program and responsible owner;
- independent assurance reports/certifications where relevant;
- penetration testing/vulnerability management;
- encryption/key management;
- access controls/MFA/privileged access;
- secure development/change management;
- logging/monitoring;
- incident response and notification;
- data deletion/return;
- subprocessor controls.

### Privacy / data
- exact data collected/received;
- purpose limitation;
- retention/deletion;
- data locations/transfers;
- customer-data sale/advertising/training use;
- subprocessors;
- rights-request support;
- breach obligations.

### Operations / continuity
- availability history/SLA;
- RTO/RPO and recovery testing;
- capacity/scaling;
- backups and restoration;
- support/escalation;
- dependency chain;
- fallback/manual process;
- exit/portability plan.

### Compliance / product
- licenses/registrations where applicable;
- bank/provider certifications;
- relevant network rules;
- compliance staffing/ownership;
- audit/exam cooperation;
- complaint/dispute support;
- evidence and record access;
- contract allocation of responsibilities.

## 6. AI-specific diligence

For any AI/ML/LLM vendor, capture:

- model/service type: deterministic rules / traditional statistical / non-generative ML / generative AI / agentic AI;
- model/version/change policy;
- customer data sent to service;
- whether prompts/outputs are retained;
- whether data is used for model training/improvement;
- opt-out/contractual controls;
- human review requirements;
- hallucination and reliability testing;
- safety/filter behavior;
- prompt-injection/data-exfiltration testing;
- tenant/data isolation;
- model/update notification;
- explainability requirements for the use case;
- audit/log access;
- fallback when model unavailable or degraded;
- exit/export/deletion capability;
- prohibited-use enforcement.

AI cannot be approved as a generic vendor category. Approval is use-case and data-flow specific.

## 7. Contract requirements

Depending on risk, agreements should address:

- services/scope and performance;
- compliance with applicable law/program requirements;
- confidentiality/data use;
- security controls;
- incident/breach notification;
- audit/access to evidence;
- subcontractors/subprocessors;
- business continuity;
- data location;
- retention/deletion/return;
- regulatory/sponsor-bank cooperation;
- service levels/escalation;
- change notification;
- indemnity/liability/insurance where negotiated;
- termination/transition assistance;
- ownership/portability of data and records;
- AI/model training/use restrictions where applicable.

## 8. Ongoing monitoring

Monitoring cadence should be risk-based and may include:

- SLA/availability;
- incidents/breaches;
- security findings;
- audit/assurance reports;
- regulatory/legal changes;
- financial condition;
- subcontractor changes;
- product/API/model changes;
- complaint/support trends;
- reconciliation/operational defects;
- recovery tests;
- open remediation items.

A vendor's initial approval does not constitute permanent approval.

## 9. Concentration and correlated risk

Review whether multiple critical services depend on the same:

- cloud provider;
- identity provider;
- DNS/domain registrar;
- communication channel;
- AI/model provider;
- payment/processor platform;
- key employee/consultant;
- geographic region.

Document whether one outage/compromise could take down several supposedly independent controls.

## 10. Exit plan

For every high/critical vendor define:

- trigger conditions for suspension/termination;
- emergency disable path;
- alternative provider/manual fallback;
- data export format;
- credential/key rotation;
- deletion confirmation;
- customer communication implications;
- regulatory/partner notice requirements;
- reconciliation before/after transition;
- evidence retention.

## 11. Vendor-disappearance drill

For providers involved in money movement, test a scenario where the vendor becomes unavailable after accepting an instruction but before terminal status is known.

Pass only if:

- no duplicate replacement instruction is automatically created;
- state remains pending/unknown;
- authoritative reconciliation/status eventually resolves it;
- customer status is accurate;
- operations can trace the intent/provider reference;
- the provider outage does not erase internal evidence.

## 12. Release gate

No high/critical production vendor is considered ready until:

- [ ] owner assigned;
- [ ] risk/criticality assessed;
- [ ] due diligence completed;
- [ ] contract approved;
- [ ] data flow approved;
- [ ] required sponsor-bank/provider approval obtained;
- [ ] continuity/exit plan documented;
- [ ] integration/security testing completed;
- [ ] monitoring owner/cadence defined;
- [ ] open findings are remediated or formally accepted by authorized owners.
