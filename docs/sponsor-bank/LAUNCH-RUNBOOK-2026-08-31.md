# Galactic Trust — 24-Hour Public Beta Runbook

**Timezone:** America/New_York  
**Start:** Sunday, August 30, 2026 at approximately 7:53 AM ET  
**Target decision window:** Monday, August 31, 2026 at approximately 7:53 AM ET

This runbook targets a **public compliance-safe demo/beta**, not a live regulated banking launch.

## 7:53–10:00 AM Sunday — Safety foundation and scope freeze
Status: **in progress / substantially completed**

- Keep PR #20 draft and unmerged.
- Keep banking and crypto live-money flags off.
- Publish clear fintech-demo / not-a-chartered-bank language.
- Label sample balances, cards, transfers, activity and crypto as demo/simulated.
- Maintain the Compliance Center.
- Add Public Beta Notice and Support & Safety pages.
- Freeze tomorrow's beta scope: no deposits, live cards, lending, crypto custody/trading, or money transmission.

Exit gate: exact PR head passes CI and no real-money capability can activate accidentally.

## 10:00 AM–1:00 PM Sunday — Sponsor-bank diligence package
Status: **substantially completed**

Complete/review:
- partner packet;
- provider-neutral architecture;
- responsibility/control matrix;
- provider shortlist;
- public-beta launch checklist;
- exact 24-hour runbook.

Current initial diligence order:
1. Synctera
2. Treasury Prime
3. Unit
4. Increase

Exit gate: a banking/provider reviewer can understand the product, risk boundary, funds model, controls, and requested sandbox path without relying on marketing language.

## 1:00–4:00 PM Sunday — Technical beta QA
Run on the exact candidate head:
- typecheck;
- automated safety tests;
- production build;
- route checks for `/`, `/privacy`, `/compliance`, `/beta-notice`, `/support`;
- demo transfer test;
- demo card freeze/unfreeze test;
- demo crypto buy/sell test;
- invalid amount/error tests;
- Orbit secret-sharing guardrail checks.

Confirm public status APIs report demo mode and live financial activity disabled.

Exit gate: all automated gates green and no high-severity manual QA blocker.

## 4:00–7:00 PM Sunday — Mobile and trust review
Test at iPhone/mobile width and desktop:
- sign-in/session behavior;
- dashboard hierarchy;
- compliance ribbon visibility;
- disclosure readability;
- quick-action behavior;
- keyboard/modal interactions;
- Orbit chatbot behavior;
- Privacy, Compliance, Beta Notice and Support navigation.

Review copy specifically for unsupported claims involving:
- bank status;
- FDIC insurance;
- card networks/issuance;
- APY/yield/profit;
- live crypto;
- lending/credit approval.

Exit gate: no reasonable beta user should mistake the demo for an already-live bank account.

## 7:00–10:00 PM Sunday — Provider outreach readiness
Prepare the information providers will ask for:
- legal company name/entity status;
- founders/owners and key team roles;
- product URL/demo;
- target customer profile;
- initial geography;
- intended account/payment/card features;
- expected first-year customer count;
- expected average balances and monthly payment volume;
- source-of-funds/use-case description;
- compliance responsibility proposal;
- current security/engineering controls;
- requested sandbox capabilities.

Do not invent numbers. Mark unknown estimates as TBD until deliberately chosen.

Exit gate: the diligence packet can be submitted without making claims we cannot substantiate.

## 10:00 PM Sunday–1:00 AM Monday — Release hardening
- Review dependency/build output.
- Confirm no secrets in PR, source, logs or public screenshots.
- Confirm production deployment automation cannot promote an unreviewed draft branch by itself.
- Confirm rollback path to last known-good `main` commit.
- Confirm all live financial environment flags are still off.

Exit gate: release is reversible and fail-closed.

## 1:00–5:00 AM Monday — Quiet-period readiness review
No new feature scope.

Only fix:
- build/test failures;
- broken routes;
- authentication blockers;
- misleading compliance copy;
- security regressions;
- severe mobile usability issues.

Defer cosmetic feature additions until after the beta launch.

Exit gate: stable candidate with no scope churn.

## 5:00–7:00 AM Monday — Final pre-launch gate
Use `PUBLIC-BETA-LAUNCH-CHECKLIST.md` line by line.

Required before considering merge/deployment:
- exact release SHA known;
- CI green on exact SHA;
- PR remains reviewable/mergeable;
- no unresolved critical blocker;
- banking status = demo/live money disabled;
- crypto status = demo/live trading disabled;
- public notices render;
- mobile sanity check passes;
- production environment reviewed for accidental activation flags.

## 7:00–7:53 AM Monday — Launch decision
If all beta gates pass:
- explicitly approve the reviewed PR/commit;
- merge/deploy through the normal protected path;
- immediately verify production routes and status endpoints;
- publish only as a financial-technology **beta/demo**;
- start with a small test audience;
- collect errors and usability feedback.

If any hard-stop gate fails:
- do not force the launch;
- keep the current production version;
- fix the blocker on the branch and rerun the exact release gates.

## Monday after public beta
The next regulated milestone is provider sandbox certification, not turning on live money.

Target proof:

`sandbox customer -> provider-approved sandbox KYC -> sandbox account -> simulated ACH -> signed webhook -> idempotent processing -> reconciliation -> customer-visible state -> audit record`

Live banking remains blocked until the sponsor bank/provider, contractual, compliance, disclosure, certification and legal-review requirements are complete.
