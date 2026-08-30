# Galactic Trust — AI Governance and Regulated-Decision Boundaries

Status: prototype governance baseline  
Applies to: Galactic Trust reference tenant and future white-label deployments  
Live financial activity: disabled  
Legal status: operating-control template for qualified legal/compliance review; not legal advice or a substitute for an approved regulated program

## 1. Purpose

AI may accelerate software development, documentation, testing, anomaly review, support triage, and other operational work. AI must not be used as a shortcut around licensing, consumer-protection, privacy, safety-and-soundness, sponsor-bank, or program requirements.

Galactic uses a simple rule:

> Automation may assist a governed process. Automation may not invent authority that the company, provider, bank, licensed person, or approved program does not have.

The current customer-facing Orbit assistant is deterministic application logic. It is not connected to customer financial records, does not call a third-party LLM with customer data, and does not make regulated or account-specific decisions.

## 2. Current product boundaries

Current prototype controls include:

- simulation-only balances, transfers, cash-flow items, and account data;
- no real deposits, ACH/wires, card issuance, KYC/KYB, lending, investment advice, or regulatory reporting;
- deterministic Orbit responses rather than free-form generative customer-service answers;
- visible disclosure that Orbit is automated support;
- machine-readable `requiresHuman` escalation for regulated/account-specific categories;
- no intentional persistence of Orbit messages in the prototype database;
- customer warning not to enter passwords, PINs, CVVs, OTPs, recovery codes, SSNs, full account/card numbers, or identity documents;
- explicit human escalation for fraud/disputes, complaints, identity verification, credit, AML/sanctions, legal/regulatory, and personalized investment questions;
- bounded JSON requests and same-origin checks on the assistant endpoint;
- best-effort prototype rate limiting, which is not represented as production distributed abuse protection.

## 3. Decision authority matrix

| Activity | AI / automation may | AI / automation must not | Required authority before live use |
|---|---|---|---|
| General product support | Explain approved product status, navigation, simulation labels, and approved terms | Invent fees, rates, insurance status, rights, deadlines, eligibility, or guarantees | Approved source-of-truth content and support escalation path |
| Customer complaints | Classify, route, summarize, and help collect non-sensitive context | Treat a regulated complaint as finally resolved solely because a bot answered | Human complaint owner and applicable response/escalation process |
| Fraud / disputes | Detect signals, triage, preserve evidence, explain how to reach protected support | Decide liability, reimbursement, chargeback eligibility, or close an investigation without the approved process | Provider/network rules, trained humans, documented dispute/fraud process |
| KYC / KYB / identity | Assist workflow routing and anomaly detection using approved systems | Collect identity documents in general chat, make unsupported identity adjudications, or bypass provider review | Approved identity/KYC provider, compliance owner, protected data flow, human review where required |
| BSA / AML / sanctions | Assist monitoring, case prioritization, data quality, documentation, and analyst workflow | Tell a customer whether a SAR was filed or may be filed; expose SAR information; independently substitute for required program governance | Covered institution/program requirements, BSA/AML officer or responsible compliance function, approved monitoring/screening stack, SAR confidentiality controls |
| Credit / lending | Assist data processing, testing, monitoring, reason-code generation, and governed decision systems | Let a chatbot approve/deny/price credit; use an opaque result that cannot support accurate specific adverse-action reasons; invent a denial reason | Approved lending program, ECOA/Reg B/FCRA and other applicable controls, fair-lending testing, adverse-action process, human/compliance oversight |
| Investment / securities advice | Provide approved general educational material and product mechanics | Give personalized buy/sell/hold advice or promise returns unless the activity is properly licensed/governed | Applicable broker-dealer/investment-adviser/other regulatory analysis and approved supervision |
| Deposit insurance / sponsor-bank statements | Repeat exact approved program disclosure from a controlled source | Infer or hallucinate FDIC status, pass-through coverage, partner identity, or insurance eligibility | Executed program terms and counsel/partner-approved disclosure language |
| Legal / regulatory interpretation | Route to approved FAQs and qualified people | Provide final account-specific legal conclusions or represent itself as counsel/compliance authority | Qualified counsel/compliance ownership |
| Money movement | Help prepare or validate an intent; provide status from authoritative systems | Move money merely because an AI produced an instruction; bypass idempotency, authorization, limits, fraud controls, or emergency freeze | Approved provider program, authenticated user intent, policy checks, idempotency, audit/reconciliation, emergency controls |
| Regulatory reporting | Assist case preparation and data quality | File, suppress, alter, or disclose regulated reports outside an approved controlled workflow | Authorized responsible personnel and applicable reporting procedures |

