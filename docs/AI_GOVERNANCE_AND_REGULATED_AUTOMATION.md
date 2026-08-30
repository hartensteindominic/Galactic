# AI Governance and Regulated Automation

Status: engineering governance baseline for the Galactic Trust prototype  
Scope: automated support, analytics, future AI-assisted operations, and any future AI vendor integration  
Not legal advice: this document is a technical and operating control baseline. Qualified counsel, compliance leadership, regulated partners, and applicable regulators determine the final obligations for a live program.

## 1. Current prototype posture

The current Orbit support assistant is intentionally narrow:

- Orbit is automated and must be disclosed as automated.
- Runtime answers are deterministic rules in application code; the prototype does not send customer financial data to a third-party LLM.
- Orbit can explain general product status and prototype mechanics.
- Orbit cannot approve, deny, price, underwrite, or explain an account-specific credit decision.
- Orbit cannot determine or disclose suspicious-activity-report status, AML conclusions, sanctions dispositions, or watchlist outcomes.
- Orbit cannot decide fraud liability, reimbursement, chargeback eligibility, or dispute outcomes.
- Orbit cannot perform KYC/KYB or identity adjudication.
- Orbit cannot provide personalized investment recommendations or legal advice.
- Orbit cannot create or modify fees, rates, eligibility, insurance statements, partner disclosures, or customer contract terms.
- Material or account-specific judgment requires an authorized human workflow.
- Passwords, PINs, CVVs, recovery codes, OTPs, full account/card numbers, SSNs/tax IDs, and identity documents are prohibited in support chat.

The prototype's machine-readable posture is exposed through `/api/prototype/readiness` and the customer-facing Transparency Center.

## 2. Core rule: automation cannot create authority

AI or automation may accelerate engineering, drafting, testing, analytics, triage, and operational preparation. It does not create a charter, license, registration, program approval, regulated authority, or permission to move customer funds.

No AI feature may be treated as a substitute for:

- a required charter, license, registration, or regulated program approval;
- a responsible human officer or compliance owner;
- qualified legal advice;
- required human review or escalation;
- provider/sponsor-bank approval;
- required notices, disclosures, recordkeeping, or audit evidence;
- applicable consumer-protection, privacy, security, fair-lending, BSA/AML, sanctions, dispute, or reporting controls.

## 3. Prohibited autonomous uses without a separately approved program

The following are disabled in the prototype and must remain fail-closed unless a future program has explicit legal/compliance/partner approval, documented control ownership, testing, monitoring, auditability, and required human oversight:

1. **Credit and adverse action**
   - approve or deny credit;
   - set individualized credit terms or limits;
   - generate the legally operative reason for adverse action;
   - make decisions using criteria prohibited by applicable law.

2. **BSA/AML and sanctions disposition**
   - decide whether to file a SAR;
   - disclose SAR existence or nonexistence;
   - make final sanctions/watchlist dispositions;
   - close an alert without an approved review workflow where human review is required.

3. **Fraud, disputes, and customer liability**
   - decide reimbursement or liability;
   - accept or deny a dispute or chargeback;
   - make a legally operative error-resolution decision.

4. **Identity/KYC/KYB**
   - approve or reject identity/business verification;
   - request highly sensitive identity material through an unapproved chat channel.

5. **Advice and regulated representations**
   - personalized investment recommendations;
   - legal advice;
   - tax advice;
   - unsupported FDIC/deposit-insurance claims;
   - unsupported rates, APYs, fees, limits, partner-bank names, or program eligibility promises.

6. **Money movement**
   - originate, release, retry with a new intent, cancel, reverse, or unfreeze real money movement solely because an AI system requested it.

This does **not** mean automation can never assist a regulated workflow. Approved screening, anomaly detection, case summarization, prioritization, and decision-support tools may be appropriate in a future program when legal requirements, confidentiality, validation, governance, auditability, and human/authorized review requirements are satisfied. Assistance is different from ungoverned autonomous authority.

## 4. Human escalation requirements

Orbit must escalate rather than claim resolution when the customer raises or appears to raise:

