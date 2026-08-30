# Sponsor-Bank / Regulated-Program Readiness Checklist

## Purpose

This checklist converts Galactic's 12-month goal into evidence a regulated banking partner, BaaS platform, investor, auditor, insurer, or enterprise design partner can review.

It is not a statement that every sponsor bank has identical requirements. Final diligence, compliance, capital, staffing, insurance, security, and program requirements must be confirmed with the selected partner and qualified counsel/compliance professionals.

## Status vocabulary

- **Implemented** — exists in the current code/docs.
- **Needs exercise** — control exists but has not been proven in the target environment.
- **Needs external owner/vendor** — cannot be satisfied by code alone.
- **Future partner-specific** — must be designed against the selected regulated provider/program.

## 1. Financial ledger and transaction correctness

- [x] Immutable append-only double-entry simulation journals — **Implemented**.
- [x] Zero-sum journal enforcement — **Implemented**.
- [x] Persistent transfer idempotency in the Supabase prototype path — **Implemented**.
- [x] Duplicate request replay avoids a second simulated debit — **Implemented**.
- [x] Transaction-history/account reconciliation — **Implemented**.
- [x] GL/account reconciliation — **Implemented**.
- [ ] Exercise migrations `001`–`004` in a disposable persistent Supabase environment — **Needs exercise**.
- [ ] Exercise network-level ambiguous-response retry, not only UI replay — **Needs exercise**.
- [ ] Reconcile against actual provider statements/events — **Future partner-specific**.
- [ ] Define accounting ownership, close process, exception tolerances, and materiality thresholds — **Needs external owner/vendor**.

## 2. Emergency controls and incident response

- [x] Partner-shell money-movement emergency freeze fails closed by default — **Implemented**.
- [x] Money-movement writes are separately gated from protective card-freeze actions — **Implemented**.
- [x] Emergency control runbook — **Implemented**.
- [ ] Production/provider-side kill switch capable of meeting the partner-approved response objective — **Future partner-specific**.
- [ ] Measured emergency freeze drill — **Needs exercise**.
- [ ] Dual-control process for high-risk unfreeze — **Future partner-specific**.
- [ ] 24/7 escalation/on-call expectations agreed with provider — **Future partner-specific**.
- [ ] Incident notification/regulatory/customer communication matrix — **Needs external owner/vendor**.

## 3. Business continuity and disaster recovery

- [x] Business continuity / DR plan — **Implemented**.
- [x] Migration and immutable-ledger recovery plan — **Implemented**.
- [ ] Database restore/PITR drill into isolated environment — **Needs exercise**.
- [ ] Post-restore ledger reconciliation drill — **Needs exercise**.
- [ ] Application outage tabletop — **Needs exercise**.
- [ ] Provider outage tabletop — **Needs exercise**.
- [ ] Credential-compromise tabletop — **Needs exercise**.
- [ ] Approved RTO/RPO and service dependencies — **Future partner-specific**.
- [ ] Business continuity ownership beyond one person — **Needs external owner/vendor**.

## 4. Security and operator access

- [x] Operator/security access plan drafted — **Implemented**.
- [x] Server-side secret separation for banking, Plaid Sandbox, Supabase, and prototype webhook credentials — **Implemented**.
- [x] API error correlation IDs without intentionally logging raw credentials/request bodies — **Implemented**.
- [x] Browser origin/request guards on sensitive prototype/banking mutations — **Implemented**.
- [ ] Production identity provider and unique operator accounts — **Future partner-specific**.
- [ ] Phishing-resistant MFA/passkeys for privileged operators — **Needs external owner/vendor**.
- [ ] Break-glass workflow exercised — **Needs exercise**.
- [ ] Privileged-access review cadence and evidence — **Needs external owner/vendor**.
- [ ] Independent penetration test before live launch — **Needs external owner/vendor**.
- [ ] Vulnerability management, patch SLAs, and dependency monitoring — **Needs external owner/vendor**.
- [ ] Formal security incident-response ownership — **Needs external owner/vendor**.

## 5. Compliance program

These items depend on product scope, program structure, customer type, partner allocation of responsibilities, and applicable law. They require qualified compliance/legal involvement.

