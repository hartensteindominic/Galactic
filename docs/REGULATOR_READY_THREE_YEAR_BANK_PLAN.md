# Galactic Trust — Regulator-Ready Three-Year Bank Plan Skeleton

Status: planning skeleton only — not a filed, approved, regulator-reviewed, or regulator-accepted business plan  
Current operating posture: simulation-only fintech prototype

## Official-source baseline reviewed August 30, 2026

The planning skeleton is grounded in current official materials, including:

- OCC, **Comptroller’s Licensing Manual: Charters** — the organizing group’s business plan, financial projections, risk analysis, and planned risk-management systems/controls are critical to a charter decision. The current booklet says the plan should cover the greater of three years or the period until expected stable profitability.
- OCC, **Business Plan Guidelines** — the plan should be comprehensive, based on in-depth organizer/management planning, realistically address market demand, customers, competition, economic conditions, risks, controls, and capital appropriate to the risk profile.
- FDIC, **Applying for Deposit Insurance – A Handbook for Organizers of De Novo Institutions** — describes a first-three-years plan covering executive summary, business description, marketing, management, records/systems/controls, financial management, monitoring/revision, and financial projections, tailored to size, complexity, and risk profile.

Source URLs are registered in `lib/three-year-bank-plan.ts`.

These sources are design inputs. They do not determine Galactic’s final charter route, filing requirements, capital amount, ownership structure, or regulator sequence.

## No invented numbers rule

The repository must not create default assumptions for:

- customer growth;
- deposits or funding;
- debit/card volume;
- interchange;
- subscription revenue;
- lending balances;
- credit losses;
- fraud losses;
- support costs;
- sponsor/provider costs;
- staffing costs;
- capital requirement;
- liquidity requirement;
- stable-profitability date.

All financial assumptions must come from identified evidence, an accountable plan owner, and appropriate review. A scenario engine is not a regulator-ready forecast merely because it produces arithmetic.

## Required plan sections

The machine-readable skeleton contains twelve sections:

1. **Executive summary and institution thesis**
   - proposed institution and legal/program role;
   - specific customer need and business purpose;
   - strategy and path to safe and sound operation;
   - dependencies and material assumptions.

2. **Market, customers, competition, and economic conditions**
   - evidence-backed target market;
   - customer segments and needs;
   - demand evidence;
   - competitive landscape;
   - economic assumptions;
   - distribution advantage and acquisition plan.

3. **Products, services, pricing, and revenue model**
   - proposed activities and features;
   - customer value proposition;
   - pricing and revenue mechanics;
   - partner/provider dependencies;
   - applicable permissions and product constraints.

4. **Management, board, governance, and accountability**
   - organizers;
   - proposed directors;
   - executive management;
   - control owners;
   - reporting lines;
   - succession;
   - challenge/escalation authority;
   - conflicts and independence.

5. **Records, systems, information security, and internal controls**
   - books and records;
   - ledger/source of truth;
   - reconciliation;
   - access management;
   - change management;
   - cybersecurity;
   - incident response;
   - monitoring and evidence.

6. **Risk, compliance, BSA/AML, sanctions, consumer protection, and audit**
   - risk inventory and appetite/governance;
   - compliance applicability mapping;
   - BSA/AML and sanctions ownership as applicable;
   - complaints and remediation;
   - testing and independent assurance;
   - policy/control evidence.

7. **Financial management and accounting**
   - accounting policies and ownership;
   - management reporting;
   - budgeting and variance analysis;
   - loss assumptions;
   - balance-sheet management;
   - financial controls.

8. **Three-year-or-longer financial projections**
   - projection horizon of at least three years;
   - extend through expected stable profitability when longer under the applicable OCC planning principle;
   - balance sheet;
   - income statement;
   - cash flow / liquidity schedules;
   - capital schedules;
   - key ratios;
   - assumptions;
   - reconciliation between schedules;
   - sensitivity analysis.

9. **Capital, liquidity, funding, and source-of-funds plan**
   - proposal-specific capital target;
   - sources and timing;
   - authenticated source-of-funds evidence;
   - liquidity/funding strategy;
   - contingency capacity;
   - downside capital/liquidity effects.

10. **Third-party dependencies, concentration, continuity, and exit**
    - critical vendors/providers;
    - contractual allocation;
    - data access/portability;
    - monitoring;
    - concentration risk;
    - outage handling;
    - wind-down/exit;
    - customer continuity.

11. **Plan monitoring, variance governance, and revision**
    - accountable owner;
    - management/board reporting cadence;
    - budget-to-actual tracking;
    - threshold triggers;
    - plan-change governance;
    - evidence retention;
    - regulator/sponsor notice or approval analysis as applicable.

12. **Downside, sensitivity, and contingency scenarios**
    - slower customer growth;
    - lower revenue;
    - higher fraud or losses;
    - higher sponsor/provider cost;
    - staffing/compliance cost pressure;
    - delayed profitability;
    - funding/liquidity stress;
    - provider outage/termination;
    - operational/control failure;
    - remediation and recovery capacity.

## Evidence chain

Every material assumption should carry:

- assumption name;
- value/methodology;
- evidence source;
- evidence date;
- accountable owner;
- reviewer;
- sensitivity range;
- dependency or risk;
- validation status;
- reconciliation status where financial;
- last review date.

A narrative paragraph is not sufficient evidence for a financial projection.

## Human governance requirements

A regulator-ready plan requires real organizers, board/management participation, and accountable human ownership. AI may draft, structure, compare, calculate, detect inconsistency, and summarize evidence, but it cannot:

- authenticate organizer or management qualifications;
- approve the plan for the board;
- determine capital adequacy;
- determine legal applicability;
- sign or attest to application materials;
- file on behalf of an organizer;
- represent regulator acceptance;
- make a conditional approval effective;
- authorize the institution to open.

## Structural evaluator boundary

`evaluateThreeYearBankPlanCandidate(...)` may return `structurallyCompleteDraft: true` only when required narrative/evidence fields are populated and the projection horizon is at least three years.

It must keep all substantive approval flags false, including:

- market evidence validated;
- management qualifications verified;
- financial assumptions validated;
- accounting reconciliation verified;
- capital adequacy determined;
- liquidity adequacy determined;
- risk framework approved;
- compliance applicability approved;
- board approved;
- qualified external review complete;
- regulator reviewed;
- regulator accepted;
- approved for charter application.

If expected stable profitability lies beyond the entered projection horizon, the skeleton explicitly reports that the horizon is insufficient for the current OCC planning principle used here.

## Private/confidential materials

Do not commit confidential application exhibits, personal financial statements, background reports, source-of-funds evidence, bank statements, legal advice, confidential regulator correspondence, credentials, or customer data to this public repository. Use non-sensitive references and an appropriately access-controlled evidence repository when one is selected.