- a complaint;
- suspected fraud or an unauthorized transaction;
- a dispute, chargeback, or error claim;
- identity verification/KYC/KYB;
- a credit decision or denial;
- an AML, sanctions, SAR, or law-enforcement question;
- legal/regulatory questions requiring interpretation;
- personalized investment questions;
- any account-specific matter that requires access to protected data or material judgment.

Future production support must provide a tested route to timely human intervention. Automation may route, summarize, and assist an authorized person, but it must not create a dead-end or circular support loop.

## 5. Data governance

### Public / low-risk data

Examples: public product documentation, published approved program terms, generic FAQs. These may be used by approved automation subject to change control and accuracy testing.

### Internal operational data

Examples: runbooks, synthetic test evidence, non-customer system health. Access must follow least privilege and environment separation.

### Customer nonpublic personal information / financial data

Do not send to a third-party AI/LLM unless all applicable privacy/security/vendor requirements and contractual approvals are satisfied, including as appropriate:

- documented purpose and data-flow map;
- data minimization;
- approved retention/deletion behavior;
- encryption and access controls;
- incident-notification obligations;
- subprocessors and location review;
- contractual restrictions on training/reuse where required;
- legal/privacy review;
- sponsor-bank/provider approval where applicable;
- exit/portability plan.

### Secrets and authentication material

Passwords, API secrets, private keys, PINs, CVVs, recovery codes, OTPs, and equivalent credentials must never be placed in AI prompts, support chat, source, public issues, or logs.

### SAR information

A SAR and information that would reveal the existence of a SAR are subject to strict confidentiality restrictions. Customer-facing automation must never tell a person involved in a transaction that a SAR has or has not been filed, is being considered, or exists. Any future internal tool that touches SAR information must be specifically approved for that purpose and designed around applicable confidentiality/access controls.

## 6. AI/vendor inventory

Before any production AI service is enabled, maintain an inventory entry containing at least:

- owner;
- vendor/model/system name and version where available;
- business purpose;
- user population;
- inputs and data classifications;
- outputs and downstream uses;
- whether output affects money, credit, eligibility, compliance, fraud, disputes, legal rights, or customer communications;
- human reviewer/approver;
- fallback procedure;
- retention/logging behavior;
- security/privacy/vendor assessments;
- validation/testing evidence;
- monitoring metrics;
- material change history;
- incident and disable/exit procedure.

Uninventoried production AI is prohibited.

## 7. Testing and change control

At minimum, a material customer-facing AI change should be tested for:

- prohibited promises and unsupported claims;
- recognition of complaints, disputes, fraud, identity, credit, AML/sanctions, legal, and investment topics;
- human escalation behavior;
- sensitive-data handling;
- hallucination/inaccuracy risk;
- prompt injection and data exfiltration risk where generative AI exists;
- tenant/data isolation;
- availability and fallback behavior;
- version/change regression;
- accessibility and understandable disclosures.

A model/vendor/version change must not silently expand authority. High-impact capability changes require documented review and an explicit release decision.

## 8. Monitoring and incident response

Future production AI monitoring should include, as appropriate:

- wrong-answer and correction rate;
- failed-escalation rate;
- complaint/dispute recognition failures;
- sensitive-data leakage indicators;
- prohibited-claim attempts;
- vendor/model availability;
- latency/fallback behavior;
- material model/version changes;
- security events and prompt-injection attempts.

There must be a tested way to disable a problematic automated assistant while preserving access to required human support.

## 9. Current U.S. regulatory reference points

These references are included to guide engineering and diligence; counsel must determine applicability to the eventual entity, product, partner program, and jurisdiction.

### Credit / adverse-action reasons

The current Regulation B rule at 12 CFR § 1002.9 requires adverse-action notices to contain, or provide the applicant a right to obtain, specific reasons for the action. The official interpretation says the reasons must accurately describe the factors actually considered or scored. If a future Galactic program offers credit, its decision system therefore must preserve legally sufficient, accurate decision reasons and required notices.

Current references:
- https://www.consumerfinance.gov/rules-policy/regulations/1002/
- https://www.consumerfinance.gov/rules-policy/regulations/1002/interp-9/

