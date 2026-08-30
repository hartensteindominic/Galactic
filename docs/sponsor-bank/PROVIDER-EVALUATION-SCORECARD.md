# Galactic Trust — Banking Provider Evaluation Scorecard

## Purpose
Use this scorecard to compare potential sponsor-bank/BaaS/program-platform candidates before Galactic Trust commits to a provider-specific sandbox implementation.

Current research targets may include Synctera, Treasury Prime, Unit, Increase, or another qualified provider. A name appearing here is **not** an endorsement, contract, regulatory approval, or confirmed fit.

Verify all provider capabilities, bank relationships, geography, program appetite, pricing, and regulatory responsibilities directly from current authoritative materials and the provider before selection.

## Hard gates — PASS required
A candidate is not selected if any launch-critical hard gate is unresolved.

### Program / legal model
- [ ] Provider clearly explains its legal/program role.
- [ ] Actual sponsor-bank/regulated institution role is identified for the proposed program.
- [ ] Provider confirms whether the intended product/geography is in scope.
- [ ] New York availability/limitations are explicitly understood.
- [ ] Customer agreement/service-provider roles can be documented accurately.
- [ ] Funds-flow/ownership model can be documented.
- [ ] No requirement would force Galactic Trust to make a false bank/FDIC claim.

### Sandbox / integration
- [ ] Sandbox/evaluation access is available under acceptable terms.
- [ ] Sandbox customer creation.
- [ ] KYC/CIP test fixtures or approved test workflow.
- [ ] Deposit/checking account test objects if in scope.
- [ ] ACH test transfers.
- [ ] ACH return/reversal test path.
- [ ] Signed webhooks.
- [ ] Stable unique event identifiers.
- [ ] Idempotency for provider writes.
- [ ] Event history/replay/recovery mechanism or equivalent support.

### Reconciliation
- [ ] Provider account balance API/report.
- [ ] Transaction/transfer history suitable for reconciliation.
- [ ] Return/reversal evidence.
- [ ] Stable identifiers join provider events/API objects/reports.
- [ ] Daily or periodic reconciliation data available.

### Security / operations
- [ ] Provider security diligence package available at an appropriate stage.
- [ ] Incident escalation process.
- [ ] Sandbox/production credential separation.
- [ ] Webhook key rotation process.
- [ ] Business continuity / recovery posture can be evaluated.
- [ ] Data/subprocessor posture can be evaluated.

### Customer protection
- [ ] KYC/CIP responsibility split can be documented.
- [ ] OFAC/sanctions responsibility split can be documented.
- [ ] AML/transaction-monitoring responsibility split can be documented.
- [ ] Fraud responsibility/loss allocation can be documented.
- [ ] Account restriction/freeze workflow can be supported.
- [ ] Error/dispute/complaint responsibilities can be documented.

### Commercial viability
- [ ] Setup/implementation fee understood.
- [ ] Monthly/minimum commitment understood.
- [ ] Per-account/ACH/card/other unit economics understood.
- [ ] Reserve/prefund/collateral requirements understood.
- [ ] Contract/termination timeline understood.
- [ ] Economics are viable for the intended beta-to-production path.

## Weighted score — 100 points
Score each category only after the hard gates are sufficiently understood.

### 1. Regulatory / program fit — 25 points
- sponsor-bank/program structure clarity — 6
- geography / New York fit — 5
- KYC/CIP/OFAC/AML responsibility clarity — 5
- customer-disclosure/account-role clarity — 4
- program approval/onboarding fit for Galactic's stage — 5

### 2. Core banking capability — 18 points
- account creation/lifecycle — 4
- ACH + returns/reversals — 5
- balance/transaction state quality — 3
- restrictions/freeze controls — 2
- future card readiness — 2
- statements/operational servicing support — 2

### 3. Integration quality — 15 points
- API clarity/stability — 4
- sandbox quality — 4
- webhook signing/event quality — 3
- idempotency/retry guidance — 2
- SDK/examples/developer support — 2

### 4. Reconciliation / financial operations — 15 points
- account balances/authoritative data — 4
- transaction/settlement/return evidence — 4
- event/report identifier linkage — 3
- reconciliation exports/APIs — 2
- operational discrepancy support — 2

### 5. Security / resilience / vendor risk — 10 points
- security assurance — 3
- incident response/escalation — 2
- business continuity/recovery — 2
- data/subprocessor transparency — 2
- access/audit tooling — 1

### 6. Commercial viability — 12 points
- minimums/setup cost — 4
- unit economics — 3
- reserve/prefund burden — 2
- implementation/certification effort — 2
- termination/portability — 1

### 7. Support / partnership quality — 5 points
- implementation support — 2
- banking/compliance collaboration — 2
- operational escalation quality — 1

## Candidate worksheet

| Category | Weight | Candidate A | Candidate B | Candidate C | Candidate D |
| --- | ---: | ---: | ---: | ---: | ---: |
| Regulatory / program fit | 25 |  |  |  |  |
| Core banking capability | 18 |  |  |  |  |
| Integration quality | 15 |  |  |  |  |
| Reconciliation / operations | 15 |  |  |  |  |
| Security / resilience | 10 |  |  |  |  |
| Commercial viability | 12 |  |  |  |  |
| Support / partnership | 5 |  |  |  |  |
| **Total** | **100** |  |  |  |  |

## Evidence standard
For each non-trivial score, attach a source/evidence reference:
- official current provider documentation;
- written provider response;
- contract/program document;
- sandbox test evidence;
- security/diligence document;
- pricing/proposal.

Do not assign a high score based only on marketing copy.

## Sandbox technical acceptance
Before naming a technical winner, run the Galactic provider-sandbox evidence loop:

> operator-signed one-time certification -> sandbox customer -> sandbox KYC -> sandbox account -> $25 sandbox ACH -> signed webhook -> durable dedupe -> leased processing -> balanced journal -> duplicate webhook replay -> event reconciliation -> account reconciliation -> ACH return -> recovery/terminal review -> audit evidence.

Use `SANDBOX-EVIDENCE-TEMPLATE.md`.

## Decision outcome
Record one:
- `research_only`
- `requesting_information`
- `sandbox_candidate`
- `sandbox_approved_for_testing`
- `commercial_due_diligence`
- `contract_review`
- `production_candidate`
- `rejected`

A provider should not become a production candidate until the regulated program structure and actual sponsor-bank/provider approval path are understood.
