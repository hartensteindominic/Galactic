import { bankingStatus } from '../../lib/banking';
import { cryptoStatus } from '../../lib/crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function Gate({ label, value, detail }: { label: string; value: boolean; detail: string }) {
  return (
    <div className={`complianceGate ${value ? 'ready' : 'blocked'}`}>
      <span className="gateIcon">{value ? '✓' : '—'}</span>
      <span><b>{label}</b><small>{detail}</small></span>
    </div>
  );
}

export default function ComplianceCenter() {
  const banking = bankingStatus();
  const crypto = cryptoStatus();

  return (
    <main className="compliancePage">
      <nav className="complianceNav">
        <a href="/">← Galactic Trust</a>
        <span>SPONSOR-BANK READY · PRE-LAUNCH</span>
      </nav>

      <header className="complianceHero">
        <p>COMPLIANCE CENTER</p>
        <h1>Built to fail closed.</h1>
        <span>
          Galactic Trust is currently a financial-technology demo interface, not a chartered bank. Demo balances are simulated, are not customer deposits, and are not represented as FDIC-insured funds. Real banking and crypto remain disabled until the required partner, compliance, disclosure, and activation gates are all satisfied.
        </span>
      </header>

      <section className="complianceStatusGrid">
        <article className="complianceStatusCard">
          <div className="statusHeading">
            <div><small>USD / BANKING</small><h2>{banking.liveWritesEnabled ? 'Live program enabled' : 'Live money disabled'}</h2></div>
            <span className={banking.liveWritesEnabled ? 'statusLive' : 'statusSafe'}>{banking.liveWritesEnabled ? 'LIVE' : 'SAFE'}</span>
          </div>
          <Gate label="Partner program configured" value={banking.partnerConfigured} detail={banking.partnerBankName ? `Partner bank: ${banking.partnerBankName}` : 'No approved sponsor-bank program configured yet.'} />
          <Gate label="Compliance approval recorded" value={banking.complianceApproved} detail="Requires an explicit server-side approval gate." />
          <Gate label="Customer disclosures approved" value={banking.disclosuresApproved} detail="Partner-specific disclosures must be finalized before live money movement." />
          <Gate label="Live writes explicitly enabled" value={banking.liveWritesEnabled} detail="Credentials alone can never enable transfers." />
        </article>

        <article className="complianceStatusCard">
          <div className="statusHeading">
            <div><small>CRYPTO</small><h2>{crypto.liveTradingEnabled ? 'Live provider enabled' : 'Live trading disabled'}</h2></div>
            <span className={crypto.liveTradingEnabled ? 'statusLive' : 'statusSafe'}>{crypto.liveTradingEnabled ? 'LIVE' : 'SAFE'}</span>
          </div>
          <Gate label="Crypto provider configured" value={crypto.partnerConfigured} detail={crypto.providerName ? `Provider: ${crypto.providerName}` : 'No approved live trading/custody provider configured yet.'} />
          <Gate label="Compliance approval recorded" value={crypto.complianceApproved} detail="Provider and jurisdiction requirements must be approved before activation." />
          <Gate label="Customer disclosures approved" value={crypto.disclosuresApproved} detail="Crypto risk, custody, fees, eligibility, and provider disclosures must match the live program." />
          <Gate label="Live trading explicitly enabled" value={crypto.liveTradingEnabled} detail="Provider credentials alone can never enable real orders." />
        </article>
      </section>

      <section className="compliancePrinciples">
        <article>
          <span>01</span><h3>Galactic Trust is the interface</h3>
          <p>The intended operating model is a fintech/program interface. Regulated banking, deposit, payment, card, custody, or trading services must be supplied by appropriately approved providers under the final program structure.</p>
        </article>
        <article>
          <span>02</span><h3>No premature FDIC claims</h3>
          <p>Demo funds are not deposits. Any future FDIC insurance language must identify the actual insured depository institution and accurately match the approved account and pass-through insurance structure.</p>
        </article>
        <article>
          <span>03</span><h3>Crypto stays separate</h3>
          <p>Crypto assets are not bank deposits and are not FDIC insured. Real buying, selling, exchange, transmission, or custody stays disabled until the applicable provider and compliance program is approved.</p>
        </article>
        <article>
          <span>04</span><h3>Customer protection before growth</h3>
          <p>Before live onboarding, the final program must include identity verification, sanctions and fraud controls, transaction monitoring, limits, error/dispute handling, complaints, incident response, reconciliation, and auditable records.</p>
        </article>
        <article>
          <span>05</span><h3>Clear disclosures</h3>
          <p>Terms, privacy notice, fees, transfer timing, card terms, crypto risks, provider identities, customer support, and any deposit-insurance statement must match the actual approved production program.</p>
        </article>
        <article>
          <span>06</span><h3>Human approval remains required</h3>
          <p>Environment configuration, provider credentials, or deployment alone cannot activate real financial activity. Galactic Trust requires separate compliance and disclosure approval gates plus an explicit live activation flag.</p>
        </article>
      </section>

      <section className="complianceCallout">
        <div>
          <b>Current product state</b>
          <span>{banking.disclosure}</span>
          <span>{crypto.disclosure}</span>
        </div>
        <div className="complianceLinks">
          <a href="/privacy">Privacy Center</a>
          <a href="/">Return to dashboard</a>
        </div>
      </section>

      <footer className="complianceFootnote">
        This readiness center is an engineering and operational control surface, not legal advice or a regulatory approval. Final launch requirements must be reviewed against the actual partner contracts, customer flows, jurisdictions, and applicable law.
      </footer>
    </main>
  );
}
