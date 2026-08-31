# Galactic compliance applicability and ownership operating model

## Purpose

Galactic is building compliance **infrastructure and evidence discipline**, not a software-generated declaration that the company is compliant.

This operating model exists to stop several common failures:

- treating a regulation, handbook, exam manual, or enforcement framework as automatically applicable to Galactic without analyzing the actual entity and activity;
- assuming a sponsor bank owns every obligation because a fintech uses its rails;
- assuming the fintech owns a bank obligation merely because its user interface resembles a bank;
- marking an obligation complete because a policy document exists;
- letting software invent a BSA officer, compliance owner, board approval, legal conclusion, audit result, or examination status;
- allowing a future charter goal to contaminate the current simulation-only posture.

The permanent rule is:

> source identified ≠ applicable law determined ≠ owner assigned ≠ control designed ≠ control operating ≠ control tested ≠ externally approved.

## Current posture

As of August 30, 2026:

- Galactic Trust is represented in this repository as a simulation-only online-banking experience and future institution-building project;
- no bank charter is represented as effective;
- no FDIC insurance is represented as effective;
- no sponsor-bank or BaaS production program is represented as approved;
- no legal/compliance applicability review is represented as complete;
- no compliance responsibility matrix is represented as assigned;
- no production compliance-management system is represented as operating;
- no production BSA/AML program is represented as operating;
- no production OFAC/sanctions compliance program is represented as operating;
- no independent compliance testing or examination readiness is represented as verified.

## Source hierarchy

The machine-readable register currently includes official sources from:

1. **OCC — Compliance Management Systems, Comptroller’s Handbook, June 2018**
   - Applies by its own terms to OCC supervision of national banks and federal savings associations.
   - Galactic uses it as a future-bank control-design reference unless and until an applicable OCC-supervised charter/scope exists.
   - Source: https://www.occ.treas.gov/publications-and-resources/publications/comptrollers-handbook/files/compliance-mgmt-systems/index-compliance-management-systems.html

2. **OCC — Corporate and Risk Governance, Comptroller’s Handbook, July 2019**
   - Used as a future-bank governance design reference.
   - It is not evidence that Galactic is currently an OCC-supervised institution.
   - Source: https://www.occ.treas.gov/publications-and-resources/publications/comptrollers-handbook/files/corporate-risk-governance/index-corporate-and-risk-governance.html

3. **FFIEC BSA/AML Examination Manual — current online manual**
   - The current manual describes examination expectations for banks, including a written BSA/AML program, board approval, internal controls, independent testing, a BSA compliance officer, training, and covered customer-identification/CDD controls.
   - The register uses these as future-bank evidence categories; it does not claim Galactic currently operates or is legally required to operate such a bank program.
   - Source: https://bsaaml.ffiec.gov/manual

4. **OFAC — A Framework for OFAC Compliance Commitments, May 2, 2019**
   - Describes OFAC’s perspective on essential components of a risk-based sanctions compliance program for organizations within the relevant U.S. jurisdictional/activity scope.
   - Exact Galactic sanctions obligations must be assessed against the real entity, activity, counterparties, geographies, products, and applicable sanctions programs.
   - Source: https://ofac.treasury.gov/recent-actions/20190502_33

These references are not exhaustive. State law, consumer-financial law, privacy/data-security law, money-transmission law, card/network requirements, ACH rules, lending law, UDAAP/UDAP, EFTA/Reg E, TILA/Reg Z, ECOA/Reg B, FCRA, GLBA, BSA/AML, OFAC, sponsor contractual requirements, and charter-specific rules must be evaluated only when the actual product/entity/jurisdiction facts make them relevant.

## Applicability workflow

Every material obligation should move through these states with evidence preserved in an access-controlled diligence system.

### 1. Source identified

Record:

- authority;
- source title;
- version/publication date;
- canonical source;
- date source was re-checked;
- whether it is statute/regulation, official interpretation, regulator handbook, interagency manual, supervisory statement, enforcement framework, contractual requirement, or other authority.

Do not treat a blog, vendor sales page, AI answer, or secondary article as the authoritative source when an official source exists.

### 2. Entity/activity facts fixed

Before deciding applicability, document the actual facts, including as applicable:

- legal entity/entities;
- charter or no-charter status;
- sponsor-bank/program role;
- who legally holds customer funds;
- who is the account issuer/provider;
- who performs KYC/CIP/CDD;
- who files or owns BSA/AML reporting obligations;
- products and transaction types;
- customer types;
- geographies/jurisdictions;
- channels;
- vendors/subprocessors;
- data types;
- credit/lending activity;
- card/payment/ACH/wire activity;
- marketing/disclosure role.

No applicability decision should be promoted from a product mockup or planned feature alone.

