# Galactic Trust — Customer Support, Complaint, and Escalation Operating Model

Status: prototype operating baseline  
Live program: not active  
Purpose: ensure automation never blocks access to human handling for issues involving customer rights, money, identity, fraud, disputes, compliance, or material account judgment.

## 1. Core rule

Orbit may answer low-risk general product questions and route users. It is not the final decision maker for material account matters.

A customer must have a clear protected path to a qualified human workflow when the issue involves:

- a complaint or allegation of unfair/deceptive treatment;
- fraud, scam, unauthorized transaction, or account compromise;
- dispute, chargeback, error, reimbursement, or liability;
- identity/KYC/KYB;
- credit or adverse action;
- AML/sanctions/SAR questions;
- legal/regulatory rights or deadlines;
- accessibility needs that automation cannot serve;
- privacy/data-rights requests;
- account closure/restriction with material customer impact;
- any problem Orbit cannot reliably resolve from approved general content.

## 2. Prototype posture

The current prototype:

- visibly labels Orbit as automated support;
- uses deterministic rules, not third-party generative AI;
- sets a machine-readable human-escalation flag for regulated/account-specific categories;
- warns users not to submit authentication secrets, SSNs, identity documents, or full account/card numbers in general chat;
- does not create a real support ticket, dispute, fraud case, complaint case, or regulatory report;
- must not imply that a real case has been opened when it has not.

A production program requires an authenticated case-management channel before any real customer account exists.

## 3. Intake taxonomy

Every production customer contact should be classified into one or more categories without forcing the customer to know the legal label.

Suggested internal categories:

1. General information
2. Account access/authentication
3. Card lost/stolen
4. Suspected fraud/scam
5. Unauthorized electronic transaction
6. Merchant/card dispute
7. ACH/payment dispute or return
8. Fee/rate/term question
9. Complaint/service dissatisfaction
10. Identity/KYC/KYB
11. Account restriction/closure
12. Credit/adverse action
13. Privacy/data request
14. Accessibility/accommodation
15. AML/sanctions/law-enforcement question
16. Legal/regulatory correspondence
17. Security incident/report
18. Deceased customer/estate or power-of-attorney request
19. Other / requires manual triage

The classification system is for routing; it must not silently waive or narrow a customer's rights.

## 4. Complaint recognition

Do not require magic words such as “formal complaint.”

Treat a communication as a potential complaint when the customer expresses dissatisfaction or alleges harm involving the product, service, employee, vendor, automation, fee, decision, disclosure, delay, error, or treatment.

Production monitoring should test whether automation recognizes statements such as:

- “This is unfair.”
- “You charged me when you said you wouldn’t.”
- “Nobody will help me.”
- “Your bot keeps sending me in circles.”
- “I want to report what happened.”
- “I was told something different before.”

Where the issue may invoke a specific dispute/error-resolution or other statutory process, route to the appropriate protected workflow rather than treating it only as a generic complaint.

## 5. Human escalation states

Recommended case states:

`received -> triaged -> assigned -> investigating -> waiting-on-customer|waiting-on-provider -> decision/response-prepared -> quality-review (where required) -> communicated -> closed -> reopened (if needed)`

For urgent security/fraud issues, add a parallel containment state so protective action does not wait for ordinary case handling.

Do not use “closed” merely because automation sent a response.

## 6. Service-level design

No universal response deadline is invented in this prototype. Production response/acknowledgement/investigation deadlines must be derived from:

- applicable law/regulation;
- payment/card/network rules;
- sponsor-bank/BaaS contract;
- product agreements;
- regulator/partner expectations;
- severity and customer harm;
- committed customer-service standards.

The production case system must calculate and display the correct deadlines for the actual case type and jurisdiction, with escalation before breach.

## 7. Fraud / unauthorized transaction boundary

Orbit may tell a customer how to access protected help and, where applicable, how to freeze a card through an authenticated control.

Orbit must not:

- decide whether the transaction is fraud;
- decide reimbursement/liability;
- promise provisional/permanent credit;
- invent investigation deadlines;
- mark a real transaction as reversed;
- request a PIN/CVV/password/OTP/recovery code in chat.

