# Security and Operator Access Plan

## Objective

Build the white-label fintech platform so sensitive operations are attributable, least-privilege, auditable, and fail-closed before any approved live banking program is enabled.

This document is an engineering/security plan, not a claim that the current prototype satisfies a particular certification framework.

## Current prototype posture

- Prototype financial data is synthetic.
- Real banking writes remain disabled.
- Production provider webhooks are disabled.
- Supabase secret/service credentials are server-only.
- Plaid Sandbox credentials are server-only.
- Prototype webhook secret is server-only.
- Browser clients receive no direct service-role database credentials.
- Prototype transfers and reconciliation reject non-simulated accounts.
- Persistent simulated transfers use idempotency keys.
- Reconciliation and provider-event evidence can be persisted in Supabase.
- API errors return correlation IDs without intentionally logging request bodies or credentials.

## Operator identity target

Before a controlled live beta, every privileged human operator should have:

1. A unique named identity; no shared admin accounts.
2. Phishing-resistant MFA where supported, preferably passkeys/security keys.
3. A narrowly scoped role.
4. Session timeout and reauthentication for high-risk actions.
5. Audit events for login, role change, account restriction, provider-setting change, feature-flag change, and security-sensitive export.
6. Immediate access revocation when the operator no longer needs the role.

## Proposed roles

### Viewer / support-read
Can:
- view customer/account status needed for support;
- view transaction state and error correlation IDs;
- view approved support notes.

Cannot:
- change financial state;
- change tenant/provider configuration;
- reveal secrets;
- disable security controls.

### Support operator
Can additionally:
- create support cases;
- trigger approved non-financial workflows;
- submit a case for higher-risk review.

Cannot independently:
- move funds;
- override KYC/fraud decisions;
- change provider credentials;
- alter reconciliation records.

### Risk/compliance operator
Capabilities must match the signed regulated-program responsibility matrix. Potential functions may include:
- review provider/risk alerts;
- apply approved account restrictions;
- record escalation decisions;
- manage cases within assigned policy.

No capability should be implemented merely because an API supports it; the partner agreement and written procedures define the allowed actions.

### Platform administrator
Can:
- manage tenant configuration;
- manage non-secret feature flags;
- view system health and audit history;
- manage operator roles under dual-control rules where required.

Cannot directly read secret values after initial secure configuration.

### Break-glass administrator
- Disabled for everyday use.
- Strong authentication required.
- Use creates a high-severity audit event and alert.
- Credentials/authorization rotated or reviewed after use.

## High-risk action controls

For production-sensitive changes, require stronger controls than ordinary UI clicks:

- explicit confirmation;
- recent reauthentication;
- change reason / ticket reference;
- audit record;
- role authorization;
- dual control for selected actions where appropriate;
- rollback plan;
- feature flag / kill switch for reversible activation.

Examples:
- enabling a production provider adapter;
- changing transfer limits;
- changing sponsor-bank/provider disclosure configuration;
- activating a new tenant on live rails;
- changing webhook verification keys/configuration;
- changing fraud/risk rules;
- privileged data export.

## Secret management

### Rules
- Never store secrets in Git, client bundles, issue bodies, screenshots, chat, or analytics.
- Use deployment-platform secret storage or a dedicated secret manager.
- Separate development, sandbox, staging, and production credentials.
- Rotate credentials on schedule and after suspected exposure.
- Prefer short-lived credentials and scoped tokens where providers support them.
- Do not expose secret values back to operators after creation unless the platform requires a controlled reveal.

### Rotation evidence
For every production secret maintain:
- owner;
- purpose;
- environment;
- created/rotated date;
- expected rotation interval;
- dependent services;
- emergency revocation procedure.

Never store the secret itself in the inventory.

## Tenant isolation

Every financial/business record must be scoped by tenant. Production hardening should add tests proving:

- tenant A cannot read tenant B records;
- tenant A cannot mutate tenant B records;
- host/domain resolution cannot switch a signed-in user into another tenant;
- provider program IDs and disclosures cannot bleed between tenants;
- audit logs preserve tenant context;
- support/admin tools enforce tenant scope server-side, not only in the UI.

## Logging and observability

### Log
- correlation/error ID;
- route/service name;
- event type;
- tenant ID/key where appropriate and permitted;
- provider reference IDs that are safe to log;
- success/failure state;
- latency;
- retry count;
- deployment/version identifier.

### Do not log
- passwords;
- PINs;
- CVVs;
- OTP/recovery codes;
- full account/card numbers;
- provider secrets/API keys;
- private cryptographic keys;
- raw identity documents;
- unnecessary request/response bodies;
- sensitive authentication headers.

## Security monitoring

Before controlled beta, alert on at least:
- repeated privileged login failures;
- break-glass access;
- secret/configuration changes;
- production feature-flag changes;
- webhook verification failures or replay spikes;
- abnormal transaction failure/return rates;
- reconciliation mismatches;
- elevated 5xx/error rates;
- suspicious data export activity;
- provider outage/degradation.

## Incident response

Maintain a tested process for:

1. Detect and classify severity.
2. Contain: disable feature/tenant/provider write path where needed.
3. Preserve logs and evidence.
4. Notify required internal/partner contacts.
5. Reconcile affected transactions/accounts.
6. Restore service safely.
7. Complete post-incident review and corrective actions.
8. Make required customer/regulatory/partner notifications according to the approved program and law.

## Environment separation

At minimum:

- **Local/demo:** synthetic data only.
- **Sandbox:** provider sandbox/test credentials only.
- **Staging/certification:** partner-approved test environment with production-like controls.
- **Production:** separately authorized credentials, domains, databases, webhooks, logs, alerts, and access policies.

Production credentials must never be copied into preview deployments.

## Pre-live operator access gate

Do not enable approved live banking writes until all of the following are true:

- unique operator identities exist;
- strong MFA is enforced for privileged roles;
- role/permission matrix is documented;
- access revocation is tested;
- privileged changes are audited;
- production secrets are managed outside source control;
- production and preview environments are separated;
- incident-response contacts/playbooks exist;
- reconciliation mismatch alerting exists;
- partner-required security controls are complete;
- a qualified security review/penetration test is completed as required by the program;
- regulated partner and internal release owners explicitly approve activation.

The goal is not merely to protect an attractive banking UI. The goal is to make every privileged action explainable, attributable, reversible where possible, and consistent with the approved financial-services program.
