# Galactic Trust vs. Varo — product scorecard

Snapshot date: 2026-08-30.

This document is a product benchmark, not marketing copy. Do not publish a claim that Galactic Trust is "better than Varo" until the relevant metric is measured on an approved live program. Varo is an actual regulated bank; Galactic Trust is currently a simulation/white-label fintech prototype.

## Verified Varo baseline

Public Varo materials currently advertise:

- no monthly fees, no overdraft fees, no minimum balance fees, and no in-network ATM fees on the bank account;
- paycheck direct deposit up to two days early;
- access to more than 40,000 fee-free Allpoint ATMs;
- daily cash-flow/category tracking;
- automatic savings via Save Your Pay and Save Your Change;
- a Varo Savings Account with 1.00% base APY and a qualification path to 3.75% APY on balances up to $5,000 (rate/requirements subject to change);
- Varo Believe, a secured credit-building card with no credit check to apply, no interest or annual fee, and reporting to all three major credit bureaus, subject to qualification;
- Varo Advance, a small-dollar credit product with disclosed flat upfront fees that vary by advance amount and qualifying deposits.

Primary sources reviewed:
- https://www.varomoney.com/bank-account/
- https://www.varomoney.com/savings-account/
- https://www.varomoney.com/credit-builder/
- https://support.varomoney.com/hc/en-us/articles/20666259418644-Varo-Advance-Fees

## Our strategy: win on clarity + operations, not reckless feature count

### 1. Cash-flow clarity
Target experience:
- one conservative spendable estimate;
- 7/14/30-day projections;
- upcoming bills, planned savings, and expected income in one timeline;
- user-controlled reserve;
- confidence labels and explicit limitations;
- no guarantee that a forecast amount is safe to spend.

Proof metric before live marketing:
- >=90% of research participants can correctly explain why the spendable estimate changed after a five-minute usability test.

### 2. Savings automation
Prototype target:
- configurable savings goals and planned contributions;
- "what happens if" forecasting before a rule is activated;
- future provider-backed automation must be opt-in, reversible, and show the expected post-transfer available balance before confirmation.

Live gate:
- no automated real transfer until an approved provider/program supplies the underlying account and money-movement permissions.

### 3. Fee and limit transparency
Target:
- every fee, limit, hold, pending-state rule, and eligibility condition shown before confirmation;
- no dark patterns around advances, overdraft-like products, subscriptions, or credit;
- a single in-app "What could this cost me?" explanation for any paid financial product.

Proof metric:
- 100% of paid-product confirmation screens expose the total known fee/cost and key eligibility/repayment terms before acceptance.

### 4. Support speed
Target operating metrics for a future approved beta:
- urgent account-security acknowledgement: <5 minutes during staffed coverage;
- normal in-app support first response: <10 minutes during staffed coverage;
- clear escalation path and case/reference ID on every support incident.

These are internal targets, not promised SLAs until staffing and operations prove them sustainable.

### 5. Reliability and ledger integrity
Permanent target:
- append-only double-entry journals;
- idempotent money-event processing;
- daily account-vs-GL-vs-provider reconciliation before scale;
- zero unresolved unexplained ledger differences at daily close;
- duplicate/out-of-order webhook tests before production provider certification.

### 6. White-label speed
Our structural differentiator:
- one codebase can support multiple approved brands/tenants with isolated configuration, disclosures, visual identity, and data boundaries.

Target after partner certification:
- new approved tenant demo environment in <1 business day;
- production tenant launch time measured only after sponsor-bank/BaaS approval workflow is understood.

### 7. Accessibility and mobile quality
Target:
- WCAG-oriented keyboard/focus/contrast review;
- VoiceOver/TalkBack critical-flow testing;
- iPhone viewport and keyboard tests for all money-related confirmations;
- no critical action hidden behind hover-only interaction.

### 8. Security and trust
Target:
- unique operator identities;
- phishing-resistant MFA/passkeys where supported;
- least-privilege roles;
- short-lived sessions and strong re-authentication for sensitive actions;
- privacy-safe correlation IDs;
- no secrets in browser bundles, logs, tickets, issues, or chat;
- documented break-glass and incident procedures.

## Features we will not rush just to match a competitor

Do not add these as "live" features until the regulated, risk, operational, and provider requirements are actually satisfied:

- overdraft or advance/loan products;
- credit-building cards or credit bureau reporting;
- real card issuance;
- ACH/wires/direct deposit;
- APY/interest claims;
- FDIC/sponsor-bank claims;
- production KYC/KYB/AML decisions;
- production provider webhooks;
- real-time payments/Zelle-like functionality.

## Definition of "better"

For Galactic Trust, "better" should mean measurable improvement in:

1. customer comprehension;
2. financial-control UX;
3. transparent costs and limits;
4. support responsiveness;
5. security and privacy;
6. reconciliation reliability;
7. accessibility;
8. partner/tenant launch efficiency.

It should never mean making unsupported safety, banking, insurance, rate, or credit claims.