Historical note: CFPB Circular 2022-03 discussed complex algorithms and adverse-action reasons, but the CFPB **withdrew that circular on May 12, 2025**. It must not be cited as current CFPB guidance. The underlying Regulation B notification/reason requirements remain the relevant starting point, subject to current law and counsel review.

Withdrawal reference: https://www.consumerfinance.gov/compliance/guidance/withdrawn-guidance/

### Customer-service automation

The CFPB's 2023 chatbot issue spotlight warns that deficient chatbots can provide inaccurate information, fail to recognize disputes/rights, create privacy/security risks, and block timely human assistance. Galactic therefore treats human escalation as a control, not an optional convenience.

Reference: https://www.consumerfinance.gov/data-research/research-reports/chatbots-in-consumer-finance/chatbots-in-consumer-finance/

### SAR confidentiality

FinCEN guidance and rules emphasize that SARs and information revealing their existence are confidential, subject to limited authorized disclosure rules. Galactic therefore treats SAR existence/nonexistence as prohibited customer-facing chatbot content.

References:
- https://www.fincen.gov/resources/advisories/fincen-advisory-fin-2010-a014
- https://www.fincen.gov/disclosure-prohibited

### Sanctions compliance

OFAC's Framework for Compliance Commitments describes a risk-based sanctions compliance approach built around management commitment, risk assessment, internal controls, testing/auditing, and training. OFAC also recognizes automated/commercial screening tools as potentially appropriate depending on risk and business context. Galactic should therefore design sanctions automation as a governed control within a tailored program—not as proof that a chatbot or black-box model can independently make final compliance judgments.

References:
- https://ofac.treasury.gov/recent-actions/20190502_33
- https://ofac.treasury.gov/faqs/560

### Model risk guidance — current 2026 status

On April 17, 2026, the Federal Reserve, OCC, and FDIC issued revised interagency model-risk guidance that superseded SR 11-7 and the 2021 BSA/AML model-risk statement. The revised guidance is risk-based supervisory guidance, not a prescriptive regulation. It states that generative AI and agentic AI are outside the scope of that guidance, while organizations should still apply appropriate governance and controls to tools not covered by it.

References:
- https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm
- https://www.federalreserve.gov/frrs/guidance/supervisory-guidance-on-model-risk-management.htm
- https://www.occ.treas.gov/news-issuances/news-releases/2026/nr-occ-2026-29.html

Therefore Galactic must not claim that "SR 11-7 requires X for generative AI." Instead, future AI governance should be tailored to actual legal obligations, partner requirements, risk, and current supervisory expectations.

### Third-party/vendor risk

The 2023 interagency third-party risk guidance for banking organizations covers planning, due diligence/selection, contract negotiation, ongoing monitoring, and termination. A future sponsor bank or regulated provider may apply these expectations to Galactic and its critical vendors, including AI services.

Reference: https://www.occ.treas.gov/news-issuances/bulletins/2023/bulletin-2023-17.html

### Customer-information safeguards

For financial institutions subject to FTC jurisdiction, the FTC Safeguards Rule requires a written information-security program appropriate to the organization's size/complexity, activities, and sensitivity of customer information, and includes responsibilities concerning service providers.

Reference: https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know

## 10. Pre-live AI gate

Do not enable material production AI until all applicable items are complete:

- [ ] qualified legal/compliance applicability review;
- [ ] sponsor-bank/provider approval where applicable;
- [ ] AI/vendor inventory entry;
- [ ] documented data-flow and privacy/security review;
- [ ] vendor due diligence and contractual controls;
- [ ] approved customer disclosure and human-escalation design;
- [ ] prohibited-use and sensitive-data tests;
- [ ] independent validation/testing appropriate to risk;
- [ ] monitoring/incident metrics and owners;
- [ ] disable/fallback/exit process;
- [ ] incident drill completed;
- [ ] no unsupported regulatory, insurance, rate, fee, eligibility, or product claims.

Until those gates are satisfied, regulated AI decisioning and third-party LLM processing of customer financial data remain disabled.
