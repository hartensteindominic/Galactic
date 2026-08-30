# Customer Terms and Disclosure Change Control

Status: prototype operating-control design  
Live financial activity: disabled  
Purpose: prevent customer-facing fees, rates, insurance language, eligibility, limits, timing, rights, and other changing financial terms from drifting across product surfaces.

## Core rule

A changing financial term must have one approved, versioned source before it can be published in a live product.

Application code, AI-generated text, a README, a design mock, a support macro, a ticket, an investor deck, or an old screenshot is **not** an approved customer-terms source merely because it contains plausible wording.

The current prototype has only `prototype-terms-v1`. It is explicitly `prototype-only`, has no effective live date, and reports `liveTermsApproved: false`.

## Terms that require controlled sourcing

At minimum:

- fees and fee-waiver conditions;
- APY, interest, yield, rewards rates, or earnings claims;
- account/program eligibility;
- transaction and card limits;
- transfer timing, holds, cutoff times, reversibility, return behavior, and availability;
- dispute/error-resolution deadlines and customer rights;
- rewards earning/redemption/expiration conditions;
- sponsor-bank / issuer / program-manager identity;
- FDIC/deposit-insurance and pass-through-insurance wording;
- crypto/provider/custody disclosures;
- account restrictions and closure conditions;
- privacy/data-use terms when legally or contractually customer-facing;
- any other term that could affect a customer's decision, legal rights, or reasonable understanding of the product.

## Prototype behavior

`lib/customer-terms-control.ts` centralizes the prototype labels/disclosures used by customer surfaces.

The current control:

- exposes a version identifier;
- marks the source `prototype-only`;
- carries no live effective date;
- marks live approval false;
- gives Orbit and the Transparency Center the same prototype language;
- throws `APPROVED_CUSTOMER_TERMS_UNAVAILABLE` if a code path requests approved live terms before a live source is implemented and approved.

This is fail-closed product plumbing. It is not legal approval.

## Future live source requirements

Before a live customer-terms adapter can be enabled, define and evidence:

1. **Source owner** — who maintains the authoritative record.
2. **Approval owner(s)** — legal/compliance/provider/sponsor approval as actually required by the program.
3. **Version** — immutable version identifier.
4. **Effective time** — when the terms become customer-effective.
5. **Tenant/program scope** — which white-label tenant, product, jurisdiction, and customer segment the version covers.
6. **Source documents** — signed program terms, approved schedules, disclosures, and provider materials supporting the published values.
7. **Change reason** — why the version changed.
8. **Diff** — machine- and human-readable comparison to the prior version.
9. **Required notice/consent** — whether customers must receive advance notice, re-consent, or another legally required communication.
10. **Rollback rule** — how to stop publication if the version is wrong without silently rewriting historical evidence.
11. **Publication evidence** — where/when the approved version was rendered to customers.
12. **Archive** — prior versions retained according to the approved record-retention schedule.

## Publication rule

For live mode, a surface that needs a changing financial term should:

1. request the currently effective approved version for the authenticated tenant/program;
2. verify the version is within scope and effective;
3. render exact structured values/disclosure blocks rather than free-form invented text;
4. include a version/reference in logs or customer evidence where appropriate;
5. fail closed or route to an approved fallback if the source cannot be validated.

Do not silently substitute hardcoded defaults when a live source is unavailable.

## Orbit / AI rule

Customer-facing automation must not generate dynamic financial terms from model memory or inference.

For changing live terms, Orbit may only:

- retrieve from the approved source;
- quote/paraphrase only within the permitted approved presentation rules;
- identify the applicable version where useful;
- escalate if the requested term is absent, ambiguous, out of scope, or requires account-specific/legal judgment.

If the approved source is unavailable, Orbit should not guess.

## Multi-tenant isolation

Terms must be scoped by tenant/program. A valid version for one white-label customer must never be published for another tenant simply because product names or fields are similar.

Tenant host binding, authenticated server tenant resolution, and customer-terms lookup must agree on the same tenant identity.

## Emergency correction

If a published term is discovered to be wrong:

- stop or quarantine the affected publication path when continued display would be harmful or misleading;
- preserve the incorrect version and publication evidence for investigation rather than deleting history;
- identify affected tenants/users/time window;
- obtain the required legal/compliance/provider direction for correction and customer notification;
- publish a corrected approved version;
- document root cause and prevention controls.

A correction is not permission to backdate an approval that did not exist.

## Release gates

Keep `approvedCustomerTermsSourceOfTruthReady` / `productionCustomerTermsSourceOfTruthApproved` false until:

- [ ] actual program/entity/jurisdiction scope is known;
- [ ] responsible owners are assigned;
- [ ] source documents and approval authority are defined;
- [ ] approved structured terms adapter is implemented;
- [ ] version/effective-time/tenant scoping is tested;
- [ ] customer notice/consent handling is defined where applicable;
- [ ] Orbit/UI consistency tests pass;
- [ ] stale-version and unavailable-source failure tests pass;
- [ ] publication evidence/archival behavior is tested;
- [ ] qualified legal/compliance and selected provider/sponsor reviews are complete as required.

Until then, only prototype terms may be rendered and they must remain explicitly non-live.