Production fraud/dispute outcomes must be driven by the approved legal/network/provider process and recorded with evidence.

## 8. AML/SAR boundary

Support may collect ordinary customer-service facts through approved channels but must not disclose a SAR or information that reveals whether a SAR exists, is being considered, or has been filed.

If a customer asks about AML/SAR/sanctions monitoring:

- do not confirm/deny SAR status;
- do not expose internal monitoring rules or case notes;
- route to the authorized compliance/support process;
- preserve SAR confidentiality and access restrictions.

## 9. Credit boundary

Orbit must not approve, deny, price, or explain an account-specific credit outcome.

A future production workflow must provide accurate legally required notices and reasons from the actual decision system and approved program. Support staff must not substitute a guessed reason for the operative reason.

## 10. Approved-answer source

Changing financial terms must come from a controlled source rather than employee/bot memory.

Examples:

- current fees;
- rates/APY/yield;
- limits;
- eligibility;
- payment timing;
- dispute process/deadlines;
- rewards terms;
- insurance/partner disclosures;
- account agreements;
- product availability.

Answers should include the relevant version/effective date internally so disputes about prior information can be reconstructed.

## 11. Quality assurance

Production QA should sample contacts and measure at least:

- correct classification;
- required escalation recognized;
- accurate approved terms used;
- no unsupported promises;
- no secret/PII collection in inappropriate channels;
- correct deadline tracking;
- correct human decision authority;
- accessibility;
- complaint root-cause identification;
- repeat-contact rate;
- reopen rate;
- wrong-answer/correction rate for automation;
- automation-to-human handoff failure rate.

High-risk failures should feed into product/security/compliance remediation, not only agent coaching.

## 12. Root-cause and trend management

Complaint/support data should be aggregated by:

- product/tenant;
- issue category;
- vendor/provider;
- feature/release;
- customer journey step;
- error code;
- automation answer category;
- severity/customer harm;
- repeat occurrence.

Material trends should generate owned corrective actions with deadlines and verification.

## 13. Customer communications

Customer-facing responses must:

- clearly distinguish known facts from investigation status;
- avoid claiming a transaction succeeded/failed/reversed without authoritative status;
- avoid unsupported FDIC/insurance/rate/fee promises;
- avoid legal conclusions beyond approved materials;
- identify when more information is needed and use a protected collection channel;
- make human support reachable when automation is insufficient;
- preserve evidence of what was communicated and when where the program requires it.

## 14. Production staffing/continuity gate

Before live launch, designate:

- support owner;
- complaint owner;
- fraud/dispute owner;
- compliance escalation owner;
- privacy escalation owner;
- security escalation owner;
- backup coverage for each critical role;
- after-hours process for urgent incidents where appropriate;
- sponsor-bank/provider escalation contacts;
- counsel contact for material legal issues.

Do not publish a staffed 24/7 SLA unless the staffing and partner model can actually meet it.

## 15. Evidence to retain

The production program should retain, subject to an approved retention schedule:

- intake timestamp/channel;
- classification and changes;
- assigned owner;
- customer communications;
- relevant evidence;
- provider/vendor correspondence;
- decisions and approvers;
- required notices;
- deadlines and completion timestamps;
- escalation events;
- complaint root-cause/remediation;
- QA results;
- reopen/appeal information where applicable.

## 16. Release gates

Before live customer support:

- [ ] authenticated case-management channel exists;
- [ ] exact complaint/dispute/fraud processes are approved;
- [ ] applicable deadlines are configured from current requirements;
- [ ] human owners and backup coverage are assigned;
- [ ] Orbit-to-human escalation is exercised end-to-end;
- [ ] urgent card/security containment path is exercised;
- [ ] complaint recognition test set passes;
- [ ] SAR confidentiality test set passes;
- [ ] approved-answer source/versioning is live;
- [ ] accessibility pass is complete;
- [ ] customer communications are approved;
- [ ] monitoring/QA/root-cause process is operating.
