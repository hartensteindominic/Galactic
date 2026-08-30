# Galactic Trust — Fintech-to-Charter Roadmap

## North star

The long-term product goal is to build Galactic Trust into a durable financial institution that may ultimately pursue and, if approved by the relevant authorities, operate under its own bank charter.

That is a **goal**, not a current legal or regulatory status. Galactic Trust is not represented by this repository as a chartered bank, an FDIC-insured depository institution, or an institution authorized to accept insured deposits or conduct live banking activity.

The near-term strategy remains intentionally staged:

1. Prove product demand and operating discipline in a simulation-only fintech product.
2. If appropriate, pursue an approved sponsor-bank / regulated-program path to learn live financial operations under the exact responsibilities and controls approved for that program.
3. Build the management, governance, capital, risk, compliance, audit, finance, operations, security, and evidence base needed to evaluate a future charter route.
4. Select a charter/acquisition structure only after qualified advisers and relevant regulators have evaluated the actual business model and corporate structure.
5. File applications only when organizers, management, capital, business plan, controls, and supporting evidence are genuinely ready.
6. Do not call Galactic Trust a bank or represent deposit insurance until the applicable charter, insurance, and opening authorities are effective and the exact marketing language is approved.

## Why the repo is being designed this way

A sponsor-bank model can reduce time-to-market and allow product learning, but it creates dependency, termination, concentration, data, reconciliation, and operational-continuity risk. A charter can provide more direct institutional control, but it introduces a much higher standard of governance, capital planning, management depth, compliance, supervision, internal controls, auditability, and continuing examination.

The architecture should therefore avoid two traps:

- **Permanent sponsor dependency** — product logic must not become inseparable from one provider's proprietary lifecycle or terminology.
- **Premature bank claims** — software quality, green CI, a BaaS contract, a sandbox, a pre-filing meeting, an application, or even conditional approval must never be represented as authority to operate an insured bank.

## Current official-source baseline

This roadmap is aligned to the current public federal materials reviewed in August 2026, including:

- OCC Charters materials: an organizing group must apply for and obtain OCC approval before establishing a national bank or federal savings association; the charter review emphasizes the organizers' business plan, financial projections, risk analysis, and planned risk-management systems and controls.
- FDIC de novo deposit-insurance materials: the FDIC emphasizes sound business plans, experienced board and management leadership, and capital appropriate to the proposed institution. The FDIC does not prescribe one universal dollar capital amount for every de novo proposal.
- Federal Reserve application materials: Federal Reserve filings may be implicated by the chosen ownership, holding-company, membership, acquisition, or other structure. The exact filings must be determined from the final structure rather than assumed now.

These source references are planning inputs, not legal advice or approval evidence. The exact route and filing requirements must be confirmed for the actual entity, ownership structure, products, activities, locations, and proposed charter.

## Stage 0 — Product truth before financial claims

**Objective:** prove that Galactic can build reliable financial software without pretending software controls equal regulatory authority.

Current evidence already includes:

- simulation-only balances and transfers;
- fail-closed live-money gates;
- explicit tenant boundaries;
- idempotency and ambiguous-transfer state handling;
- transaction and double-entry reconciliation designs;
- append-only accounting evidence;
- controlled prototype terms;
- incident-status truthfulness;
- vendor/data-flow inventory;
- operator audit evidence design;
- emergency money-movement freeze design;
- privacy and error-sanitization boundaries;
- provider-neutral adapter and webhook-authenticity contracts.

**Still required:** persistent environment exercises, security assurance, device/accessibility testing, human operating procedures, qualified external review, and a real customer/distribution thesis.

## Stage 1 — Prove the business model, not just the app

Before capital is raised around a banking thesis, Galactic should be able to complete this sentence with evidence:

> Galactic Trust serves **[specific customer / distribution channel]**, solves **[specific painful financial problem]** through **[specific differentiated mechanism]**, and earns durable revenue through **[specific revenue sources]** with economics that do not depend on optimistic interchange assumptions alone.

The following remain intentionally unresolved until supported by research and real evidence:

- primary customer segment;
- primary painful use case;
- distribution advantage;
- primary non-interchange revenue stream;
- expected customer-acquisition cost;
- retention and primary-account behavior;
- gross contribution after sponsor/provider, fraud, support, compliance, card/payment, and servicing costs;
- fraud-loss assumptions;
- support cost per active customer;
- liquidity/deposit behavior assumptions for any future bank model;
- concentration limits by customer type, geography, channel, vendor, and revenue source.

A generic “better neobank UX” is not treated as a sufficient charter thesis.

## Stage 2 — Sponsor-program learning without architectural lock-in

If Galactic pursues live financial services before a charter, the approved sponsor/program becomes the legal and operational boundary for the permitted activity.

Required design principles:

- provider-specific states map into a provider-neutral internal financial-intent model;
- provider failure or disappearance never becomes automatic customer-facing success/failure without authoritative evidence;
- exact provider webhook authenticity and anti-replay requirements are implemented only from selected-provider documentation;
- reconciliation compares Galactic records with authoritative provider records/statements;
- customer disclosures identify the actual roles of Galactic and the regulated institution using approved wording;
- exit/termination and customer-continuity procedures are part of provider diligence;
- no single-provider assumption is embedded so deeply that a future migration or charter transition becomes impossible;
- sensitive data flows and retention are explicitly approved before live customer data is sent to a vendor.

A second sponsor relationship may or may not be commercially or operationally appropriate; the roadmap does not assume that redundancy is automatically available or approved.

## Stage 3 — Charter feasibility decision

A charter is not automatically the correct next step merely because the fintech is growing. A formal feasibility decision should evaluate at least:

