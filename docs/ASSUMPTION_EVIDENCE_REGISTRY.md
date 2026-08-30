# Galactic Trust — Assumption Evidence Registry

Status: planning and evidence-schema infrastructure only  
Current operating posture: simulation-only fintech prototype

## Purpose

The business thesis, unit-economics model, capital workbench, three-year bank plan, and sponsor-diligence pack must not evolve into separate sets of convenient assumptions that cannot be reconciled later.

This registry creates one evidence discipline:

> assumption entered ≠ evidence referenced ≠ evidence authenticated ≠ owner verified ≠ methodology validated ≠ sensitivity validated ≠ financial schedules reconciled ≠ sponsor/board/regulator approved.

The repository must preserve those states separately.

## Machine-readable source

`lib/assumption-evidence-registry.ts` defines 22 evidence slots across five domains:

- business thesis;
- unit economics;
- capital planning;
- three-year bank plan;
- sponsor diligence.

Every slot starts:

- `status: evidence-missing`;
- `evidenceAuthenticated: false`;
- `assumptionValidated: false`;
- `approvedForSponsorUse: false`;
- `approvedForBoardUse: false`;
- `approvedForCharterUse: false`.

There is no automatic evidence authentication or readiness promotion.

## Evidence slots

### Business thesis

1. Target customer and demand.
2. Distribution and acquisition advantage.
3. Primary non-interchange revenue model.

### Unit economics

4. Active customer / activity basis.
5. Retained interchange economics.
6. Sponsor/provider/card/payment costs.
7. Fraud and loss assumptions.
8. Support, compliance-operations, and servicing costs.
9. CAC and onboarding/identity cost.
10. Retention and modeled customer lifetime.

### Three-year bank plan

11. Customer/account/activity growth.
12. Deposit/funding mix and behavior.
13. Revenue projection drivers.
14. Loss and expense projection drivers.
15. Stable-profitability horizon.

### Capital planning

16. Planning capital target.
17. Capital commitments and source-of-funds evidence.
18. Pre-opening cost and burn assumptions.
19. Liquidity and contingency assumptions.

### Sponsor diligence

20. Sponsor-program commercial and reserve assumptions.
21. Sponsor-program scope and responsibility assumptions.
22. Provider-exit and portability assumptions.

## Required evidence package per assumption

A candidate package requires:

- evidence slot;
- assumption label;
- value or methodology;
- units / interpretation;
- evidence class;
- non-sensitive evidence reference;
- evidence as-of date;
- accountable human role;
- qualified reviewer role;
- sensitivity range or method;
- downside case;
- dependencies;
- linked decision or projection;
- known limitations;
- review date.

This is deliberately more demanding than a spreadsheet cell because a future sponsor, board, auditor, regulator, or management team must be able to understand where a material assumption came from and how fragile it is.

## Evidence classes

The schema distinguishes:

- **operator-scenario** — a planning input only; not external evidence;
- **internal-operating-data** — actual Galactic operating evidence, once authenticated and appropriate;
- **provider-quote-or-contract** — exact commercial/provider evidence, once an actual provider/program exists;
- **external-authoritative-data** — an identified external data source, still subject to relevance/currentness review;
- **qualified-human-analysis** — an analysis or opinion by an identified qualified reviewer, subject to scope and authority;
- **external-authority-record** — a regulator/sponsor/authority record, which software still cannot authenticate or interpret as legally sufficient by itself.

The class describes the claimed source type. It does not make the evidence valid.

## No-default rule

The registry must not silently invent or populate:

- target customer demand;
- conversion or CAC;
- retained interchange;
- provider/card fees;
- fraud losses;
- support/compliance costs;
- retention/lifetime;
- growth;
- deposits/funding;
- revenue;
- losses/expenses;
- stable profitability;
- charter capital requirement;
- liquidity requirement;
- sponsor reserves;
- sponsor-program scope;
- provider portability.

A blank evidence slot is preferable to a polished but unsupported number.

## Cross-model reconciliation

Eventually, a validated assumption should be traceable across models. Examples:

- a customer-growth assumption in the three-year plan should reconcile to the distribution thesis and acquisition capacity;
- retained interchange used in unit economics should reconcile to the actual selected program economics;
- sponsor/provider/card costs should reconcile across unit economics, sponsor diligence, and three-year expenses;
- fraud/loss assumptions should reconcile across contribution economics and downside projections;
- capital and pre-opening burn assumptions should reconcile between the capital workbench and financial schedules;
- stable-profitability timing should reconcile to the full income statement, balance sheet, liquidity, and capital schedules;
- provider-exit assumptions should reconcile to actual contract terms and the continuity plan.

`linkedFinancialSchedulesReconciled` stays false until that work is actually completed and reviewed.

## Human authority boundary

AI/software may:

- identify missing evidence slots;
- organize references;
- compare assumptions across models;
- calculate scenario effects;
- flag inconsistencies;
- prepare review packages.

AI/software may not:

- authenticate a bank statement, contract, quote, market study, regulator record, or source-of-funds document;
- invent an accountable human owner;
- determine that an assumption is reasonable for legal/regulatory purposes;
- approve methodology, sensitivity, or downside cases;
- approve a forecast for investors, a sponsor, a board, or a charter application;
- treat a successful API response, uploaded file, or green CI run as evidence validation;
- represent an external authority’s acceptance without verified authoritative evidence and accountable human review.

## Sensitive evidence

Actual evidence may contain confidential commercial terms, financial statements, source-of-funds records, customer data, personal information, privileged advice, security reports, or regulator/sponsor correspondence.

Do not commit those materials to this public repository or paste them into AI prompts. Store only non-sensitive references and status metadata here. Actual evidence belongs in an approved access-controlled repository.

## Validation states

A complete draft may only be called **structurally complete for evidence review**.

The evaluator must continue to return false for:

- evidence authenticated;
- evidence current enough for the decision verified;
- accountable owner assignment verified;
- qualified review complete;
- assumption validated;
- methodology approved;
- sensitivity validated;
- downside case validated;
- linked financial schedules reconciled;
- approved for investor use;
- approved for sponsor use;
- approved for board use;
- approved for charter use;
- readiness promotion.

Those states require real evidence and accountable review outside the structural software check.
