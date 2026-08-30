# Galactic Trust — Public Beta Launch Checklist

Use this checklist for the 24-hour public **demo/beta** launch only. It is not a live-banking launch checklist.

## Product truthfulness
- [ ] Homepage says Galactic Trust is a financial-technology demo / pre-launch product.
- [ ] Demo balances are clearly labeled as simulated/sample.
- [ ] Demo transfers explicitly state no real money moves.
- [ ] Card previews do not imply active Visa/Mastercard or issuing-bank relationships.
- [ ] Crypto trades and holdings are explicitly simulated.
- [ ] No unsupported FDIC, APY/yield, profit, approval, lending, or insurance claim appears.
- [ ] Public Beta Notice is reachable from Compliance Center.
- [ ] Privacy Center is reachable.
- [ ] Support & Safety page is reachable.

## Live-money lock
- [ ] `BANKING_MODE` is `demo` in the public beta environment.
- [ ] `BANKING_COMPLIANCE_APPROVED` is not true.
- [ ] `BANKING_DISCLOSURES_APPROVED` is not true.
- [ ] `BANKING_ENABLE_LIVE_WRITES` is not true.
- [ ] `CRYPTO_MODE` is `demo`.
- [ ] `CRYPTO_COMPLIANCE_APPROVED` is not true.
- [ ] `CRYPTO_DISCLOSURES_APPROVED` is not true.
- [ ] `CRYPTO_ENABLE_LIVE_TRADING` is not true.
- [ ] No production banking/crypto API key is required for the public beta.

## Security
- [ ] No provider secrets appear in client code or public status endpoints.
- [ ] Passwords, PINs, CVVs, OTPs, recovery phrases, and private keys are never requested by Orbit.
- [ ] Security headers are enabled in production build.
- [ ] Mutating banking/crypto routes reject untrusted origins.
- [ ] Banking partner-mode requests require a verified user boundary.
- [ ] Money-moving writes require idempotency.
- [ ] Error messages do not leak provider secrets or sensitive credentials.

## Technical release gate
- [ ] `npm run typecheck` passes.
- [ ] `npm run test:safety` passes.
- [ ] `npm run build` passes.
- [ ] GitHub CI is green on the exact release commit.
- [ ] Public beta preview renders on desktop.
- [ ] Public beta preview renders on iPhone/mobile width.
- [ ] `/` loads.
- [ ] `/privacy` loads.
- [ ] `/compliance` loads.
- [ ] `/beta-notice` loads.
- [ ] `/support` loads.
- [ ] `/api/banking/status` reports demo / live money disabled.
- [ ] `/api/crypto/status` reports demo / live trading disabled.

## Demo functional tests
- [ ] Simulated transfer succeeds without real money movement.
- [ ] Duplicate/repeated UI clicks do not produce an unintended live action.
- [ ] Demo card freeze/unfreeze works only on demo state.
- [ ] Demo crypto buy/sell works only as simulation.
- [ ] Invalid amounts fail safely.
- [ ] Assistant refuses or safely redirects requests for passwords/PIN/CVV/OTP/private keys.

## Operations
- [ ] One person is identified as release owner.
- [ ] One rollback procedure is documented.
- [ ] Production deployment target is known.
- [ ] Error monitoring/log review is available after launch.
- [ ] No secret is pasted into a public issue, PR, screenshot, chat, or document.
- [ ] User feedback collection method is defined.
- [ ] Public beta copy does not advertise unsupported real financial services.

## Sponsor-bank workstream
These do not block the **demo/beta**, but they block real banking:
- [ ] Synctera diligence call/submission started.
- [ ] Treasury Prime diligence/submission started.
- [ ] Unit diligence started.
- [ ] Increase technical/commercial fit reviewed.
- [ ] Initial geography/customer profile documented.
- [ ] Estimated customer count and transaction volume documented.
- [ ] Company/legal entity details prepared for provider diligence.
- [ ] Banking/fintech counsel identified for program/naming/disclosure review.

## Hard stop conditions
Do **not** launch even the public beta if:
- the site represents simulated balances as real deposits;
- any live-money flag is unexpectedly enabled;
- CI/build/safety checks fail;
- provider secrets are visible client-side;
- real card/account credentials appear in the demo;
- the public site claims a sponsor bank/card-network/FDIC relationship that is not actually approved.

## Definition of success
The 24-hour launch is successful when Galactic Trust is publicly available as a polished, transparent, technically green fintech demo/beta with real-money functionality locked off and a sponsor-bank diligence package ready for provider review.