- de novo charter versus acquiring an existing insured depository institution;
- national versus state charter considerations;
- federal savings association or other structure if relevant;
- ownership and holding-company implications;
- geographic/community strategy;
- products and activities;
- deposit and funding model;
- lending/credit strategy, if any;
- asset/liability and liquidity profile;
- proposed management and board;
- capital needs and sources;
- profitability path under conservative assumptions;
- compliance and risk-management staffing;
- internal audit and independent assurance;
- core banking, payments, card, fraud, identity, accounting, reporting, cybersecurity, and continuity architecture;
- regulatory and application sequencing;
- acquisition integration risk if an acquisition route is considered.

The selected route must be documented with qualified legal, regulatory, tax, accounting, and capital-markets advice appropriate to the actual transaction/entity.

## Stage 4 — Organizer and management readiness

A future bank cannot be an AI-operated shell. Before a serious application, Galactic should have identifiable, qualified humans with clear authority and accountability across at least:

- board governance;
- chief executive leadership;
- finance / capital / treasury;
- risk management;
- compliance / BSA-AML as applicable;
- operations;
- technology / information security;
- fraud / financial crime operations;
- customer service / complaints / disputes;
- legal;
- internal audit or an appropriately independent audit function.

The exact titles, independence requirements, staffing levels, and responsibilities depend on the proposed institution and must be confirmed with the applicable authorities and advisers.

No repository document, AI assistant, contractor template, or automated workflow can substitute for the accountable humans required to operate and govern a bank.

## Stage 5 — Regulator-ready business and capital plan

The bank plan must be substantially more rigorous than an investor deck. It should be internally consistent and supported by evidence across:

- market and customer need;
- competitive environment;
- products and pricing;
- distribution;
- three-year or otherwise applicable financial projections;
- balance sheet and income statement;
- capital;
- liquidity and funding;
- interest-rate risk as applicable;
- credit risk as applicable;
- operational risk;
- compliance risk;
- cybersecurity and technology risk;
- third-party risk;
- fraud losses and controls;
- staffing;
- premises/remote operating model;
- accounting and financial reporting;
- internal controls;
- internal audit;
- contingency and recovery;
- sensitivity/downside scenarios;
- stable-profitability path.

**Capital rule for this repository:** never hard-code a universal dollar amount as “the capital required to get a bank charter.” Capital depends on the exact proposal, risk, activities, size, structure, regulator, and conditions. Any capital number shown to investors or regulators must be labeled by source, date, purpose, and assumptions.

## Stage 6 — Application and conditional approval

Potential application workstreams may include chartering, deposit insurance, holding-company/membership/control filings, and other approvals depending on the selected structure.

Repository status must distinguish:

- planning an application;
- pre-filing engagement;
- application drafted;
- application filed;
- application accepted as complete;
- preliminary/conditional approval;
- conditions outstanding;
- pre-opening examination/readiness;
- final authority to open;
- effective charter;
- effective deposit insurance.

None of those states may be collapsed into “we are a bank.”

## Stage 7 — Pre-opening bank build

Conditional approval, if ever obtained, is not the finish line. Before opening, a future institution may need to demonstrate that its actual operating environment satisfies applicable conditions and is ready for safe and sound operation.

Expected readiness areas include:

- committed and funded capital;
- approved management and board;
- production core/ledger and reconciliations;
- deposit/account operations;
- payments and card controls as applicable;
- customer identification and financial-crime controls as applicable;
- liquidity/treasury operations;
- financial reporting and regulatory reporting;
- cybersecurity and identity/access management;
- fraud monitoring and loss-management operations;
- complaints/disputes/error-resolution operations;
- vendor oversight;
- business continuity and disaster recovery;
- incident management;
- policies and procedures;
- training;
- independent testing/audit;
- opening-condition evidence.

## Stage 8 — Operate like a bank, not a startup with a charter

A charter creates continuing obligations and supervision; it is not a permanent regulatory exemption. The long-term operating design should assume recurring examinations, reporting, capital/liquidity management, board oversight, audit, compliance testing, risk assessments, vendor review, change management, customer protection, financial crime controls, security operations, and remediation.

The internal culture goal is therefore:

> **Move quickly in software; move deliberately in financial authority.**

## Near-term workstream for Galactic

While live-bank gates remain off, the highest-value work is:

1. Keep improving the simulation ledger, reconciliation, incident, security, and operational evidence.
2. Complete a defensible customer/wedge and revenue thesis.
3. Build a driver-based unit-economics model including fraud, support, compliance, sponsor/provider, card/payment, and servicing costs.
4. Build sponsor/BaaS diligence materials and provider-exit requirements without selecting a provider prematurely.
5. Build a charter-readiness evidence index that maps future application claims to accountable human owners and source evidence.
6. Develop regulator-style three-year planning templates without filling them with invented numbers.
7. Recruit/identify the human expertise that software cannot provide.
8. Preserve product/provider portability so the software can support sponsor-program learning today and a different regulated structure later.

## Hard truth boundary

ChatGPT can help build software, test controls, prepare evidence structures, draft internal materials, model scenarios, organize diligence questions, and explain public regulatory materials. It cannot:

- form or govern the proposed bank;
- serve as the accountable board or bank officer;
- attest to founder/organizer backgrounds;
- prove capital or source of funds;
- submit or sign regulatory applications as the organizer;
- provide legal representation;
- make regulators approve an application;
- conduct an independent audit of its own work;
- authorize deposit-taking or money movement;
- make an institution FDIC insured;
- turn a conditional approval into authority to open.

Every external milestone must be supported by real third-party or regulator evidence before this repository marks it complete.
