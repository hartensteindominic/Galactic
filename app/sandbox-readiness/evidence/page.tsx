import { providerSandboxDatabaseStatus } from '../../../lib/banking-sandbox-database';
import { providerSandboxEvidenceStatus } from '../../../lib/provider-sandbox-evidence';
import { sandboxOperatorAuthStatus } from '../../../lib/sandbox-operator-auth';

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

export default function SandboxEvidenceReadinessPage() {
  const evidence = providerSandboxEvidenceStatus();
  const database = providerSandboxDatabaseStatus();
  const operator = sandboxOperatorAuthStatus();

  return (
    <main className="sandboxPage">
      <nav className="sandboxTopNav">
        <a href="/sandbox-readiness">← Sandbox Readiness</a>
        <div>
          <a href="/compliance">Compliance</a>
          <a href="/support">Support</a>
          <a href="/">Dashboard</a>
        </div>
      </nav>

      <header className="sandboxHero">
        <p>CERTIFICATION EVIDENCE</p>
        <h1>Integrity evidence without exposing secrets.</h1>
        <span>
          Galactic Trust can package a provider-sandbox certification run into an append-only canonical JSON manifest with an independently recomputable SHA-256 digest and a separately keyed internal HMAC signature.
        </span>
      </header>

      <section className="sandboxGuardGrid">
        <article>
          <small>EVIDENCE SIGNING</small>
          <h2>{evidence.configured ? 'Evidence signing ready' : 'Evidence signing locked'}</h2>
          <Status label="Dedicated evidence secret configured" ok={evidence.secretConfigured} detail="Only a boolean is shown; the evidence secret is never rendered." />
          <Status label="Non-secret evidence key label configured" ok={evidence.keyIdConfigured} detail={evidence.keyId ? `Key label: ${evidence.keyId}` : 'No evidence key label is configured yet.'} />
          <Status label="Evidence export permitted" ok={evidence.configured} detail={evidence.disclosure} />
        </article>

        <article>
          <small>DEPENDENCIES</small>
          <h2>Durable and operator-controlled</h2>
          <Status label="Durable sandbox database enabled" ok={database.enabled} detail="Evidence is reconstructed from append-only durable sandbox records." />
          <Status label="Operator signing + allowlist configured" ok={operator.configured} detail="Evidence generation and stored verification are operator-only server actions." />
          <Status label="Database connection remains private" ok={!database.connectionStringExposed} detail="The reviewer surface never renders the sandbox database URL." />
          <Status label="Operator identities remain private" ok={!operator.operatorIdsExposed} detail="The reviewer surface never renders the operator allowlist." />
        </article>
      </section>

      <section className="sandboxArchitecture">
        <p>WHAT THE TWO INTEGRITY VALUES MEAN</p>
        <h2>Digest and signature have different jobs</h2>
        <div className="sandboxFlow">
          <span>Durable records</span><i>→</i>
          <span>Sanitized manifest</span><i>→</i>
          <span>Canonical JSON</span><i>→</i>
          <span>SHA-256 digest</span><i>+</i>
          <span>Internal HMAC-SHA256</span><i>→</i>
          <span>Append-only bundle</span>
        </div>
        <p className="sandboxArchitectureNote">
          The SHA-256 digest can be recomputed independently from the exported manifest and detects changes. The HMAC is a Galactic internal authenticity check using a server-side secret. It is deliberately labeled <code>galactic_internal_hmac</code> and is not represented as a bank signature, regulatory approval, third-party notarization, or public-key attestation.
        </p>
      </section>

      <section className="sandboxArchitecture">
        <p>PRIVACY BOUNDARY</p>
        <h2>What is deliberately excluded</h2>
        <div className="sandboxFlow">
          <span>No API keys</span>
          <span>No webhook secrets</span>
          <span>No operator secret</span>
          <span>No database URL</span>
          <span>No raw webhook bodies</span>
          <span>No customer PII</span>
          <span>No raw provider resource IDs</span>
        </div>
        <p className="sandboxArchitectureNote">
          Provider resource/event identifiers are SHA-256 hashed before export. Production live-money authorization is explicitly false in every version-1 evidence manifest.
        </p>
      </section>

      <footer className="sandboxFooter">
        Certification evidence supports engineering diligence only. A valid bundle does not authorize production banking, deposits, ACH, cards, lending, crypto, or FDIC claims.
      </footer>
    </main>
  );
}
