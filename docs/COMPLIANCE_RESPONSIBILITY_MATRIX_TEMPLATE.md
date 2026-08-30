# Galactic Trust — Regulated Program Responsibility Matrix Template

Status: unassigned pre-partner template  
Purpose: prevent gaps, overlaps, and false assumptions about who owns a regulated obligation  
Important: no row is considered operationally satisfied until named parties, written agreements, procedures, evidence, and escalation paths are approved for the actual program.

## Responsibility labels

- **A — Accountable:** final ownership for the control/outcome.
- **R — Responsible:** performs the work.
- **C — Consulted:** required input/review.
- **I — Informed:** receives status/evidence.
- **N/A:** only after qualified review determines the activity does not apply.

Potential parties used in this template:

- Galactic / program manager
- White-label customer
- Sponsor bank / regulated financial institution
- BaaS / embedded-finance provider
- KYC/KYB / identity vendor
- AML / sanctions vendor
- Fraud / dispute vendor
- Card / payment network or processor
- Qualified fintech/banking counsel
- Compliance owner / BSA-AML function
- Security / privacy owner
- Customer support / complaints owner
- Independent assurance / audit / testing party

Do **not** pre-fill accountability from assumptions. Contracts and applicable law determine the actual allocation, and outsourcing does not necessarily transfer legal responsibility.

## Core matrix

| Control / obligation | Galactic | White-label customer | Sponsor bank | BaaS/provider | Specialist vendor | Counsel/compliance | Evidence required before live |
|---|---|---|---|---|---|---|---|
| Program approval / permitted use case | TBD | TBD | TBD | TBD | — | C | Written program approval and scope |
| Customer eligibility policy | TBD | TBD | TBD | TBD | TBD | C | Approved policy + system mapping |
| KYC/KYB/CIP workflow | TBD | TBD | TBD | TBD | TBD | C | Approved workflow, vendor contract, exception handling |
| Beneficial ownership requirements where applicable | TBD | TBD | TBD | TBD | TBD | C | Approved procedure + evidence retention |
| Sanctions / OFAC screening | TBD | TBD | TBD | TBD | TBD | C | Screening configuration, list-update controls, alert workflow |
| BSA/AML monitoring | TBD | TBD | TBD | TBD | TBD | C | Monitoring rules/model governance, case workflow, QA |
| SAR decision / filing / confidentiality | TBD | — | TBD | TBD | TBD | C | Authorized personnel, filing workflow, SAR confidentiality controls |
| Fraud monitoring | TBD | TBD | TBD | TBD | TBD | C | Rules/models, queues, SLAs, escalation, testing |
| Unauthorized transaction / dispute handling | TBD | TBD | TBD | TBD | TBD | C | Regulation/network/provider-specific procedures |
| Customer complaints / UDAAP monitoring | TBD | TBD | TBD | TBD | — | C | Complaint taxonomy, owner, SLA, root-cause process |
| Fees / pricing / disclosures | TBD | TBD | TBD | TBD | — | C | Approved terms, version history, UI mapping |
| FDIC / deposit-insurance wording | TBD | TBD | TBD | TBD | — | C | Exact partner-approved disclosure and placement |
| Account opening disclosures / agreements | TBD | TBD | TBD | TBD | — | C | Approved documents + acceptance evidence |
| Electronic communications / consent | TBD | TBD | TBD | TBD | TBD | C | Applicable consent process + records |
| ACH origination / returns / authorization | TBD | TBD | TBD | TBD | TBD | C | Network/provider rules, authorization, return handling |
| Card issuance / controls / network rules | TBD | TBD | TBD | TBD | TBD | C | Program/network approval + operational procedures |
| Ledger / balance of record | TBD | — | TBD | TBD | TBD | C | Contracted source of truth + reconciliation design |
| Daily reconciliation | TBD | — | TBD | TBD | TBD | C | Internal/provider/settlement reconciliation and exception SLAs |
| Money-movement idempotency / duplicates | R | — | C | C | C | C | Tested idempotency and duplicate recovery evidence |
| Provider unknown-state recovery | R | — | C | R/C | C | C | Provider-specific pending/unknown recovery drill |
| Emergency money-movement freeze | R | — | C/A | R/C | C | C | Measured partner-approved kill-switch drill |
| Unfreeze / high-risk dual control | TBD | — | TBD | TBD | — | C | Named approvers, dual-control evidence, runbook |
| Customer incident communication | TBD | TBD | TBD | TBD | — | C | Approved templates + time-to-visible-status drill |
| Privacy notice / GLBA allocation | TBD | TBD | TBD | TBD | TBD | C | Applicable privacy analysis + approved notices |
| Data inventory / classification | R | TBD | C | C | C | C | Current data map and owners |
| Data retention / deletion | R | TBD | C | C | C | C | Approved retention schedule + deletion evidence |
| Third-party risk management | R | TBD | C/A | C | — | C | Inventory, due diligence, monitoring, exit plan |
| AI / model governance | R | TBD | C | C | C | C | AI inventory, decision boundaries, testing, change controls |
| Cybersecurity / access management | R | TBD | C | C | C | C | Access matrix, MFA, least privilege, monitoring |
| Incident response | R | TBD | C | C | C | C | Approved runbook + exercises |
| Business continuity / disaster recovery | R | TBD | C | C | C | C | RTO/RPO expectations + restore drills |
| Regulatory examinations / requests | TBD | TBD | TBD | TBD | — | C | Contracted cooperation/escalation process |
| Record retention / examination evidence | TBD | TBD | TBD | TBD | TBD | C | Approved schedule and accessible evidence |
| Training | TBD | TBD | TBD | TBD | — | C | Role-based training records |
| Independent testing / audit | TBD | — | TBD | TBD | TBD | C | Scope, independence, findings/remediation |
| Insurance (cyber/E&O etc.) | R | TBD | C | C | — | C | Bound coverage meeting contractual requirements |

## AI-specific responsibility matrix

| AI use | Current prototype posture | Live owner must be assigned for | Release evidence |
|---|---|---|---|
| Orbit general support | Deterministic rules; no customer financial data sent to third-party LLM | Content approval, accuracy, escalation, monitoring | Approved answer source + regression tests |
| Generative customer support | Disabled | Vendor/data approval, prompts, retrieval source, escalation, hallucination controls | Legal/privacy/security/vendor approval + test evidence |
| Credit decision support | Disabled | Fair lending, actual reason codes, validation, monitoring, adverse action | Program/counsel approval + testing |
| AML alert/case AI | Disabled | BSA/AML ownership, validation, analyst workflow, SAR confidentiality | BSA/AML owner + model/system validation |
| Fraud decisioning | Disabled | Liability/reimbursement rules, human exceptions, network/provider rules | Approved process + outcome testing |
| Identity decisioning | Disabled | KYC/KYB ownership, provider certification, exception review | Provider/compliance approval |
| Personalized financial/investment advice | Disabled | Licensing/supervision analysis | Qualified legal/regulatory approval |

## Required pre-live signoff page

Do not launch until the actual program has a dated signoff recording:

- selected sponsor bank and provider;
- exact legal entities participating;
- approved jurisdictions and customer segments;
- accountable owner for every applicable control above;
- contracts and SLAs;
- escalation contacts and backups;
- evidence repository location;
- unresolved exceptions and approved risk acceptance;
- counsel/compliance approval where required;
- sponsor-bank/provider approval where required.

A blank or disputed ownership cell is a release blocker, not an administrative detail.
