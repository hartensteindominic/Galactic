import { bankingStatus } from '../../lib/banking';
import { providerSandboxDatabaseStatus } from '../../lib/banking-sandbox-database';
import { providerSandboxStatus } from '../../lib/provider-sandbox';
import { sandboxCertificationStatus } from '../../lib/sandbox-certification';
import { sandboxOperatorAuthStatus } from '../../lib/sandbox-operator-auth';
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
  const database = providerSandboxDatabaseStatus();
  const operatorAuth = sandboxOperatorAuthStatus();

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
          <Status label="Operator signing configured" ok={operatorAuth.configured} detail={operatorAuth.disclosure} />
          <Status label="Production live writes remain off" ok={!providerSandbox.productionLiveWritesEnabled} detail="Provider sandbox networking is blocked whenever production live writes are enabled." />
          <Status label="Provider sandbox calls permitted" ok={providerSandbox.networkCallsEnabled} detail={providerSandbox.disclosure} />
        </article>

        <article>
          <small>DURABLE SANDBOX DATABASE</small>
          <h2>{database.enabled ? 'Durable storage enabled' : 'Durable storage locked'}</h2>
          <Status label="Postgres connection configured" ok={database.configured} detail="Only a safe configured/not-configured boolean is shown; the database URL is never rendered." />
          <Status label="Dedicated database gate enabled" ok={database.enabledRequested} detail="A database URL alone cannot activate provider-sandbox persistence." />
          <Status label="Encrypted database connection" ok={database.sslEnabled} detail="SSL is enabled by default; disabling it is intended only for isolated local development." />
          <Status label="Production live writes remain off" ok={!database.productionLiveWritesEnabled} detail="The sandbox database factory refuses access while production live writes are enabled." />
          <Status label="Durable store available" ok={database.enabled} detail={database.disclosure} />
        </article>
      </section>

      <SandboxCertificationClient />

      <section className="sandboxArchitecture">
        <p>APPROVED PROVIDER-SANDBOX TARGET</p>
        <h2>The next step after this page is green</h2>
        <div className="sandboxFlow">
          <span>Operator-signed launch</span><i>→</i>
          <span>Provider sandbox KYC</span><i>→</i>
          <span>Sandbox deposit account</span><i>→</i>
          <span>Sandbox ACH</span><i>→</i>
          <span>Signed webhook</span><i>→</i>
          <span>Durable event inbox</span><i>→</i>
          <span>Replay-safe processing</span><i>→</i>
          <span>Double-entry ledger</span><i>→</i>
          <span>Reconciliation</span><i>→</i>
          <span>Audit evidence</span>
        </div>
        <p className="sandboxArchitectureNote">
          Provider sandbox writes are operator-signed server-to-server actions, not public beta buttons. Provider credentials and the sandbox Postgres database use independent enable gates. Production still requires the separate partner, compliance, disclosure, and live-write gates.
        </p>
      </section>

      <footer className="sandboxFooter">
        This is engineering certification evidence, not legal approval, bank certification, KYC, or a live banking program. Synthetic runner records are ephemeral; provider-sandbox certification requires the durable store and authentic provider sandbox events.
      </footer>
    </main>
  );
}
