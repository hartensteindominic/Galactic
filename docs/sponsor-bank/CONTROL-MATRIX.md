# Galactic Trust — Control & Responsibility Matrix

This is a diligence draft, not a final allocation of legal responsibility. Final ownership must match executed agreements and counsel-reviewed program documents.

| Control area | Galactic Trust | Sponsor bank / regulated provider | Launch status |
|---|---|---|---|
| Product UI | Owns customer experience and accurate status display | Reviews program-specific representations/disclosures as required | Demo-ready |
| Deposit custody | Does not custody customer deposits | Must provide/approve regulated account structure | Not live |
| Account/routing issuance | Displays only provider-issued data | Issues through approved bank program | Not live |
| KYC/CIP | Integrates approved flow; does not override decisions | Defines/approves program and decision ownership | Not live |
| OFAC/watchlist | Surfaces provider result and blocks prohibited actions | Defines approved screening stack and escalation | Not live |
| AML transaction monitoring | Provides application context/events | Owns or assigns regulated monitoring/escalation duties | Not live |
| Fraud controls | Device/session/application controls | Rail/account/card fraud controls and thresholds | Partial demo controls only |
| ACH | UI + orchestration only | Regulated rail access, limits, returns, settlement | Not live |
| Cards | UI/controls only after approved issuance | Issuer/BIN/network sponsorship and card program | Not live |
| Disputes | Intake/support routing as assigned | Regulated dispute and network process ownership as agreed | Not live |
| Error resolution | Customer intake + evidence as assigned | Required regulatory process/notice ownership as agreed | Not live |
| Ledger | Application event/reference ledger | Authoritative regulated ledger/system of record | Architecture defined |
| Reconciliation | Automated comparison, exceptions, evidence | Provides authoritative events/balances/reports | Architecture defined |
| Webhooks | Verify signatures, dedupe, replay protection, retries | Signs events and documents retry/event semantics | To implement with sandbox |
| Authentication | Galactic customer/session boundary | Provider authentication for API/service access | Partial |
| API credentials | Server-only secret handling | Issues/revokes credentials | Ready for sandbox pattern |
| Live enablement | Independent compliance/disclosure/live-write flags | Production approval + production credentials | Hard-disabled |
| Customer disclosures | Renders exact approved text | Provides/approves program-specific language | Not approved |
| FDIC claims | No claim unless exact program permits it | Defines applicable deposit-insurance disclosure | Not permitted in demo |
| Privacy | App privacy/data practices + vendor inventory | Supplies relevant subprocessor/data terms | Draft only |
| Complaints | Logs and routes complaints | Oversight/escalation as program requires | To implement |
| Incident response | Owns app incident response and notification path | Coordinates regulated/provider incident obligations | To implement |
| Audit logs | Application and security audit evidence | Provider/bank operational records | To implement before live |
| Crypto | Separate demo boundary | Separate approved crypto provider if later selected | Demo only |
| Lending | Not in Phase 1 | Separate licensed/regulated structure required | Out of scope |
| AI assistant | Informational/support only; no autonomous money approvals | N/A, but program restrictions must be enforced | Guardrails active |

## Four mandatory Galactic live gates
A provider integration is never considered live just because API credentials exist.

Banking must require all four:
1. `partnerConfigured = true`
2. compliance approval = true
3. disclosure approval = true
4. live writes = true

Crypto must use an equivalent independent four-gate model.

## Go-live evidence required
For each control marked Not live or To implement, the release owner must attach one of:
- executed provider/bank responsibility allocation;
- approved policy/procedure;
- successful sandbox/certification test evidence;
- counsel-approved disclosure/terms;
- production configuration evidence that does not expose secrets.

No undocumented verbal approval should unlock a live-money flag.