## 4. SAR confidentiality boundary

Customer-facing AI must never reveal, infer, confirm, deny, hint at, or expose whether a Suspicious Activity Report exists or may be filed.

For any SAR/AML question, Orbit must:

1. avoid confirming or denying reporting status;
2. avoid exposing internal monitoring thresholds, case notes, or investigator conclusions;
3. direct account-specific questions to an authorized human compliance/support workflow;
4. avoid accepting sensitive identity or financial evidence in general chat.

The policy applies even if the user directly asks, "Did you file a SAR on me?"

## 5. Credit and adverse-action boundary

No customer-facing chatbot is authorized to approve, deny, price, or underwrite credit in Galactic's prototype.

Any future credit decision system must, before live use:

- operate only in an approved lending program;
- identify the actual decision inputs and principal reasons;
- support accurate, specific adverse-action reasons where required;
- undergo fair-lending / discrimination risk assessment and testing appropriate to the program;
- preserve decision/version/audit evidence;
- prohibit fabricated or generic denial explanations that do not reflect the actual decision;
- include qualified legal/compliance ownership and a customer correction/dispute path where applicable.

## 6. Customer-support AI boundary

Orbit is a front door, not the final authority.

Orbit should be optimized for:

- clearly identifying itself as automated;
- answering low-risk general product questions from approved content;
- stating what is prototype, sandbox, partner-required, unavailable, or live;
- refusing to collect sensitive authentication/identity data in chat;
- recognizing regulated/account-specific categories early;
- giving users a clear path to protected human support;
- never trapping a customer in an automated loop when human handling is necessary.

The system should favor a safe escalation over an invented answer.

## 7. Approved-source rule

Customer-facing automation may only state changing financial terms from an approved, versioned source of truth.

Examples include:

- fees;
- APY/yield/rates;
- eligibility;
- transfer timing and reversibility;
- limits;
- card/network rules;
- dispute deadlines;
- rewards terms;
- partner-bank identity;
- insurance wording;
- account restrictions;
- product availability.

If approved terms are unavailable, the system should state that the term is not currently approved/available rather than estimate it.

## 8. Data minimization and third-party AI

Default rule: no customer PII, credentials, account records, transaction records, identity documents, SAR information, case notes, or other regulated/sensitive data is sent to a third-party generative AI service.

Before any future third-party AI receives customer or operational data, require documented approval covering at minimum:

- exact data categories and lawful/contractual basis for processing;
- data minimization and field-level redaction/tokenization;
- encryption in transit and at rest;
- retention/deletion rules;
- whether vendor/model training on Galactic/customer data is disabled or otherwise contractually governed;
- subprocessors and data locations;
- access control and privileged access;
- incident/breach notification;
- logging and auditability;
- independent security evidence appropriate to the risk;
- business continuity and exit/export/deletion plan;
- sponsor-bank/provider approval where the program requires it;
- customer disclosures/consents where required;
- qualified privacy/legal/compliance review.

## 9. Third-party/vendor governance

An AI vendor is treated like any other material third-party service: risk depends on the service, data, and criticality.

For material or critical use, the future program should maintain:

- vendor inventory and service owner;
- use case and data-flow diagram;
- inherent/residual risk assessment;
- due-diligence evidence;
- contract and security requirements;
- subcontractor/subprocessor visibility;
- performance, incident, and compliance monitoring;
- continuity, fallback, and termination plan;
- periodic reassessment.

