import { bankingStatus } from '../../lib/banking';
import { providerSandboxStatus } from '../../lib/provider-sandbox';
import { sandboxCertificationStatus } from '../../lib/sandbox-certification';
import { SandboxCertificationClient } from './sandbox-certification-client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function Status({ label, ok, detail }: { label: string; ok: boolean; detail: string }) {
  return (
    <div className="sandboxStatusRow">
      <span className={ok ? 'sandboxStatusGood' : 'sandboxStatusBlocked'}>{ok ? '✓' : '—'}</span>
      <span><b>{label}</b><small>{detail}</small></span>
    </div>
  );
}

export default function SandboxReadinessPage() {
  const banking = bankingStatus();
  const certification = sandboxCertificationStatus();
  const providerSandbox = providerSandboxStatus();

  return (
    <main className="sandboxPage">
      <nav className="sandboxTopNav">
        <a href="/">← Galactic Trust</a>
        <div>
          <a href="/beta-notice">Beta Notice</a>
          <a href="/compliance">Compliance</a>
          <a href="/support">Support</a>
        </div>
      </nav>

      <header className="sandboxHero">
        <p>SPONSOR-BANK SANDBOX READINESS</p>
        <h1>Prove the banking loop before connecting a bank.</h1>
        <span>
          Galactic Trust uses this zero-money certification layer to prove its customer, money-movement, webhook, ledger, idempotency, and reconciliation controls without using provider credentials or moving real funds.
        </span>
      </header>

      <section className="sandboxGuardGrid">
        <article>
          <small>CURRENT BANKING STATE</small>
          <h2>{banking.liveWritesEnabled ? 'Live writes enabled' : 'Live money remains locked'}</h2>
          <Status label="Demo mode active" ok={banking.mode === 'demo'} detail={`Current mode: ${banking.mode}`} />
          <Status label="Live writes disabled" ok={!banking.liveWritesEnabled} detail="Certification will refuse to run if live banking is enabled." />
          <Status label="Synthetic certification allowed" ok={certification.allowed} detail={certification.disclosure} />
        </article>

        <article>
          <small>CERTIFICATION SAFETY CONTRACT</small>
          <h2>Hard isolation from production</h2>
          <Status label="Synthetic objects only" ok={certification.syntheticOnly} detail="No real bank/customer objects are created." />
          <Status label="External network calls prohibited" ok={!certification.externalNetworkCallsAllowed} detail="The certification engine never calls a banking provider." />
          <Status label="Provider credentials prohibited" ok={!certification.providerCredentialsAllowed} detail="No banking API key or provider secret is consumed." />
          <Status label="Real money prohibited" ok={!certification.realMoneyAllowed} detail="The transfer is a synthetic ledger exercise only." />
        </article>

        <article>
          <small>PROVIDER SANDBOX NETWORK</small>
          <h2>{providerSandbox.networkCallsEnabled ? 'Sandbox networking enabled' : 'Sandbox networking locked'}</h2>
          <Status label="Sandbox credentials configured" ok={providerSandbox.configured} detail={providerSandbox.providerName ? `Provider: ${providerSandbox.providerName}` : 'No provider sandbox credentials are configured yet.'} />
          <Status label="Credentials isolated from production" ok={providerSandbox.credentialsIsolated} detail="Sandbox gateway, API key, and program ID must not be reused from production." />
          <Status label="Dedicated sandbox enable requested" ok={providerSandbox.enabledRequested} detail="BANKING_SANDBOX_PROVIDER_ENABLED is a sandbox-only networking switch." />
          <Status label="Production live writes remain off" ok={!providerSandbox.productionLiveWritesEnabled} detail="Provider sandbox networking is blocked whenever production live writes are enabled." />
          <Status label="Provider sandbox calls permitted" ok={providerSandbox.networkCallsEnabled} detail={providerSandbox.disclosure} />
        </article>
      </section>

      <SandboxCertificationClient />

      <section className="sandboxArchitecture">
        <p>APPROVED PROVIDER-SANDBOX TARGET</p>
        <h2>The next step after this page is green</h2>
        <div className="sandboxFlow">
          <span>Authenticated user</span><i>→</i>
          <span>Provider sandbox KYC</span><i>→</i>
          <span>Sandbox deposit account</span><i>→</i>
          <span>Sandbox ACH</span><i>→</i>
          <span>Signed webhook</span><i>→</i>
          <span>Event inbox + dedupe</span><i>→</i>
          <span>Double-entry ledger</span><i>→</i>
          <span>Reconciliation</span>
        </div>
        <p className="sandboxArchitectureNote">
          A real provider adapter must implement the server-only contract in <code>lib/banking-provider-adapter.ts</code>. Provider sandbox credentials use their own isolated environment variables and dedicated enable flag. Production still requires the independent partner, compliance, disclosure, and live-write gates.
        </p>
      </section>

      <footer className="sandboxFooter">
        This is engineering certification evidence, not legal approval, bank certification, KYC, or a live banking program. All records produced by the synthetic runner are ephemeral test data.
      </footer>
    </main>
  );
}