- [ ] Named compliance owner with relevant banking/fintech program experience — **Needs external owner/vendor**.
- [ ] Program risk assessment — **Needs external owner/vendor**.
- [ ] Customer identification/KYC/KYB procedures appropriate to the approved program — **Future partner-specific**.
- [ ] AML/sanctions/fraud monitoring roles and escalation procedures — **Future partner-specific**.
- [ ] Suspicious activity escalation/reporting responsibilities allocated with the partner — **Future partner-specific**.
- [ ] Consumer compliance review for fees, limits, disclosures, complaints, marketing, adverse actions, and error resolution as applicable — **Needs external owner/vendor**.
- [ ] Complaint-management process and evidence retention — **Needs external owner/vendor**.
- [ ] Vendor-management / third-party risk process — **Needs external owner/vendor**.
- [ ] Formal policy approval/governance process appropriate to company structure — **Needs external owner/vendor**.

## 6. Banking/provider integration

- [x] Provider-neutral partner gateway shell is fail closed — **Implemented**.
- [x] Live writes require explicit partner mode, complete provider config, explicit write enablement, and emergency unfreeze — **Implemented**.
- [x] Plaid Sandbox is clearly separated from production banking — **Implemented**.
- [x] Prototype sandbox webhook inbox is clearly not represented as production provider verification — **Implemented**.
- [ ] Select sponsor bank/BaaS/provider after diligence — **Needs external owner/vendor**.
- [ ] Implement exact provider authentication/signing requirements — **Future partner-specific**.
- [ ] Implement exact production webhook signature verification and replay controls — **Future partner-specific**.
- [ ] Define ACH/payment/card lifecycle state machines from provider documentation — **Future partner-specific**.
- [ ] Provider statement/file/API reconciliation — **Future partner-specific**.
- [ ] Provider certification/UAT and failure testing — **Future partner-specific**.

## 7. Product and customer experience

- [x] White-label tenant shell — **Implemented**.
- [x] Explicit simulation/live-state disclosures — **Implemented**.
- [x] Safe-to-Spend / forward cash-flow prototype — **Implemented**.
- [x] Competitive quality scorecard with a rule against unproven “better than” claims — **Implemented**.
- [ ] Accessibility audit and iPhone/device testing — **Needs exercise**.
- [ ] Customer support service levels and escalation process — **Needs external owner/vendor**.
- [ ] Transparent fees/limits/eligibility center tied to the actual approved program — **Future partner-specific**.
- [ ] Design-partner testing with documented customer outcomes — **Needs external owner/vendor**.

## 8. Corporate resilience and key-person risk

- [ ] At least one additional person can operate/recover the system without the founder — **Needs external owner/vendor**.
- [ ] Access escrow / continuity procedure for source control, cloud, domain, provider, and incident systems — **Needs external owner/vendor**.
- [ ] Succession/key-person continuity plan — **Needs external owner/vendor**.
- [ ] Segregation of duties for production financial operations — **Needs external owner/vendor**.
- [ ] Board/adviser/governance cadence appropriate to stage and partner expectations — **Needs external owner/vendor**.

## 9. Insurance, legal, and financial capacity

- [ ] Qualified fintech/banking counsel retained — **Needs external owner/vendor**.
- [ ] Cyber liability coverage appropriate to partner requirements — **Needs external owner/vendor**.
- [ ] Technology E&O / professional liability coverage appropriate to partner requirements — **Needs external owner/vendor**.
- [ ] Corporate contracts, privacy terms, customer terms, and vendor DPAs reviewed — **Needs external owner/vendor**.
- [ ] Demonstrated runway/capital plan sufficient for onboarding, compliance, engineering, insurance, audits, support, and program reserves required by the selected partner — **Needs external owner/vendor**.
- [ ] Financial controls/bookkeeping/tax ownership established — **Needs external owner/vendor**.

Do not hard-code a universal sponsor-bank capital number into product claims. Required capital and reserve structures vary materially by partner, program, risk, transaction volume, product scope, and company maturity.

## 10. Evidence package for diligence

Maintain a diligence folder containing current versions of:

- Architecture and data-flow diagrams.
- Product and white-label spec.
- Ledger schema/migration history.
- Reconciliation design and sample evidence.
- Idempotency/retry evidence.
- Emergency-control runbook and drill evidence.
- Business continuity/DR plan and restore-drill evidence.
- Security/operator-access plan.
- Vulnerability/penetration-test reports when available.
- Compliance policies/risk assessments when approved.
- Vendor inventory and responsibility matrix.
- Insurance certificates when bound.
- Incident/complaint procedures.
- Corporate ownership/governance documents requested by the partner.
- Financial runway/budget evidence requested during diligence.

## Current bottom line

Galactic has meaningful **software-control readiness** in the simulation layer, but it is not yet a live bank or an approved live banking program. The next phase is to prove the controls in real non-production environments and add the people, compliance, insurance, provider, security-assurance, and operational ownership that code alone cannot supply.
