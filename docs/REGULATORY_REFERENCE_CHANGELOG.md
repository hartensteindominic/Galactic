# Galactic Trust — Regulatory Reference Changelog

Status: engineering/compliance reference log  
Purpose: prevent stale regulatory guidance from being treated as current product requirements  
Important: this is not legal advice and is not a complete list of applicable law. Qualified counsel/compliance personnel must validate applicability for the actual entity, product, partner, jurisdiction, and date.

## Operating rule

Never copy a regulatory statement into permanent product policy without recording:

- source;
- source type: statute / regulation / official interpretation / supervisory guidance / enforcement material / research report / contract/program requirement;
- publication/effective date;
- whether it has been amended, rescinded, superseded, or withdrawn;
- which entity/activity it applies to;
- owner responsible for periodic review.

Where a guidance document is withdrawn but an underlying statute/regulation remains, anchor the product control to the current statute/regulation and clearly label the old document as historical.

## 2026-08-30 reference snapshot

### Regulation B / ECOA

Current reference:
- 12 CFR Part 1002, including § 1002.9 and current official interpretations.
- CFPB's Regulation B resource identifies the July 21, 2026 version as current.

Current engineering consequence:
- A future credit program must use the actual current Regulation B requirements and official interpretations applicable to the creditor/product.
- Adverse-action/customer-notice logic must come from the approved program and actual decision reasons where required.
- Orbit does not approve/deny/price credit or invent account-specific reasons.

2026 change to track:
- CFPB states the April 22, 2026 final rule removed the Regulation B “effects test” and stated that ECOA does not recognize disparate-impact liability; the current Regulation B resource reflects amendments through July 21, 2026.

Control consequence:
- Galactic must **not** hard-code “ECOA requires disparate-impact testing” as a universal legal statement.
- A future program may still perform statistical/fair-lending testing because of other applicable law, partner policy, risk management, intentional-discrimination controls, supervisory expectations, contractual requirements, or counsel advice. The exact legal/risk rationale must be documented for that program.

Current references:
- https://www.consumerfinance.gov/rules-policy/regulations/1002/
- https://www.consumerfinance.gov/rules-policy/regulations/1002/interp-9/

### CFPB complex-algorithm circulars

Historical documents:
- Consumer Financial Protection Circular 2022-03 — adverse-action notification requirements and complex algorithms.
- Consumer Financial Protection Circular 2023-03 — adverse-action notification requirements and proper use of sample forms.

Status:
- CFPB's withdrawn-guidance page states both were withdrawn on May 12, 2025.

Control consequence:
- Do not cite either circular as current CFPB guidance.
- Preserve the useful historical engineering lesson only when clearly labeled historical.
- Use current Regulation B / official interpretations and qualified counsel for live requirements.

Reference:
- https://www.consumerfinance.gov/compliance/guidance/withdrawn-guidance/

### Model risk management

2026 change:
- On April 17, 2026, the Federal Reserve, OCC, and FDIC issued revised interagency model-risk guidance.
- Federal Reserve SR 26-2 states the revised guidance superseded SR 11-7 and SR 21-8.
- The revised guidance states generative AI and agentic AI are outside the scope of that guidance, while broader governance/risk practices should determine controls for tools outside the document.
- OCC Bulletin 2026-13 states the guidance is supervisory guidance, not enforceable prescriptive standards, and is expected to be most relevant to banking organizations over $30 billion, subject to the described risk-based applicability.

Control consequence:
- Do not write “SR 11-7 requires X for ChatGPT/generative AI.”
- Classify the actual system/use case and apply current law, current guidance where applicable, partner requirements, vendor controls, testing, monitoring, and governance appropriate to risk.

References:
- https://www.federalreserve.gov/supervisionreg/srletters/SR2602.htm
- https://www.federalreserve.gov/frrs/guidance/supervisory-guidance-on-model-risk-management.htm
- https://www.occ.gov/news-issuances/bulletins/2026/bulletin-2026-13.html

### Third-party risk management

Current reference baseline:
- June 2023 interagency guidance from Federal Reserve, FDIC, and OCC on third-party relationships for banking organizations.

Key point for Galactic:
- The guidance states a banking organization's use of third parties does not diminish the banking organization's responsibility to operate safely/soundly and comply with applicable law.
- A future sponsor bank may apply due-diligence, contract, monitoring, continuity, and termination expectations to Galactic and to Galactic's material vendors.

Control consequence:
- Maintain vendor inventory, due diligence, contract controls, ongoing monitoring, continuity/exit plans, and evidence appropriate to criticality.
- Do not claim the guidance directly makes Galactic a bank; applicability and contractual flow-down must be assessed for the actual relationship.

References:
- https://www.federalreserve.gov/frrs/guidance/interagency-guidance-on-third-party-relationships.htm
- https://www.occ.gov/news-issuances/bulletins/2023/bulletin-2023-17.html

### FinCEN / SAR confidentiality

Current statutory/control baseline:
- 31 U.S.C. 5318(g)(2) and applicable FinCEN regulations/guidance prohibit notification to a person involved in the reported transaction that the transaction has been reported.
- FinCEN materials emphasize that SARs and information revealing their existence are confidential subject to authorized exceptions.

Control consequence:
- Orbit cannot confirm, deny, hint at, or expose whether a SAR exists, has been filed, or is being considered.
- Any future internal AI touching SAR information requires a specifically approved restricted-data workflow.

References:
- https://www.fincen.gov/resources/answers-frequently-asked-bank-secrecy-act-bsa-questions
- https://www.fincen.gov/disclosure-prohibited

### Customer-service chatbots

Reference baseline:
- CFPB's June 2023 *Chatbots in consumer finance* issue spotlight is a research/issue-spotlight document, not itself a regulation.

Key engineering risk observations:
- inaccurate/unreliable information;
- failure to recognize consumer issues/rights;
- privacy/security risk;
- circular/dead-end support;
- lack of timely human assistance.

Control consequence:
- Orbit identifies itself as automated.
- Regulated/account-specific categories trigger human escalation.
- Production support must have a protected human route; automation cannot be the only path for issues it cannot resolve reliably.

Reference:
- https://www.consumerfinance.gov/data-research/research-reports/chatbots-in-consumer-finance/chatbots-in-consumer-finance/

### FTC Safeguards Rule

Current reference baseline:
- 16 CFR Part 314 applies to financial institutions under FTC jurisdiction, subject to its scope/exemptions and other applicable regulator allocation.
- FTC guidance states covered institutions must maintain an information-security program and address service-provider safeguards.

Control consequence:
- Do not claim the FTC Safeguards Rule automatically applies to Galactic merely because the product looks financial.
- Determine coverage based on actual activities/entity/regulatory jurisdiction.
- Independently of final coverage, maintain strong data/security/vendor controls appropriate to financial data risk and partner requirements.

References:
- https://www.ftc.gov/legal-library/browse/rules/safeguards-rule
- https://www.ftc.gov/business-guidance/resources/ftc-safeguards-rule-what-your-business-needs-know

## Review cadence

Before any live regulated launch and at least whenever one of these events occurs:

- product adds credit/lending;
- product begins holding/transmitting/processing real financial data or money;
- sponsor bank/provider changes;
- new jurisdiction/customer segment is added;
- material AI use changes;
- regulator issues/amends/withdraws relevant authority;
- legal/compliance owner identifies a change;
- annual policy review date is reached.

Record:
- review date;
- reviewer/qualified owner;
- sources checked;
- changes made to code/policy/disclosures;
- items requiring external counsel/partner confirmation.

A stale link or historical regulatory document must never silently become a production authorization.
