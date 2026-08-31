# Galactic Trust — Charter Evidence Index

## Purpose

The long-term charter goal requires more than polished documents. Every material claim must eventually be traceable to an accountable human owner and evidence that is appropriate to the actual charter path.

`lib/charter-evidence-index.ts` is a **planning index and evidence-shape guard**. It does not authenticate documents, validate legal sufficiency, determine whether a regulator has accepted a filing, or make a regulatory status effective.

This document describes how future evidence should be organized without turning this public source repository into a storage location for confidential diligence material.

## Never store sensitive diligence evidence in this public repository

Do **not** commit:

- government IDs;
- Social Security numbers or tax IDs;
- background-check reports;
- personal financial statements;
- bank statements;
- investor wire details;
- source-of-funds documentation;
- private regulator correspondence;
- confidential application packages;
- credentials, API keys, signing secrets, passwords, recovery codes, or private keys;
- customer PII or financial data;
- confidential board/management personal information;
- privileged legal advice.

The repository should store only control logic, public-source references, templates, non-sensitive status metadata, and opaque evidence references that point to an appropriately access-controlled diligence system.

## Evidence record shape

A future private evidence system should preserve at least:

- claim ID;
- human-readable claim;
- accountable human role and named owner in the private system;
- evidence type;
- evidence reference / private document ID;
- source organization or authority when applicable;
- source date;
- received date;
- version;
- reviewer;
- review date;
- review conclusion;
- outstanding conditions or limitations;
- expiration/refresh date when applicable;
- retention classification;
- confidentiality/access classification;
- superseded/revoked status;
- linkage to the business plan, application, policy, control, or milestone supported by the evidence.

## Proof classes

### 1. Internal operating data

Examples include customer research, cohort behavior, acquisition cost, fraud losses, support cost, provider cost, retention, revenue mix, and unit-economics evidence.

The scenario calculator in this repository does not create validated operating evidence by itself. Inputs must be sourced and reviewed.

### 2. Qualified-human review

Examples include charter-route analysis, governance design, business-plan review, capital-plan review, compliance analysis, and other areas where software cannot substitute for accountable qualified professional judgment.

A document drafted with AI assistance is still only a draft until the responsible human reviews and adopts it.

### 3. External-authority record

Examples may include filing receipts, regulator correspondence, preliminary/conditional approval records, deposit-insurance approval evidence, pre-opening records, and final opening/effective-status records.

The exact authority and record depend on the chosen structure. An external-authority record must be preserved exactly enough that its scope, date, conditions, and effective status are not overstated.

## Status discipline

The following are different states and must remain different in product, investor, partner, and regulatory materials:

1. Planned.
2. Drafted.
3. Internally reviewed.
4. Submitted.
5. Accepted for processing, if the authority uses that status.
6. Preliminary/conditionally approved.
7. Conditions outstanding.
8. Conditions satisfied/accepted.
9. Authorized to open, if applicable.
10. Effective charter / effective insurance / operating authority, as applicable.

A later state must never be inferred merely because an earlier state occurred.

## Authority evidence rule

For a claim that depends on a regulator or other authority, software may check that a candidate record includes required metadata such as an authority name and record date. Software still cannot conclude that:

- the record is authentic;
- the record covers the intended activity;
- the application is complete;
- conditions were satisfied;
- the approval is still effective;
- the institution is authorized to open;
- the institution may use a particular customer-facing bank or deposit-insurance claim.

Those conclusions require accountable human verification against the actual record and applicable requirements.

## Suggested private diligence-room structure

A future access-controlled diligence room could use folders or collections such as:

- `00-corporate-governance/`
- `01-business-model-market/`
- `02-management-organizers/`
- `03-capital-source-of-funds/`
- `04-business-plan-projections/`
- `05-risk-compliance-audit/`
- `06-technology-security-resilience/`
- `07-third-party-provider/`
- `08-charter-application/`
- `09-deposit-insurance/`
- `10-other-regulatory-filings/`
- `11-conditional-approvals/`
- `12-preopening-conditions/`
- `13-opening-effective-status/`
- `14-examinations-ongoing-supervision/`

Folder names are organizational suggestions only, not a regulator-prescribed filing structure.

## Evidence quality questions

Before treating any record as supporting a claim, the accountable reviewer should ask:

- Is this the original/authoritative source or an accurate controlled copy?
- Is it current?
- Does it apply to the correct legal entity and ownership structure?
- Does it apply to the exact product/activity being discussed?
- Are there conditions, limitations, geographic boundaries, dates, or dependencies?
- Has anything superseded, withdrawn, revoked, amended, or expired it?
- Does customer-facing language accurately reflect the record?
- Is independent or legal/compliance review required before relying on it?

## Current state

The machine-readable index deliberately reports:

- `verifiedClaimCount: 0`;
- no accountable human assignments complete;
- no connected evidence repository;
- no operating qualified-external-review workflow;
- no operating regulator-evidence-verification workflow;
- no software authority to mark a bank charter effective;
- no software authority to mark FDIC insurance effective;
- no software authority to authorize customer-facing bank claims.

This will remain the truthful state until real people, systems, applications, and external evidence exist.