### 3. Qualified applicability decision

For each obligation, preserve:

- proposed decision: applicable / not applicable / deferred;
- source(s);
- factual assumptions;
- reasoning;
- accountable business/compliance owner role;
- qualified reviewer role;
- review date;
- private evidence reference;
- open questions and conditions.

A software-generated structurally complete package is still only a **candidate for qualified review**.

### 4. Responsibility assigned

When applicable, identify accountable human roles for:

- board oversight, where applicable;
- executive owner;
- compliance owner;
- first-line business/control owner;
- legal reviewer;
- second-line testing/monitoring owner;
- independent audit/testing owner;
- technology/data owner;
- vendor owner;
- incident/escalation owner.

Named individuals and sensitive personnel records belong in private systems, not this public repository.

### 5. Policy/control mapping

Map the obligation to:

- policy;
- procedure;
- preventive control;
- detective control;
- approval/dual-control requirement;
- system enforcement;
- logs/audit trail;
- customer disclosure;
- training;
- monitoring/KRI/KPI;
- incident/remediation procedure;
- retention requirement;
- vendor/contract control.

A policy alone is not operating evidence.

### 6. Operating evidence

Examples can include, where appropriate:

- access-controlled approvals;
- test results;
- system logs;
- reconciliation evidence;
- training completion;
- case handling evidence;
- monitoring alerts and dispositions;
- board/committee materials;
- vendor-review evidence;
- control attestations;
- sampled transaction/case evidence;
- exception/remediation records.

Do not store SARs, SAR existence/consideration indicators, government IDs, customer secrets, personal financial information, regulator-confidential material, privileged legal advice, or other restricted evidence in this public repository.

### 7. Independent testing

Where required or appropriate, evidence must show:

- tester independence;
- scope;
- population/sample methodology;
- testing period;
- findings;
- severity;
- management response;
- remediation owner/date;
- validation/closure evidence.

Software CI is not independent compliance testing.

### 8. Change management

Reassess applicability and controls when any of these change:

- legal entity or ownership;
- charter strategy;
- sponsor/provider;
- product or pricing;
- money flow;
- customer segment;
- state/country footprint;
- vendor/data flow;
- marketing claims;
- credit/lending activity;
- regulation/guidance;
- enforcement posture;
- material incident or complaint trend.

## Compliance-management-system design categories

For a future bank candidate, the current source set supports building evidence categories around:

- board and management oversight;
- policies and procedures;
- training;
- monitoring and audit;
- complaint response;
- change management;
- third-party oversight;
- BSA/AML internal controls;
- BSA/AML independent testing;
- qualified BSA compliance ownership;
- BSA/AML training;
- customer-identification controls where applicable;
- risk-based sanctions compliance controls.

These categories are **not marked applicable or operating** merely because they exist in the register.

## Sponsor-program responsibility mapping

Before any live sponsor-bank/BaaS launch, build a signed responsibility matrix that states who owns each obligation and control across:

- Galactic;
- sponsor bank;
- BaaS/middleware provider;
- KYC/CIP/CDD provider;
- fraud/transaction-monitoring provider;
- card processor/network/program manager;
- ACH/payment vendors;
- customer-support vendors;
- security/observability vendors.

For each row document:

- legal/regulatory/contract source;
- accountable party;
- performing party;
- approving party;
- evidence owner;
- escalation path;
- SLA/deadline;
- data access;
- audit rights;
- termination/transition handling.

A vendor performing a control does not automatically transfer the regulated entity’s responsibility.

## Future-charter governance gates

Before representing Galactic as ready to submit or operate under a bank charter, at minimum the applicable program should have evidence for:

- qualified organizers, board, and executive management;
- compliance-management-system governance;
- risk management;
- BSA/AML governance and accountable officer where applicable;
- sanctions compliance;
- consumer compliance;
- complaint management;
- independent audit/testing;
- information security/cybersecurity;
- third-party risk;
- model/AI governance where applicable;
- business continuity/disaster recovery;
- accounting/finance/liquidity/capital governance;
- customer terms/disclosures;
- regulatory reporting and recordkeeping;
- issue/remediation tracking;
- change management.

Exact requirements depend on the chosen charter, activities, regulators, ownership structure, and approvals.

## Never-auto-promote rule

The compliance register must never automatically flip any of these to true based on a form submission, document upload, green CI, or AI review:

- legal applicability complete;
- compliant;
- policy approved;
- board approved;
- BSA officer appointed;
- BSA/AML program operating;
- OFAC program operating;
- independent testing passed;
- examination ready;
- sponsor approved;
- charter ready;
- bank charter effective;
- FDIC insurance effective.

Those states require the appropriate accountable human and/or external authority evidence.