Outsourcing a function does not outsource accountability.

## 10. Model and AI risk governance

Current regulatory references must be maintained by date/version rather than copied forever.

As of April 17, 2026, the Federal Reserve/OCC/FDIC revised interagency Model Risk Management guidance superseded SR 11-7 and SR 21-8. That 2026 guidance expressly states that generative and agentic AI are outside its scope, while noting that a banking organization's broader risk-management and governance practices should determine appropriate controls for tools outside the guidance.

Therefore Galactic must not make the inaccurate claim that "SR 11-7 legally governs every generative-AI use." Instead:

- determine what laws, regulations, contractual program requirements, supervisory guidance, and internal controls apply to the specific entity/use case;
- maintain inventory, ownership, testing, monitoring, change management, incident response, and independent challenge commensurate with risk;
- apply the selected bank/provider's required AI/model governance before production use;
- document when a system is deterministic rules, traditional quantitative model, non-generative ML, generative AI, or agentic AI.

## 11. Human-in-the-loop does not mean rubber stamp

A human-control claim is valid only when the human has:

- authority to make or change the outcome;
- enough information to understand the material facts;
- adequate time and training;
- a documented escalation/override path;
- freedom from automation bias incentives that make review meaningless;
- audit evidence of the decision where required.

Clicking "approve" on an opaque AI recommendation without real review is not treated as meaningful oversight.

## 12. Testing requirements before live AI expansion

Before adding generative AI to customer or regulated operations, execute and retain evidence for:

- hallucinated-fee/rate/FDIC statement tests;
- prompt-injection and data-exfiltration tests;
- sensitive-data refusal tests;
- complaint/right-invocation recognition tests;
- fraud/dispute escalation tests;
- SAR confidentiality tests;
- credit/adverse-action boundary tests;
- personalized investment-advice boundary tests;
- cross-tenant data-leak tests;
- human-escalation availability and latency tests;
- vendor outage and exit/fallback tests;
- model/version regression tests;
- accessibility tests for escalation paths.

## 13. Production release gates

Keep the following false/unapproved until the appropriate external program exists and tests are complete:

- AI makes final credit decisions;
- AI makes final fraud/reimbursement decisions;
- AI performs final identity adjudication;
- AI makes SAR filing/non-filing decisions without the approved BSA/AML governance workflow;
- AI sends customer data to an unapproved third-party model;
- AI publishes dynamic fees/rates/insurance/partner disclosures outside a controlled approved source;
- AI is the only customer-support channel for issues requiring human handling;
- AI autonomously unfreezes money movement or other emergency restrictions;
- AI files regulatory reports without an authorized controlled process.

## 14. Current primary regulatory/reference snapshot

This is a reference snapshot for counsel/compliance validation, not a complete statement of law:

- CFPB, Consumer Financial Protection Circular 2022-03 — adverse-action notification requirements for credit decisions based on complex algorithms.
- CFPB, September 19, 2023 guidance/news release — accurate and specific reasons for credit denials using AI/complex models.
- CFPB, June 6, 2023, *Chatbots in consumer finance* — reliability, privacy, legal-obligation, and human-access risks.
- Federal Reserve / FDIC / OCC, June 2023 Interagency Guidance on Third-Party Relationships: Risk Management.
- Federal Reserve SR 26-2 / OCC Bulletin 2026-13, April 17, 2026 — Revised Guidance on Model Risk Management, superseding SR 11-7 and SR 21-8; generative/agentic AI outside scope of that guidance.
- FinCEN / 31 U.S.C. 5318(g)(2) and applicable SAR regulations/guidance — SAR confidentiality / notification prohibition.
- FTC, 16 CFR Part 314 Safeguards Rule — for financial institutions subject to FTC jurisdiction, information-security and service-provider safeguards.

Qualified counsel/compliance personnel must confirm which authorities apply to Galactic, a selected white-label customer, and a selected banking/provider program before launch.
